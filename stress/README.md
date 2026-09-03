# HTTP stress tests

Load tests for the production SSR/static HTTP server (`server/index.mjs`, the
image built by the repo `Dockerfile`).

## Contents

- `loadgen.mjs` — dependency-free Node.js closed-loop load generator. Keeps
  exactly `--concurrency` requests in flight and reports RPS, latency
  percentiles and a full failure breakdown (connection refused/reset, timeouts,
  non-2xx). Emits a human summary on stderr and a `RESULT_JSON ...` line on
  stdout.
- `run-stress.sh` — orchestrator. Builds the image, runs it in a
  resource-constrained container (`--cpus`, `--memory`), waits for readiness,
  then drives a ramp of increasing concurrency until the server starts failing.
  Records per-level JSON, a live `docker stats` log, and detects the crash
  point (container OOM/restart or a failure-rate spike).

## Quick start

```bash
# Full run: build + 1 CPU / 512MB container + ramp to the breaking point
stress/run-stress.sh --cpus 1 --memory 512m

# Reuse an already-built image and try a 1GB machine
stress/run-stress.sh --skip-build --memory 1024m --image vocdoni-ui-stress:latest

# Custom ramp against a specific path, new connection per request
stress/run-stress.sh --path /en --levels "100 500 1000 2000" --no-keepalive
```

Run a single level by hand against an already-running server:

```bash
node stress/loadgen.mjs --url http://localhost:3000/en --concurrency 1000 --duration 20 --warmup 3
```

## What gets hit

The default path is `/en`, which renders the client-app shell through Vike
SSR on every request (the SPA catch-all is not cached) and needs **no live
Vocdoni backend** — so the test isolates the HTTP server itself. The cacheable
public SSR routes (`/<lang>/organization/<addr>`, `/<lang>/processes/<id>`)
require a reachable backend for the first render, after which the LRU cache
serves them from memory; point `--path` at one of those only when a backend is
available.

## Output

Everything lands in `stress/results/`:

- `summary-<ts>.txt` — the ramp table and verdict
- `results-<ts>.jsonl` — one JSON result per concurrency level
- `dockerstats-<ts>.log` — container CPU/mem/net sampled every 2s
- `build-<ts>.log` — docker build output
