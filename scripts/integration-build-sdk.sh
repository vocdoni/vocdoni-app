#!/usr/bin/env bash
# Builds vocdoni-integrator-sdk at a given ref and packs its publishable packages
# into a directory of tarballs. The tarballs are installed in place of the npm
# @vocdoni/* packages by scripts/integration-use-sdk.mjs (see integration/README.md).
#
# Usage:
#   scripts/integration-build-sdk.sh <ref> <out-dir>
#
# Output (stdout; everything else goes to stderr):
#   sha=<full commit sha>
# The tarballs land in <out-dir>. `pnpm pack` itself rewrites `workspace:` ranges to
# real versions, and each package's prepack hook (clean-package) rewrites main,
# exports and types to dist. That is why we pack instead of linking the workspace.
#
# The pnpm version is the one pinned by the SDK's packageManager field, so a
# lockfile written by a newer pnpm is installed by the same pnpm that wrote it.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <ref> <out-dir>" >&2
  exit 1
fi
ref="$1"
out_dir="$2"

# Ref grammar: the same rule is duplicated in integration-pins.sh, integration-build-image.sh and

# integration-build-sdk.sh. Keep all three in sync. No '..', no trailing '/' (not a valid git ref).

if ! [[ "$ref" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] || [[ "$ref" == *..* || "$ref" == */ ]]; then
  echo "ERROR: invalid ref '$ref'" >&2
  exit 1
fi

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

git clone --quiet --filter=blob:none --no-checkout "https://github.com/vocdoni/vocdoni-integrator-sdk.git" "$dir" >&2

# Same resolution order as integration-build-image.sh: branches and tags, then
# remote branches, then a direct fetch for refs only reachable by SHA.
resolve() {
  git -C "$dir" rev-parse --verify --quiet "$1^{commit}" 2>/dev/null || true
}
sha="$(resolve "$ref")"
if [ -z "$sha" ]; then
  sha="$(resolve "origin/$ref")"
fi
if [ -z "$sha" ] && git -C "$dir" fetch --quiet origin "$ref" >&2; then
  sha="$(resolve FETCH_HEAD)"
fi
if [ -z "$sha" ]; then
  echo "ERROR: could not resolve '$ref' in vocdoni/vocdoni-integrator-sdk" >&2
  exit 1
fi
git -C "$dir" checkout --quiet "$sha" >&2

# packageManager looks like "pnpm@11.0.0+sha512.<hash>": keep the version only.
pnpm_version="$(node -e '
  const raw = require(process.argv[1]).packageManager || ""
  const match = /^pnpm@(\d+\.\d+\.\d+[^+]*)/.exec(raw)
  if (!match) {
    console.error(`ERROR: no pnpm version in packageManager "${raw}"`)
    process.exit(1)
  }
  console.log(match[1])
' "$dir/package.json")"
pnpm=(npx --yes "pnpm@$pnpm_version")

echo "== building vocdoni-integrator-sdk@$sha with pnpm@$pnpm_version" >&2
(cd "$dir" && "${pnpm[@]}" install --frozen-lockfile) >&2
(cd "$dir" && "${pnpm[@]}" run build) >&2

mkdir -p "$out_dir"
out_dir="$(cd "$out_dir" && pwd)"
# Only tarballs from this run may count, so drop any left by an earlier one.
shopt -s nullglob
rm -f -- "$out_dir"/*.tgz

for manifest in "$dir"/packages/*/package.json; do
  if node -e 'process.exit(require(process.argv[1]).private === true ? 0 : 1)' "$manifest"; then
    continue
  fi
  echo "== packing $(dirname "${manifest#"$dir"/}")" >&2
  (cd "$(dirname "$manifest")" && "${pnpm[@]}" pack --pack-destination "$out_dir") >&2
done

tarballs=("$out_dir"/*.tgz)
if [ "${#tarballs[@]}" -eq 0 ]; then
  echo "ERROR: no tarball was produced in $out_dir" >&2
  exit 1
fi
echo "== packed ${#tarballs[@]} tarball(s) into $out_dir" >&2

printf 'sha=%s\n' "$sha"
