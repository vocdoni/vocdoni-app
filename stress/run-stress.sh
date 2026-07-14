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
RUN_ID="$(date +%Y%m%d-%H%M%S)"
CONTAINER="vocdoni-ui-stress-$RUN_ID"

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

mkdir -p "$RESULTS_DIR"
SUMMARY="$RESULTS_DIR/summary-$RUN_ID.txt"
JSONL="$RESULTS_DIR/results-$RUN_ID.jsonl"
STATS_LOG="$RESULTS_DIR/dockerstats-$RUN_ID.log"

log() { echo -e "$*" | tee -a "$SUMMARY"; }

cleanup() {
  # Stop the docker stats streamer if running.
  [[ -n "${STATS_PID:-}" ]] && kill "$STATS_PID" >/dev/null 2>&1
  if [[ "$KEEP" -eq 0 ]]; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1
  else
    log "\nContainer left running as: $CONTAINER (port $HOST_PORT)"
  fi
}
trap cleanup EXIT INT TERM

# --- build ------------------------------------------------------------------
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "==> Building image $IMAGE (this can take a few minutes)…"
  if ! docker build -t "$IMAGE" "$REPO_DIR" >>"$RESULTS_DIR/build-$RUN_ID.log" 2>&1; then
    log "!! Build failed. See $RESULTS_DIR/build-$RUN_ID.log"
    exit 1
  fi
else
  log "==> Skipping build, using existing image $IMAGE"
fi

# --- run container ----------------------------------------------------------
log "==> Starting container: cpus=$CPUS memory=$MEMORY port=$HOST_PORT"
docker rm -f "$CONTAINER" >/dev/null 2>&1
docker run -d --name "$CONTAINER" \
  --cpus="$CPUS" --memory="$MEMORY" --memory-swap="$MEMORY" \
  -e NODE_ENV=production -e PORT=3000 \
  -p "$HOST_PORT:3000" \
  "$IMAGE" >/dev/null

# --- wait for readiness -----------------------------------------------------
BASE="http://localhost:$HOST_PORT"
log "==> Waiting for server readiness at $BASE$REQ_PATH …"
ready=0
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$BASE$REQ_PATH" 2>/dev/null)
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    ready=1
    log "    ready after ${i}s (HTTP $code)"
    break
  fi
  if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
    log "!! Container exited during startup. Logs:"
    docker logs "$CONTAINER" 2>&1 | tail -30 | tee -a "$SUMMARY"
    exit 1
  fi
  sleep 1
done
if [[ "$ready" -eq 0 ]]; then
  log "!! Server did not become ready in 60s. Logs:"
  docker logs "$CONTAINER" 2>&1 | tail -30 | tee -a "$SUMMARY"
  exit 1
fi

# Stream container resource usage in the background for the whole run.
( while true; do
    docker stats --no-stream --format \
      '{{.Name}} cpu={{.CPUPerc}} mem={{.MemUsage}} ({{.MemPerc}}) net={{.NetIO}} pids={{.PIDs}}' \
      "$CONTAINER" 2>/dev/null | sed "s/^/$(date +%H:%M:%S) /"
    sleep 2
  done ) >>"$STATS_LOG" 2>&1 &
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
printf '%-8s %-9s %-8s %-8s %-8s %-9s %-9s %-8s\n' \
  "conc" "rps" "ok" "non2xx" "errors" "p90(ms)" "p99(ms)" "verdict" | tee -a "$SUMMARY"

CRASH_LEVEL=""
for c in $LEVELS; do
  if ! container_alive; then
    log "!! Container is no longer running before level $c — it crashed at the previous level."
    break
  fi
  restarts_before=$(container_restarts)

  OUT=$(node "$SCRIPT_DIR/loadgen.mjs" --url "$BASE$REQ_PATH" \
    --concurrency "$c" --duration "$DURATION" --warmup "$WARMUP" $KA_FLAG \
    --label "c$c" 2>>"$RESULTS_DIR/loadgen-$RUN_ID.err")
  JSON=$(printf '%s\n' "$OUT" | grep '^RESULT_JSON ' | sed 's/^RESULT_JSON //')

  if [[ -z "$JSON" ]]; then
    log "!! No result from loadgen at concurrency $c (generator or connection failure)."
    CRASH_LEVEL="$c"
    break
  fi
  echo "$JSON" >>"$JSONL"

  restarts_after=$(container_restarts)
  read -r rps ok non2xx errors p90 p99 failpct <<<"$(printf '%s' "$JSON" | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try{const j=JSON.parse(s);
        const fail=(j.errors||0)+Math.max(0,j.non2xx||0);
        const pct=j.requests?fail/j.requests*100:0;
        console.log([j.rps||0,j.ok2xx||0,j.non2xx||0,j.errors||0,
          (j.latencyMs&&j.latencyMs.p90)||0,(j.latencyMs&&j.latencyMs.p99)||0,
          pct.toFixed(2)].join(" "));
      }catch(e){console.log("0 0 0 0 0 0 100");}
    });')"

  # Verdict: OK if <1% failures and container stable; DEGRADED if some failures;
  # CRASH if container died/restarted or failures are severe (>=10%).
  verdict="OK"
  crashed=0
  if ! container_alive; then verdict="DOWN"; crashed=1
  elif [[ "$restarts_after" != "$restarts_before" ]]; then verdict="RESTARTED"; crashed=1
  elif awk "BEGIN{exit !($failpct >= 10)}"; then verdict="CRASH"; crashed=1
  elif awk "BEGIN{exit !($failpct >= 1)}"; then verdict="DEGRADED"
  fi

  printf '%-8s %-9s %-8s %-8s %-8s %-9s %-9s %-8s\n' \
    "$c" "$rps" "$ok" "$non2xx" "$errors" "$p90" "$p99" "$verdict" | tee -a "$SUMMARY"

  if [[ "$crashed" -eq 1 ]]; then
    CRASH_LEVEL="$c"
    log "\n!! Server started failing at concurrency = $c (verdict: $verdict)."
    log "   Recent container logs:"
    docker logs "$CONTAINER" 2>&1 | tail -20 | sed 's/^/     /' | tee -a "$SUMMARY"
    break
  fi

  sleep 3 # let the server settle between levels
done

log "\n================ RESULT ================"
if [[ -n "$CRASH_LEVEL" ]]; then
  log "First failing concurrency level: $CRASH_LEVEL"
else
  log "Server survived all tested levels: $LEVELS"
fi
log "Peak CPU / memory sampled during the run (from docker stats):"
peak_cpu=$(grep -oE 'cpu=[0-9.]+' "$STATS_LOG" 2>/dev/null | sed 's/cpu=//' | sort -n | tail -1)
peak_mem=$(grep -oE 'mem=[0-9.]+MiB' "$STATS_LOG" 2>/dev/null | sed 's/mem=//; s/MiB//' | sort -n | tail -1)
log "  peak CPU: ${peak_cpu:-?}% of one core   peak mem: ${peak_mem:-?} MiB / ${MEMORY}"
log "OOM-killed: $(docker inspect -f '{{.State.OOMKilled}}' "$CONTAINER" 2>/dev/null || echo '?')   Restarts: $(container_restarts)   Exited: $(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo '?')"
log "\nArtifacts:"
log "  summary : $SUMMARY"
log "  results : $JSONL"
log "  dstats  : $STATS_LOG"
log "========================================"
