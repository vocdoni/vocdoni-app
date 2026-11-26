#!/bin/sh
# Uploads the client source maps to PostHog error tracking, then deletes every
# .map from dist so they are never served. Without POSTHOG_CLI_API_KEY it only
# deletes them, so local and fork builds keep working.
set -eu

DIST_DIR="${1:-dist}"
CLI="npx -y @posthog/cli@0.19.0 --host ${POSTHOG_CLI_HOST:-https://eu.posthog.com}"

if [ -n "${POSTHOG_CLI_API_KEY:-}" ]; then
  export POSTHOG_CLI_PROJECT_ID="${POSTHOG_CLI_PROJECT_ID:-234248}"
  $CLI sourcemap inject --directory "$DIST_DIR/client"
  $CLI sourcemap upload --directory "$DIST_DIR/client"
else
  echo "POSTHOG_CLI_API_KEY not set: skipping source map upload."
fi

find "$DIST_DIR" -name '*.map' -type f -delete
