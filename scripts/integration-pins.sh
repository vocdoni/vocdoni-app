#!/usr/bin/env bash
# Parses a `/integration` PR comment into the upstream refs to build for the
# integration stack. Only the first line counts; every key is optional.
#
# Usage:
#   printf '%s' "$COMMENT_BODY" | scripts/integration-pins.sh
#
# Example first line: /integration vocdoni-node=1a2b3c4 saas-backend=feat/wallets integrator-sdk=main
#
# Env: none. Input: the comment body on stdin.
# Output (stdout, exit 0):
#   vocdoni_node_ref=<ref or empty>
#   saas_backend_ref=<ref or empty>
#   integrator_sdk_ref=<ref or empty>
# Errors go to stderr with exit 1. The ref grammar blocks leading '-', '..' and a
# trailing '/', so a ref can never be read by git or docker as an option or a path escape.
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

IFS= read -r line || true
line="${line%$'\r'}"

if ! [[ "$line" =~ ^/integration([[:space:]]|$) ]]; then
  fail "first line must start with '/integration' (got '$line')"
fi

tokens=()
read -ra tokens <<<"${line#/integration}" || true

node_ref=""
saas_ref=""
sdk_ref=""
seen_node=0
seen_saas=0
seen_sdk=0
for tok in ${tokens[@]+"${tokens[@]}"}; do
  if [[ "$tok" != *=* ]]; then
    fail "'$tok' is not key=ref"
  fi
  key="${tok%%=*}"
  ref="${tok#*=}"
  case "$key" in
    vocdoni-node)
      [ "$seen_node" = 0 ] || fail "vocdoni-node given twice"
      seen_node=1
      node_ref="$ref"
      ;;
    saas-backend)
      [ "$seen_saas" = 0 ] || fail "saas-backend given twice"
      seen_saas=1
      saas_ref="$ref"
      ;;
    integrator-sdk)
      [ "$seen_sdk" = 0 ] || fail "integrator-sdk given twice"
      seen_sdk=1
      sdk_ref="$ref"
      ;;
    *)
      fail "unknown key '$key' (expected vocdoni-node, saas-backend or integrator-sdk)"
      ;;
  esac
  [ -n "$ref" ] || fail "empty ref for '$key'"
  # Ref grammar: the same rule is duplicated in integration-pins.sh, integration-build-image.sh and
  # integration-build-sdk.sh. Keep all three in sync. No '..', no trailing '/' (not a valid git ref).
  if ! [[ "$ref" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] || [[ "$ref" == *..* || "$ref" == */ ]]; then
    fail "invalid ref '$ref' for '$key'"
  fi
done

printf 'vocdoni_node_ref=%s\nsaas_backend_ref=%s\nintegrator_sdk_ref=%s\n' "$node_ref" "$saas_ref" "$sdk_ref"
