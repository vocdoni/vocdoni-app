#!/usr/bin/env bash
# Builds a vocdoni upstream image from source at a given ref, for running the
# integration stack against an unpublished commit. Neither upstream publishes
# per-commit images, so this is the only way to get one.
#
# Usage:
#   scripts/integration-build-image.sh <vocdoni-node|saas-backend> <ref>
#
# Output (stdout; everything else goes to stderr):
#   image=vocdoni-app-integration/<repo>:<sha>
#   sha=<full commit sha>
# Feed the image to the stack as VOCDONI_NODE_IMAGE or SAAS_BACKEND_IMAGE.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <vocdoni-node|saas-backend> <ref>" >&2
  exit 1
fi
repo="$1"
ref="$2"

case "$repo" in
  vocdoni-node | saas-backend) ;;
  *)
    echo "ERROR: unknown repo '$repo' (expected vocdoni-node or saas-backend)" >&2
    exit 1
    ;;
esac
# Ref grammar: the same rule is duplicated in integration-pins.sh, integration-build-image.sh and
# integration-build-sdk.sh. Keep all three in sync. No '..', no trailing '/' (not a valid git ref).
if ! [[ "$ref" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] || [[ "$ref" == *..* || "$ref" == */ ]]; then
  echo "ERROR: invalid ref '$ref'" >&2
  exit 1
fi

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

git clone --quiet --filter=blob:none --no-checkout "https://github.com/vocdoni/$repo.git" "$dir" >&2

# Branches and tags first, then remote branches, then a direct fetch for refs
# only reachable by SHA (e.g. a fork PR head).
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
  echo "ERROR: could not resolve '$ref' in vocdoni/$repo" >&2
  exit 1
fi
git -C "$dir" checkout --quiet "$sha" >&2

tag="vocdoni-app-integration/$repo:$sha"
echo "== building $repo@$sha" >&2
export DOCKER_BUILDKIT=1
if [ "$repo" = vocdoni-node ]; then
  docker build --platform linux/amd64 -t "$tag" "$dir" >&2
else
  go_version="$(awk '/^go [0-9]/ { print $2; exit }' "$dir/go.mod")"
  if [ -z "$go_version" ]; then
    echo "ERROR: no 'go' directive found in saas-backend go.mod" >&2
    exit 1
  fi
  docker build --platform linux/amd64 --build-arg "GOLANG_VERSION=$go_version" -t "$tag" "$dir" >&2
fi

printf 'image=%s\nsha=%s\n' "$tag" "$sha"
