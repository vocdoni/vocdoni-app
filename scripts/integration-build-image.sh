#!/usr/bin/env bash
# Builds a vocdoni upstream image from source at a given ref, for running the
# integration stack against an unpublished commit. Neither upstream publishes
# per-commit images, so this is the only way to get one.
#
# Usage:
#   scripts/integration-build-image.sh <vocdoni-node|saas-backend> <ref|#PR>
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
# Ref grammar: the same rule is duplicated in integration-pins.sh and
# integration-build-sdk.sh. Keep all three in sync.
if ! [[ "$ref" =~ ^#[0-9]{1,9}$ || "$ref" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] || [[ "$ref" == *..* ]]; then
  echo "ERROR: invalid ref '$ref'" >&2
  exit 1
fi

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

# Resolves the ref with git alone, then shallow-fetches exactly that commit. saas-backend is
# private and reached over SSH: with SAAS_BACKEND_DEPLOY_KEY (its read-only deploy key) in CI,
# with the caller's own SSH access otherwise. A throwaway repo fetches every branch, tag and PR
# head without trees or blobs, so rev-parse can resolve a #N, branch, tag or short/full SHA.
url="https://github.com/vocdoni/$repo.git"
if [ "$repo" = saas-backend ]; then
  url="git@github.com:vocdoni/$repo.git"
  if [ -n "${SAAS_BACKEND_DEPLOY_KEY:-}" ]; then
    printf '%s\n' "$SAAS_BACKEND_DEPLOY_KEY" > "$dir/deploy_key"
    chmod 600 "$dir/deploy_key"
    echo "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl" > "$dir/known_hosts"
    export GIT_SSH_COMMAND="ssh -i $dir/deploy_key -o IdentitiesOnly=yes -o UserKnownHostsFile=$dir/known_hosts"
  fi
fi
refs="$dir/refs"
git init --quiet "$refs" >&2
git -C "$refs" fetch --quiet --filter=tree:0 --update-head-ok "$url" \
  '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*' '+refs/pull/*/head:refs/pull/*' >&2
rev="$ref"
if [[ "$ref" == \#* ]]; then
  rev="refs/pull/${ref:1}"
fi
sha="$(git -C "$refs" rev-parse --verify --quiet "$rev^{commit}" || true)"
if ! [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "ERROR: could not resolve '$ref' in vocdoni/$repo" >&2
  exit 1
fi
src="$dir/src"
git init --quiet "$src" >&2
git -C "$src" fetch --quiet --depth 1 "$url" "$sha" >&2
git -C "$src" checkout --quiet FETCH_HEAD >&2

tag="vocdoni-app-integration/$repo:$sha"
echo "== building $repo@$sha" >&2
export DOCKER_BUILDKIT=1
if [ "$repo" = vocdoni-node ]; then
  docker build --platform linux/amd64 -t "$tag" "$src" >&2
else
  go_version="$(awk '/^go [0-9]/ { print $2; exit }' "$src/go.mod")"
  if [ -z "$go_version" ]; then
    echo "ERROR: no 'go' directive found in saas-backend go.mod" >&2
    exit 1
  fi
  docker build --platform linux/amd64 --build-arg "GOLANG_VERSION=$go_version" -t "$tag" "$src" >&2
fi

printf 'image=%s\nsha=%s\n' "$tag" "$sha"
