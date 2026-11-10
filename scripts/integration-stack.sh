#!/usr/bin/env bash
# Manages the disposable mongo + vocone + saas-backend + MailHog stack that the
# Playwright end-to-end suite in e2e/ runs against. Used identically by a
# developer's laptop and by .github/workflows/integration.yml.
#
# Adapted from integrator-sdk's scripts/integration-stack.sh. The notable
# difference: there is no integrator-key bootstrap here. This suite registers its
# own user *through the browser* — that signup is flow #1 under test — so the
# stack only has to come up empty and seeded (or, in Stripe mode, synced).
#
# Usage:
#   scripts/integration-stack.sh up          # start the stack and seed the default plan (Stripe mode: sync it)
#   scripts/integration-stack.sh down        # tear the stack down (drops volumes)
#   scripts/integration-stack.sh run         # up, build, run the e2e suite, sweep Stripe objects, then stop
#   scripts/integration-stack.sh logs <dir>  # one redacted log file per service, written into <dir>
#
# `up` leaves the stack running (that is its job — iterate against it, browse
# the inbox). `run` is one-shot and stops the containers when it is done, unless
# the suite failed or INTEGRATION_KEEP_STACK is set.
#
# Env:
#   INTEGRATION_HOST_PORT    host port the saas-backend API is published on (default 8080)
#   INTEGRATION_MAILHOG_PORT host port the MailHog HTTP API is published on (default 8025)
#   INTEGRATION_APP_PORT     host port the app under test is served on (default 3000)
#   INTEGRATION_KEEP_STACK   set to any value to make `run` leave the stack up
#   INTEGRATION_STRIPE_SECRET_KEY  opt-in Stripe mode: a Stripe TEST secret key (sk_test_...).
#                            Creates real test-mode payments in that sandbox. See integration/README.md.
#   INTEGRATION_STRIPE_PUBLIC_KEY  the matching publishable key (pk_test_...), read by the app at boot.
#                            Required in Stripe mode: `up` fails without it.
#   INTEGRATION_STRIPE_CLI_IMAGE  stripe-cli image for stripe-listen (default: v1.55.3, pinned by digest)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/integration/docker-compose.ci.yml"
STRIPE_COMPOSE_FILE="$REPO_ROOT/integration/docker-compose.stripe.yml"
SEED_FILE="$REPO_ROOT/integration/seed-plan.js"

INTEGRATION_HOST_PORT="${INTEGRATION_HOST_PORT:-8080}"
INTEGRATION_MAILHOG_PORT="${INTEGRATION_MAILHOG_PORT:-8025}"
INTEGRATION_APP_PORT="${INTEGRATION_APP_PORT:-3000}"
export INTEGRATION_HOST_PORT INTEGRATION_MAILHOG_PORT INTEGRATION_APP_PORT

INTEGRATION_API_URL="http://localhost:${INTEGRATION_HOST_PORT}"
INTEGRATION_MAILHOG_URL="http://localhost:${INTEGRATION_MAILHOG_PORT}"

# The stripe-cli image is defined once here and read by docker-compose.stripe.yml
# through the same variable, so the script and compose cannot drift apart. Pinned
# by the digest of the multi-arch index, so a re-tagged image cannot change the run.
INTEGRATION_STRIPE_CLI_IMAGE="${INTEGRATION_STRIPE_CLI_IMAGE:-stripe/stripe-cli:v1.55.3@sha256:7bd92a6315b5716767e96727f921abedc131e60648299d4cf6b3a7d5f108b39d}"
export INTEGRATION_STRIPE_CLI_IMAGE

# Stripe mode is on when INTEGRATION_STRIPE_SECRET_KEY is set. Live keys are
# refused before anything runs, so no command can reach a production account.
STRIPE_MODE=""
if [ -n "${INTEGRATION_STRIPE_SECRET_KEY:-}" ]; then
  case "$INTEGRATION_STRIPE_SECRET_KEY" in
    sk_live_* | rk_live_*)
      echo "ERROR: INTEGRATION_STRIPE_SECRET_KEY is a live Stripe key. Use a test-mode key (sk_test_...): this stack creates and cancels real objects." >&2
      exit 1
      ;;
  esac
  case "${INTEGRATION_STRIPE_PUBLIC_KEY:-}" in
    pk_live_*)
      echo "ERROR: INTEGRATION_STRIPE_PUBLIC_KEY is a live Stripe key. Use a test-mode key (pk_test_...)." >&2
      exit 1
      ;;
  esac
  STRIPE_MODE=1
fi

# Hides the secrets stripe-cli and the api print (a `whsec_` signing secret in
# `listen` output, a key in an error) before any of their output reaches a log.
redact_stripe_secrets() {
  sed -E 's/(^|[^A-Za-z0-9_])(whsec|sk|rk|pk)_[A-Za-z0-9_]+/\1\2_[redacted]/g'
}

compose() {
  if [ -n "$STRIPE_MODE" ]; then
    docker compose -f "$COMPOSE_FILE" -f "$STRIPE_COMPOSE_FILE" "$@"
  else
    docker compose -f "$COMPOSE_FILE" "$@"
  fi
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

# Stripe mode: derives the webhook signing secret that the stripe-listen container
# signs with (the account-level one, `listen --print-secret`) and exports it for
# compose. The key reaches docker by name (-e), never on the command line.
derive_stripe_webhook_secret() {
  local secret stderr_file
  stderr_file="$(mktemp)"
  secret=$(STRIPE_API_KEY="$INTEGRATION_STRIPE_SECRET_KEY" docker run --rm -e STRIPE_API_KEY \
    "$INTEGRATION_STRIPE_CLI_IMAGE" listen --print-secret 2>"$stderr_file") || secret=""
  case "$secret" in
    whsec_*) ;;
    *)
      echo "ERROR: could not derive the Stripe webhook secret (stripe-cli --print-secret gave no whsec_ value). Check that INTEGRATION_STRIPE_SECRET_KEY is a valid test key and that docker can run $INTEGRATION_STRIPE_CLI_IMAGE. stripe-cli said:" >&2
      redact_stripe_secrets <"$stderr_file" >&2
      rm -f "$stderr_file"
      exit 1
      ;;
  esac
  rm -f "$stderr_file"
  export INTEGRATION_STRIPE_WEBHOOK_SECRET="$secret"
}

# Stripe mode has no seed to fall back on: the default plan must come from the
# Stripe product sync. Checked in mongo, not GET /plans: that endpoint lists only
# public plans, and the backend's default-plan lookup ignores visibility.
assert_stripe_default_plan() {
  local verdict
  verdict=$(compose exec -T mongo mongosh --quiet 'mongodb://root:vocdoni@localhost:27017/admin' --eval "
    const defaults = db.getSiblingDB('saasdb').plans.find({ default: true }).toArray()
    if (defaults.length !== 1) print('expected exactly one plan with default: true, found ' + defaults.length)
    else if (!String(defaults[0]._id).startsWith('prod_')) print('the default plan ' + defaults[0]._id + ' has no Stripe product id (_id must start with prod_)')
    else if (!(Number(defaults[0].features && defaults[0].features.twoFaEmail) > 0)) print('the default plan has no features.twoFaEmail quota, so the email 2FA journeys would be refused')
    else print('ok')
  " 2>/dev/null) || verdict="could not query saasdb.plans in mongo"
  if [ "$verdict" != ok ]; then
    echo "ERROR: the Stripe product sync did not produce a usable default plan: $verdict. Check the api logs, and that the sandbox has a product whose default price has metadata Default=true (integration/README.md)." >&2
    exit 1
  fi
}

# Stripe mode: stripe-listen exits at once on a bad setup (a stripe-cli that
# refuses its flags, or a key it cannot use), so check it survived startup. The
# short retry only covers the gap between `up -d` and the container settling.
assert_stripe_listener_running() {
  local waited=0
  while [ -z "$(compose ps --status running -q stripe-listen 2>/dev/null)" ]; do
    if [ "$waited" -ge 15 ]; then
      echo "ERROR: the stripe-listen container is not running, so no Stripe webhooks reach the api. Its last log lines:" >&2
      compose logs --tail 20 stripe-listen 2>&1 | redact_stripe_secrets >&2 || true
      echo "hint: check that INTEGRATION_STRIPE_SECRET_KEY is a valid sk_test_ key for the sandbox you mean to use." >&2
      return 1
    fi
    sleep 3
    waited=$((waited + 3))
  done
}

# True when this project's own containers are already running. `compose up -d`
# is idempotent, so the point of asking is the port check below: without this,
# re-running `up` on a live stack reports "port 8080 already in use" and blames
# an unrelated process, when the process holding it is ours.
stack_is_running() {
  [ -n "$(compose ps -q api 2>/dev/null)" ]
}

cmd_up() {
  if stack_is_running; then
    echo "== stack is already running; reusing it" >&2
  else
    if ! port_is_free "$INTEGRATION_HOST_PORT"; then
      echo "ERROR: host port $INTEGRATION_HOST_PORT is already in use by something else. Set INTEGRATION_HOST_PORT to a free port and retry, e.g. INTEGRATION_HOST_PORT=$((INTEGRATION_HOST_PORT + 10000))." >&2
      exit 1
    fi
    if ! port_is_free "$INTEGRATION_MAILHOG_PORT"; then
      echo "ERROR: host port $INTEGRATION_MAILHOG_PORT is already in use by something else. Set INTEGRATION_MAILHOG_PORT to a free port and retry." >&2
      exit 1
    fi
  fi

  if [ -n "$STRIPE_MODE" ]; then
    if [ -z "${INTEGRATION_STRIPE_PUBLIC_KEY:-}" ]; then
      echo "ERROR: INTEGRATION_STRIPE_SECRET_KEY is set but INTEGRATION_STRIPE_PUBLIC_KEY is not. The app needs the test publishable key (pk_test_...) to render Stripe Checkout, and the checkout spec cannot run without it." >&2
      exit 1
    fi
    derive_stripe_webhook_secret
  fi

  echo "== starting stack" >&2
  echo "== images: ${VOCDONI_NODE_IMAGE:-ghcr.io/vocdoni/vocdoni-node:main} ${SAAS_BACKEND_IMAGE:-ghcr.io/vocdoni/saas-backend:main}" >&2
  if [ -n "$STRIPE_MODE" ]; then
    echo "== billing: Stripe test sandbox, plans from the Stripe product sync" >&2
  fi
  # --remove-orphans drops a stripe-listen left behind by an earlier Stripe-mode boot on this stack.
  compose up -d --remove-orphans

  echo "== waiting for mongo and vocone to be healthy" >&2
  wait_container_healthy mongo 60
  if [ -n "$STRIPE_MODE" ]; then
    # Mongo's data lives in an anonymous volume: `run` keeps it, `down -v` drops it. A
    # local-dev plan seeded by an earlier default-mode boot would pass the default-plan
    # check below, so drop it.
    compose exec -T mongo mongosh --quiet 'mongodb://root:vocdoni@localhost:27017/admin' \
      --eval "db.getSiblingDB('saasdb').plans.deleteOne({ _id: 'local-dev' })" >/dev/null
  fi
  # Kept above vocone's own healthcheck window (~420s, see the compose file):
  # `compose up -d` already gates on that via depends_on/service_healthy, so
  # this is only a backstop for the case where the container is healthy-but-slow
  # to report. Do not tighten it below the compose window.
  wait_container_healthy vocone 450

  if [ -n "$STRIPE_MODE" ]; then
    echo "== skipping plan seed: plans come from the Stripe product sync" >&2
  else
    echo "== seeding default plan" >&2
    compose exec -T mongo mongosh --quiet 'mongodb://root:vocdoni@localhost:27017/admin' <"$SEED_FILE"
    # A Stripe-mode run on this same running stack leaves synced plans behind, and a second
    # default plan beside local-dev breaks organization creation. The seed does not remove them.
    compose exec -T mongo mongosh --quiet 'mongodb://root:vocdoni@localhost:27017/admin' \
      --eval "db.getSiblingDB('saasdb').plans.deleteMany({ _id: /^prod_/ })" >/dev/null
  fi

  echo "== waiting for api to answer /ping" >&2
  wait_url_ready "$INTEGRATION_API_URL/ping" "api" 60

  if [ -n "$STRIPE_MODE" ]; then
    assert_stripe_listener_running
    echo "== asserting the default plan from the Stripe sync" >&2
  else
    echo "== asserting the plan seed took" >&2
  fi

  PLANS_JSON=$(curl -fsS -m 10 "$INTEGRATION_API_URL/plans" || echo "")
  # Separate "could not ask" from "asked, got nothing". Without this the seed
  # assertion below blames db.Plan bson tags for what is really a dead API.
  if [ -z "$PLANS_JSON" ]; then
    echo "ERROR: GET $INTEGRATION_API_URL/plans did not respond — the api container is not serving. This is NOT a seed problem; check the api logs." >&2
    exit 1
  fi
  if [ -n "$STRIPE_MODE" ]; then
    assert_stripe_default_plan
  else
    # Parsed with node, not python3: node is already a hard requirement of this
    # repo (this script ends by running pnpm), so this adds no new dependency —
    # whereas python3 is not guaranteed on a contributor's machine.
    PLANS_COUNT=$(printf '%s' "$PLANS_JSON" | node -e "
let raw = ''
process.stdin.on('data', (chunk) => (raw += chunk))
process.stdin.on('end', () => {
  try {
    const parsed = JSON.parse(raw)
    console.log(Array.isArray(parsed) ? parsed.length : 0)
  } catch {
    console.log(0)
  }
})
" 2>/dev/null || echo 0)
    if [ "${PLANS_COUNT:-0}" -lt 1 ] 2>/dev/null; then
      echo "plan seed did not take — check db.Plan bson tags against integration/seed-plan.js" >&2
      exit 1
    fi
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
  # --remove-orphans also removes stripe-listen when this run is not in Stripe mode.
  compose down -v --remove-orphans
}

# One log file per service, redacted. Written even when a service is silent, so the
# artifact always lists the same files. The raw `docker compose logs` of stripe-listen
# holds the whsec_ signing secret, so never copy those.
cmd_logs() {
  local dir="${1:-}"
  if [ -z "$dir" ]; then
    echo "usage: $0 logs <dir>" >&2
    exit 1
  fi
  mkdir -p "$dir"
  local services=(api vocone mongo mailhog)
  if [ -n "$STRIPE_MODE" ]; then
    services+=(stripe-listen)
  fi
  local service
  for service in "${services[@]}"; do
    { compose logs --no-color "$service" 2>&1 || true; } | redact_stripe_secrets >"$dir/$service.log"
  done
}

cmd_run() {
  # Stripe mode's sweep takes only the checkout sessions created from here on, so it
  # never touches objects from an earlier run on the same sandbox.
  local since
  since="$(date +%s)"
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

  local status=0
  pnpm test:e2e || status=$?

  if [ -n "$STRIPE_MODE" ]; then
    # Best effort: the sweep is a backstop, so it must not change the run's status. It runs
    # before the teardown below, because it asks the running stack which organizations are its own.
    node "$REPO_ROOT/scripts/integration-stripe-sweep.mjs" --since "$since" || true
  fi

  # `run` is the one-shot command, so it cleans up after itself rather than
  # leaving four containers running on a laptop. Two deliberate exceptions:
  #
  #  - On failure the stack stays UP. The inbox and the container logs are the
  #    evidence you need to diagnose a failed run, and tearing them down would
  #    destroy exactly that.
  #  - It stops with `compose down`, NOT `down -v`. Keeping the volume preserves
  #    vocone's cached zk circuit artifacts, so the next boot skips a slow (and
  #    known-flaky) download. `scripts/integration-stack.sh down` is the explicit
  #    full clean, and is what CI uses.
  if [ -n "${INTEGRATION_KEEP_STACK:-}" ]; then
    echo "== INTEGRATION_KEEP_STACK set — leaving the stack up. Inbox: $INTEGRATION_MAILHOG_URL" >&2
  elif [ "$status" -ne 0 ]; then
    echo "== suite FAILED — leaving the stack up so you can inspect it:" >&2
    echo "     inbox: $INTEGRATION_MAILHOG_URL" >&2
    echo "     logs:  scripts/integration-stack.sh logs <dir>   (redacted, one file per service)" >&2
    echo "     stop:  scripts/integration-stack.sh down" >&2
  else
    echo "== suite passed — stopping containers (volumes kept for a fast next boot)" >&2
    compose down --remove-orphans
  fi

  return "$status"
}

case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  run) cmd_run ;;
  logs) cmd_logs "${2:-}" ;;
  *)
    echo "usage: $0 {up|down|run|logs <dir>}" >&2
    exit 1
    ;;
esac
