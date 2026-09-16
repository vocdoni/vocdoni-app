#!/usr/bin/env bash
#
# Build the app image, run it in a resource-constrained container, and drive a
# ramp of increasing concurrency against it with loadgen.mjs until it starts to
# fail. Captures per-level results (JSON) and container resource stats, and
# reports the concurrency level at which the server begins to crack.
#
# Usage:
#   stress/run-stress.sh [options]
#
# Options (all optional; sensible defaults):
#   --cpus N          container CPU limit           (default 1)
#   --memory M        container memory limit         (default 512m)
#   --path P          request path to hammer         (default /en — SPA, no backend)
#   --levels "L..."   space-separated concurrency levels
#                                                    (default "50 100 250 500 1000 1500 2000 3000")
#   --duration S      seconds per level              (default 20)
#   --warmup S        warmup seconds per level        (default 3)
#   --no-keepalive    force a new connection per request
#   --image NAME      image tag to build/use         (default vocdoni-ui-stress:latest)
#   --skip-build      reuse an existing image
#   --keep            leave the container running on exit
#   --host-port P     host port to map               (default 3000)
#
# Requires: docker, node (>=18), curl.
set -uo pipefail

# --- defaults ---------------------------------------------------------------
CPUS=1
MEMORY=512m
REQ_PATH="/en"
LEVELS="50 100 250 500 1000 1500 2000 3000"
DURATION=20
WARMUP=3
KEEPALIVE=1
IMAGE=vocdoni-ui-stress:latest
SKIP_BUILD=0
KEEP=0
HOST_PORT=3000

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"

# --- arg parsing ------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cpus) CPUS="$2"; shift 2;;
    --memory) MEMORY="$2"; shift 2;;
    --path) REQ_PATH="$2"; shift 2;;
    --levels) LEVELS="$2"; shift 2;;
    --duration) DURATION="$2"; shift 2;;
    --warmup) WARMUP="$2"; shift 2;;
    --no-keepalive) KEEPALIVE=0; shift;;
    --image) IMAGE="$2"; shift 2;;
    --skip-build) SKIP_BUILD=1; shift;;
    --keep) KEEP=1; shift;;
    --host-port) HOST_PORT="$2"; shift 2;;
    -h|--help) sed -n '2,40p' "$0"; exit 0;;
    *) echo "Unknown option: $1" >&2; exit 1;;
  esac
done

if [[ ! "$LEVELS" =~ [^[:space:]] ]]; then
  printf '%s\n' 'At least one concurrency level is required.' >&2
  exit 1
fi

mkdir -p "$RESULTS_DIR" || exit 1
# Reserve a unique namespace for both artifacts and the container, even when
# multiple configurations start within the same second.
RESULTS_DIR=$(mktemp -d "$RESULTS_DIR/$(date +%Y%m%d-%H%M%S)-XXXXXX") || exit 1
RUN_ID="${RESULTS_DIR##*/}"
CONTAINER="vocdoni-ui-stress-$RUN_ID"
SUMMARY="$RESULTS_DIR/summary-$RUN_ID.txt"
JSONL="$RESULTS_DIR/results-$RUN_ID.jsonl"
STATS_LOG="$RESULTS_DIR/dockerstats-$RUN_ID.log"
LOADGEN_OUT="$RESULTS_DIR/loadgen-$RUN_ID.out"

log() { echo -e "$*" | tee -a "$SUMMARY"; }

cleanup() {
  # A signal to the parent must also stop its active build/load generator.
  for pid in "${BUILD_PID:-}" "${LOADGEN_PID:-}" "${STATS_PID:-}"; do
    if [[ -n "$pid" ]]; then
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  if [[ "$KEEP" -eq 0 ]]; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1
  else
    log "\nContainer left running as: $CONTAINER (port $HOST_PORT)"
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# --- build ------------------------------------------------------------------
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "==> Building image $IMAGE (this can take a few minutes)…"
  docker build -t "$IMAGE" "$REPO_DIR" >>"$RESULTS_DIR/build-$RUN_ID.log" 2>&1 &
  BUILD_PID=$!
  if ! wait "$BUILD_PID"; then
    BUILD_PID=""
    log "!! Build failed. See $RESULTS_DIR/build-$RUN_ID.log"
    exit 1
  fi
  BUILD_PID=""
else
  log "==> Skipping build, using existing image $IMAGE"
fi

# --- run container ----------------------------------------------------------
log "==> Starting container: cpus=$CPUS memory=$MEMORY port=$HOST_PORT"
if ! docker run -d --name "$CONTAINER" \
  --cpus="$CPUS" --memory="$MEMORY" --memory-swap="$MEMORY" \
  -e NODE_ENV=production -e PORT=3000 \
  -p "$HOST_PORT:3000" \
  "$IMAGE" >/dev/null; then
  log "!! Container failed to start. Check the Docker error above (including host port availability)."
  exit 1
fi

# --- wait for readiness -----------------------------------------------------
BASE="http://localhost:$HOST_PORT"
log "==> Waiting for server readiness at $BASE$REQ_PATH …"
ready=0
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$BASE$REQ_PATH" 2>/dev/null)
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    ready=1
    log "    ready after ${i}s (HTTP $code)"
    if [[ "$code" == 3* ]]; then
      log "!! Target returns a redirect. Redirects are not followed; use the canonical path to measure rendering."
    fi
    break
  fi
  if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
    log "!! Container exited during startup. Logs:"
    docker logs --tail 30 "$CONTAINER" 2>&1 | tee -a "$SUMMARY"
    exit 1
  fi
  sleep 1
done
if [[ "$ready" -eq 0 ]]; then
  log "!! Server did not become ready in 60s. Logs:"
  docker logs --tail 30 "$CONTAINER" 2>&1 | tee -a "$SUMMARY"
  exit 1
fi

# Stream container resource usage in the background for the whole run.
# Track Docker itself so cleanup also stops the collector when --keep is used.
docker stats --no-trunc --format \
  '{{.Name}} cpu={{.CPUPerc}} mem={{.MemUsage}} ({{.MemPerc}}) net={{.NetIO}} pids={{.PIDs}}' \
  "$CONTAINER" >>"$STATS_LOG" 2>&1 &
STATS_PID=$!

# --- helper: liveness / restart detection -----------------------------------
container_alive() { docker ps --format '{{.Names}}' | grep -q "^$CONTAINER$"; }
container_restarts() { docker inspect -f '{{.RestartCount}}' "$CONTAINER" 2>/dev/null || echo 0; }

KA_FLAG=""
[[ "$KEEPALIVE" -eq 0 ]] && KA_FLAG="--no-keepalive"

log "\n================ STRESS RAMP ================"
log "target: $BASE$REQ_PATH   keepalive: $([[ $KEEPALIVE -eq 1 ]] && echo yes || echo no)"
log "levels: $LEVELS   duration: ${DURATION}s   warmup: ${WARMUP}s"
log "============================================\n"
printf '%-8s %-9s %-8s %-8s %-8s %-8s %-9s %-9s %-8s\n' \
  "conc" "rps" "ok" "3xx" "non2xx" "errors" "p90(ms)" "p99(ms)" "verdict" | tee -a "$SUMMARY"

CRASH_LEVEL=""
LAST_LEVEL=""
RUN_ERROR=""
for c in $LEVELS; do
  if ! container_alive; then
    if [[ -n "$LAST_LEVEL" ]]; then
      CRASH_LEVEL="$LAST_LEVEL"
      log "!! Container is no longer running before level $c — it crashed after level $LAST_LEVEL."
    else
      RUN_ERROR="Container stopped before any concurrency level was tested."
    fi
    break
  fi
  restarts_before=$(container_restarts)
  LAST_LEVEL="$c"

  node "$SCRIPT_DIR/loadgen.mjs" --url "$BASE$REQ_PATH" \
    --concurrency "$c" --duration "$DURATION" --warmup "$WARMUP" $KA_FLAG \
    --label "c$c" >"$LOADGEN_OUT" 2>>"$RESULTS_DIR/loadgen-$RUN_ID.err" &
  LOADGEN_PID=$!
  if ! wait "$LOADGEN_PID"; then
    LOADGEN_PID=""
    RUN_ERROR="Load generator failed at concurrency $c. See $RESULTS_DIR/loadgen-$RUN_ID.err"
    break
  fi
  LOADGEN_PID=""
  JSON=$(sed -n 's/^RESULT_JSON //p' "$LOADGEN_OUT")

  if [[ -z "$JSON" ]]; then
    RUN_ERROR="No result from load generator at concurrency $c."
    break
  fi
  echo "$JSON" >>"$JSONL"

  restarts_after=$(container_restarts)
  if ! METRICS=$(printf '%s' "$JSON" | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try {
        const j=JSON.parse(s);
        const values=[j.rps,j.ok2xx,j.redirect3xx,j.non2xx,j.errors,j.latencyMs?.p90,j.latencyMs?.p99];
        if (!Number.isSafeInteger(j.requests) || j.requests <= 0 ||
            values.some(v=>!Number.isFinite(v) || v < 0)) {
          throw new Error("Missing, invalid, or empty measurement");
        }
        const localErrors=["EMFILE","ENFILE","EADDRNOTAVAIL","ENOBUFS","ENOMEM"];
        const exhausted=localErrors.filter(code=>(j.errorBreakdown?.[code] || 0) > 0);
        if (exhausted.length) throw new Error("Load generator resource exhaustion: " + exhausted.join(", "));
        const pct=(j.errors+j.non2xx)/j.requests*100;
        // Classify the original value, not a display-rounded percentage.
        const verdict=pct >= 10 ? "CRASH" : pct >= 1 ? "DEGRADED" : "OK";
        console.log([...values,verdict].join(" "));
      } catch(e) {
        console.error(e.message);
        process.exitCode=1;
      }
    });' 2>>"$RESULTS_DIR/loadgen-$RUN_ID.err"); then
    RUN_ERROR="Invalid benchmark at concurrency $c. See $RESULTS_DIR/loadgen-$RUN_ID.err"
    break
  fi
  read -r rps ok redirects non2xx errors p90 p99 verdict <<<"$METRICS"

  # Container death/restarts override the unrounded HTTP failure verdict.
  if ! container_alive; then verdict="DOWN"
  elif [[ "$restarts_after" != "$restarts_before" ]]; then verdict="RESTARTED"
  fi
  crashed=0
  [[ "$verdict" =~ ^(DOWN|RESTARTED|CRASH)$ ]] && crashed=1

  printf '%-8s %-9s %-8s %-8s %-8s %-8s %-9s %-9s %-8s\n' \
    "$c" "$rps" "$ok" "$redirects" "$non2xx" "$errors" "$p90" "$p99" "$verdict" | tee -a "$SUMMARY"

  if [[ "$crashed" -eq 1 ]]; then
    CRASH_LEVEL="$c"
    log "\n!! Server started failing at concurrency = $c (verdict: $verdict)."
    log "   Recent container logs:"
    docker logs --tail 20 "$CONTAINER" 2>&1 | sed 's/^/     /' | tee -a "$SUMMARY"
    break
  fi

  sleep 3 # let the server settle between levels, including after the final level
  if ! container_alive; then
    CRASH_LEVEL="$c"
    log "!! Container died during cooldown after concurrency $c."
    break
  fi
done

# Finish the log before extracting peaks, rather than reading a moving stream.
kill "$STATS_PID" >/dev/null 2>&1 || true
wait "$STATS_PID" 2>/dev/null || true
STATS_PID=""

log "\n================ RESULT ================"
if [[ -n "$RUN_ERROR" ]]; then
  log "!! Invalid benchmark: $RUN_ERROR"
elif [[ -n "$CRASH_LEVEL" ]]; then
  log "First failing concurrency level: $CRASH_LEVEL"
else
  log "Server survived all tested levels: $LEVELS"
fi
log "Peak CPU / memory sampled during the run (from docker stats):"
peak_cpu=$(grep -oE 'cpu=[0-9.]+' "$STATS_LOG" 2>/dev/null | sed 's/cpu=//' | sort -n | tail -1)
peak_mem=$(grep -oE 'mem=[0-9.]+(MiB|GiB|KiB)' "$STATS_LOG" 2>/dev/null | sed 's/mem=//' | awk '{
  if (/GiB$/) { sub(/GiB$/, ""); printf "%.1f\n", $0 * 1024 }
  else if (/KiB$/) { sub(/KiB$/, ""); printf "%.1f\n", $0 / 1024 }
  else { sub(/MiB$/, ""); print $0 }
}' | sort -n | tail -1)
log "  peak CPU: ${peak_cpu:-?}% of one core   peak mem: ${peak_mem:-?} MiB / ${MEMORY}"
log "OOM-killed: $(docker inspect -f '{{.State.OOMKilled}}' "$CONTAINER" 2>/dev/null || echo '?')   Restarts: $(container_restarts)   Exited: $(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo '?')"
log "\nArtifacts:"
log "  summary : $SUMMARY"
log "  results : $JSONL"
log "  dstats  : $STATS_LOG"
log "========================================"

if [[ -n "$RUN_ERROR" ]]; then exit 1; fi
