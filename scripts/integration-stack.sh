#!/usr/bin/env bash
# Manages the disposable mongo + vocone + saas-backend + MailHog stack that the
# Playwright end-to-end suite in e2e/ runs against. Used identically by a
# developer's laptop and by .github/workflows/integration.yml.
#
# Adapted from integrator-sdk's scripts/integration-stack.sh. The notable
# difference: there is no integrator-key bootstrap here. This suite registers its
# own user *through the browser* — that signup is flow #1 under test — so the
# stack only has to come up empty and seeded.
#
# Usage:
#   scripts/integration-stack.sh up    # start the stack and seed the default plan
#   scripts/integration-stack.sh down  # tear the stack down (drops volumes)
#   scripts/integration-stack.sh run   # up, then build and run the e2e suite
#
# Env:
#   INTEGRATION_HOST_PORT    host port the saas-backend API is published on (default 8080)
#   INTEGRATION_MAILHOG_PORT host port the MailHog HTTP API is published on (default 8025)
#   INTEGRATION_APP_PORT     host port the app under test is served on (default 3000)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/integration/docker-compose.ci.yml"
SEED_FILE="$REPO_ROOT/integration/seed-plan.js"

INTEGRATION_HOST_PORT="${INTEGRATION_HOST_PORT:-8080}"
INTEGRATION_MAILHOG_PORT="${INTEGRATION_MAILHOG_PORT:-8025}"
INTEGRATION_APP_PORT="${INTEGRATION_APP_PORT:-3000}"
export INTEGRATION_HOST_PORT INTEGRATION_MAILHOG_PORT INTEGRATION_APP_PORT

INTEGRATION_API_URL="http://localhost:${INTEGRATION_HOST_PORT}"
INTEGRATION_MAILHOG_URL="http://localhost:${INTEGRATION_MAILHOG_PORT}"

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

# True (exit 0) if nothing is listening on 127.0.0.1:$1. Uses bash's built-in
# /dev/tcp pseudo-device so no extra tooling (lsof, nc...) is required on
# either a laptop or a GitHub runner.
#
# The probe runs in a subshell, so the descriptor it opens dies with that
# subshell and there is nothing to clean up here. Do NOT add an `exec 3>&- ...`
# cleanup line: `exec` with redirections and no command applies them to the
# *current shell* permanently, so a trailing `2>/dev/null` on it silently
# discards every later error message in this script — including the "port is
# already in use" one immediately below.
port_is_free() {
  local port="$1"
  if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
    return 1
  fi
  return 0
}

wait_container_healthy() {
  local service="$1" timeout_s="$2" waited=0
  local cid
  cid=$(compose ps -q "$service")
  if [ -z "$cid" ]; then
    echo "ERROR: service '$service' is not running" >&2
    return 1
  fi
  while true; do
    local status
    status=$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo "unknown")
    [ "$status" = "healthy" ] && return 0
    if [ "$waited" -ge "$timeout_s" ]; then
      echo "ERROR: service '$service' did not become healthy within ${timeout_s}s (last status: $status)" >&2
      return 1
    fi
    sleep 3
    waited=$((waited + 3))
  done
}

wait_url_ready() {
  local url="$1" label="$2" timeout_s="$3" waited=0
  while true; do
    if curl -fsS -m 5 "$url" -o /dev/null 2>/dev/null; then
      return 0
    fi
    if [ "$waited" -ge "$timeout_s" ]; then
      echo "ERROR: $label did not answer GET $url within ${timeout_s}s" >&2
      return 1
    fi
    sleep 3
    waited=$((waited + 3))
  done
}

cmd_up() {
  if ! port_is_free "$INTEGRATION_HOST_PORT"; then
    echo "ERROR: host port $INTEGRATION_HOST_PORT is already in use. Set INTEGRATION_HOST_PORT to a free port and retry, e.g. INTEGRATION_HOST_PORT=$((INTEGRATION_HOST_PORT + 10000))." >&2
    exit 1
  fi
  if ! port_is_free "$INTEGRATION_MAILHOG_PORT"; then
    echo "ERROR: host port $INTEGRATION_MAILHOG_PORT is already in use. Set INTEGRATION_MAILHOG_PORT to a free port and retry." >&2
    exit 1
  fi

  echo "== starting stack" >&2
  compose up -d

  echo "== waiting for mongo and vocone to be healthy" >&2
  wait_container_healthy mongo 60
  # Kept above vocone's own healthcheck window (~420s, see the compose file):
  # `compose up -d` already gates on that via depends_on/service_healthy, so
  # this is only a backstop for the case where the container is healthy-but-slow
  # to report. Do not tighten it below the compose window.
  wait_container_healthy vocone 450

  echo "== seeding default plan" >&2
  compose exec -T mongo mongosh --quiet 'mongodb://root:vocdoni@localhost:27017/admin' <"$SEED_FILE"

  echo "== waiting for api to answer /ping" >&2
  wait_url_ready "$INTEGRATION_API_URL/ping" "api" 60

  echo "== asserting the plan seed took" >&2
  PLANS_JSON=$(curl -fsS -m 10 "$INTEGRATION_API_URL/plans" || echo "")
  # Separate "could not ask" from "asked, got nothing". Without this the seed
  # assertion below blames db.Plan bson tags for what is really a dead API.
  if [ -z "$PLANS_JSON" ]; then
    echo "ERROR: GET $INTEGRATION_API_URL/plans did not respond — the api container is not serving. This is NOT a seed problem; check the api logs." >&2
    exit 1
  fi
  PLANS_COUNT=$(printf '%s' "$PLANS_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    print(0)
else:
    print(len(d) if isinstance(d, list) else 0)
" 2>/dev/null || echo 0)
  if [ "${PLANS_COUNT:-0}" -lt 1 ] 2>/dev/null; then
    echo "plan seed did not take — check db.Plan bson tags against integration/seed-plan.js" >&2
    exit 1
  fi

  echo "== waiting for the MailHog inbox" >&2
  wait_url_ready "$INTEGRATION_MAILHOG_URL/api/v2/messages?limit=1" "mailhog" 60

  echo "SAAS_URL=$INTEGRATION_API_URL"
  echo "MAILHOG_URL=$INTEGRATION_MAILHOG_URL"
  echo "== stack ready. Browse the inbox at $INTEGRATION_MAILHOG_URL" >&2

  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    {
      echo "saas_url=$INTEGRATION_API_URL"
      echo "mailhog_url=$INTEGRATION_MAILHOG_URL"
    } >>"$GITHUB_OUTPUT"
  fi
}

cmd_down() {
  compose down -v
}

cmd_run() {
  # cmd_up is called DIRECTLY, not as `out=$(cmd_up)`: bash disables errexit
  # inside a command substitution that feeds an assignment, so every failure in
  # cmd_up (compose up, health waits, the seed, the /ping wait) would be
  # swallowed and we would run the suite against a stack that never came up —
  # reporting a misleading "plan seed did not take" instead of the real cause.
  cmd_up
  export SAAS_URL="$INTEGRATION_API_URL"
  export MAILHOG_URL="$INTEGRATION_MAILHOG_URL"
  export APP_URL="http://localhost:${INTEGRATION_APP_PORT}"
  cd "$REPO_ROOT"
  # The suite runs against the production SSR bundle (`pnpm serve:ssr`, booted by
  # Playwright's webServer), so it needs a build first.
  pnpm build
  pnpm test:e2e
}

case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  run) cmd_run ;;
  *)
    echo "usage: $0 {up|down|run}" >&2
    exit 1
    ;;
esac
