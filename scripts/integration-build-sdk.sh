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

# Ref grammar: the same rule is duplicated in integration-pins.sh and
# integration-build-image.sh. Keep all three in sync.
if ! [[ "$ref" =~ ^#[0-9]{1,9}$ || "$ref" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] || [[ "$ref" == *..* ]]; then
  echo "ERROR: invalid ref '$ref'" >&2
  exit 1
fi

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

# Resolves the ref through the GitHub API, then shallow-fetches exactly that commit.
# A #N ref reads the PR's head SHA; a branch, tag or short/full SHA goes via commits.
auth=()
if [ -n "${GH_TOKEN:-}" ]; then
  auth=(-H "Authorization: Bearer $GH_TOKEN")
fi
body="$dir/resolve.txt"
if [[ "$ref" == \#* ]]; then
  command -v jq >/dev/null || {
    echo "ERROR: jq is required to resolve '$ref'" >&2
    exit 1
  }
  if curl -fsSL ${auth[@]+"${auth[@]}"} -H 'Accept: application/vnd.github+json' \
    "https://api.github.com/repos/vocdoni/vocdoni-integrator-sdk/pulls/${ref:1}" -o "$body"; then
    sha="$(jq -r '.head.sha // empty' "$body")"
  else
    sha=""
  fi
elif curl -fsSL ${auth[@]+"${auth[@]}"} -H 'Accept: application/vnd.github.sha' \
  "https://api.github.com/repos/vocdoni/vocdoni-integrator-sdk/commits/$ref" -o "$body"; then
  sha="$(cat "$body")"
else
  sha=""
fi
rm -f "$body"
if ! [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "ERROR: could not resolve '$ref' in vocdoni/vocdoni-integrator-sdk" >&2
  exit 1
fi
git -C "$dir" init --quiet >&2
git -C "$dir" fetch --quiet --depth 1 "https://github.com/vocdoni/vocdoni-integrator-sdk.git" "$sha" >&2
git -C "$dir" checkout --quiet FETCH_HEAD >&2

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
