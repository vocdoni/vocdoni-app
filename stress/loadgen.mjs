#!/usr/bin/env node
// Dependency-free closed-loop HTTP load generator.
//
// Maintains exactly `--concurrency` in-flight requests at all times: each
// virtual client fires a request, waits for the full response, then immediately
// fires the next one, until `--duration` elapses. This models N concurrent
// connections hammering the server and reports throughput, latency percentiles
// and a breakdown of every failure mode (connection refused/reset, timeouts,
// non-2xx). Output is a human summary plus a single-line JSON blob (prefixed
// with `RESULT_JSON `) so the orchestrator can parse it.
//
// Usage:
//   node loadgen.mjs --url http://localhost:3000/ --concurrency 500 --duration 20
//
// Flags:
//   --url          target URL (required)
//   --concurrency  number of simultaneous virtual clients (default 100)
//   --duration     test duration in seconds (default 15)
//   --timeout      per-request timeout in ms (default 10000)
//   --warmup       seconds to run before measuring (stats reset after, default 0)
//   --no-keepalive open a fresh TCP connection per request (connection churn)
//   --label        free-form label echoed back in the JSON result

import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

function parseArgs(argv) {
  const args = {
    url: null,
    concurrency: 100,
    duration: 15,
    timeout: 10000,
    warmup: 0,
    keepalive: true,
    label: '',
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--url':
        args.url = argv[++i]
        break
      case '--concurrency':
      case '-c':
        args.concurrency = Number(argv[++i])
        break
      case '--duration':
      case '-d':
        args.duration = Number(argv[++i])
        break
      case '--timeout':
        args.timeout = Number(argv[++i])
        break
      case '--warmup':
        args.warmup = Number(argv[++i])
        break
      case '--no-keepalive':
        args.keepalive = false
        break
      case '--label':
        args.label = argv[++i]
        break
      default:
        throw new Error(`Unknown argument: ${a}`)
    }
  }
  if (!args.url) throw new Error('--url is required')
  return args
}

const args = parseArgs(process.argv.slice(2))
const target = new URL(args.url)
const isHttps = target.protocol === 'https:'
const client = isHttps ? https : http

const agent = new (isHttps ? https.Agent : http.Agent)({
  keepAlive: args.keepalive,
  // One socket per virtual client. With keepAlive this pins ~concurrency
  // simultaneous TCP connections; without it every request dials fresh.
  maxSockets: args.concurrency,
  maxFreeSockets: args.concurrency,
})

const requestOptions = {
  agent,
  method: 'GET',
  hostname: target.hostname,
  port: target.port || (isHttps ? 443 : 80),
  path: target.pathname + target.search,
  headers: {
    host: target.host,
    'user-agent': 'vocdoni-loadgen/1.0',
    accept: '*/*',
    connection: args.keepalive ? 'keep-alive' : 'close',
  },
  timeout: args.timeout,
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
function freshStats() {
  return {
    sent: 0,
    completed: 0,
    bytes: 0,
    statusBuckets: {}, // "2xx" -> count, plus exact non-2xx codes
    errors: {}, // error code/type -> count
    latencies: [], // ms, successful responses only
  }
}
let stats = freshStats()
let measuring = args.warmup <= 0

function recordStatus(code) {
  const bucket = `${Math.floor(code / 100)}xx`
  stats.statusBuckets[bucket] = (stats.statusBuckets[bucket] || 0) + 1
  if (code < 200 || code >= 300) {
    stats.statusBuckets[String(code)] = (stats.statusBuckets[String(code)] || 0) + 1
  }
}

function recordError(err) {
  const key = err && (err.code || err.message) ? err.code || err.message : 'unknown'
  stats.errors[key] = (stats.errors[key] || 0) + 1
}

// ---------------------------------------------------------------------------
// Single request as a promise (never rejects; resolves after resource freed)
// ---------------------------------------------------------------------------
function doRequest() {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint()
    stats.sent++
    // Each request has exactly ONE terminal outcome. Once settled, any further
    // events (e.g. the 'error' that req.destroy() triggers after a timeout) are
    // ignored — otherwise a single timeout would be double-counted as both
    // ETIMEDOUT and a spurious ECONNRESET.
    let settled = false
    const settle = (outcome) => {
      if (settled) return
      settled = true
      stats.completed++
      if (measuring) {
        if (outcome.ok) {
          stats.bytes += outcome.len
          recordStatus(outcome.statusCode)
          stats.latencies.push(outcome.ms)
        } else {
          recordError(outcome.err)
        }
      }
      resolve()
    }

    const req = client.request(requestOptions, (res) => {
      let len = 0
      res.on('data', (chunk) => {
        len += chunk.length
      })
      res.on('end', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6
        settle({ ok: true, statusCode: res.statusCode, len, ms })
      })
      res.on('error', (err) => {
        req.destroy()
        settle({ ok: false, err })
      })
    })

    req.on('timeout', () => {
      req.destroy()
      settle({ ok: false, err: { code: 'ETIMEDOUT' } })
    })
    req.on('error', (err) => {
      settle({ ok: false, err })
    })
    req.end()
  })
}

// ---------------------------------------------------------------------------
// Closed-loop worker: keep firing until the deadline
// ---------------------------------------------------------------------------
async function worker(deadline) {
  while (Date.now() < deadline) {
    await doRequest()
  }
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

async function main() {
  const totalMs = (args.warmup + args.duration) * 1000
  const measureStartAt = Date.now() + args.warmup * 1000
  const deadline = Date.now() + totalMs

  // Flip to measuring after warmup, resetting counters so warmup traffic is
  // excluded from the reported numbers.
  if (args.warmup > 0) {
    setTimeout(() => {
      stats = freshStats()
      measuring = true
    }, args.warmup * 1000)
  }

  const workers = []
  for (let i = 0; i < args.concurrency; i++) workers.push(worker(deadline))
  await Promise.all(workers)

  const measuredSeconds = Math.max(0.001, (Date.now() - measureStartAt) / 1000)
  const sorted = stats.latencies.slice().sort((a, b) => a - b)
  const sum = sorted.reduce((s, v) => s + v, 0)
  const ok = stats.statusBuckets['2xx'] || 0
  const redirects = stats.statusBuckets['3xx'] || 0
  const errorCount = Object.values(stats.errors).reduce((s, v) => s + v, 0)
  const non2xx = stats.completed - ok - redirects - errorCount

  const result = {
    label: args.label,
    url: args.url,
    concurrency: args.concurrency,
    durationSeconds: Number(measuredSeconds.toFixed(2)),
    keepalive: args.keepalive,
    requests: stats.completed,
    rps: Number((stats.completed / measuredSeconds).toFixed(1)),
    ok2xx: ok,
    redirect3xx: redirects,
    non2xx,
    errors: errorCount,
    errorBreakdown: stats.errors,
    statusBuckets: stats.statusBuckets,
    bytesReceived: stats.bytes,
    latencyMs: {
      min: Number((sorted[0] || 0).toFixed(2)),
      avg: Number((sum / (sorted.length || 1)).toFixed(2)),
      p50: Number(percentile(sorted, 50).toFixed(2)),
      p90: Number(percentile(sorted, 90).toFixed(2)),
      p99: Number(percentile(sorted, 99).toFixed(2)),
      max: Number((sorted[sorted.length - 1] || 0).toFixed(2)),
    },
  }

  // Human-readable summary to stderr, machine-readable JSON to stdout.
  const pct = result.requests ? ((result.errors + Math.max(0, result.non2xx)) / result.requests) * 100 : 0
  process.stderr.write(
    `\n  c=${result.concurrency} keepalive=${result.keepalive} dur=${result.durationSeconds}s\n` +
      `  requests=${result.requests}  rps=${result.rps}  ok=${result.ok2xx}  3xx=${result.redirect3xx}  non2xx=${result.non2xx}  errors=${result.errors}  (fail ${pct.toFixed(2)}%)\n` +
      `  latency ms: min=${result.latencyMs.min} avg=${result.latencyMs.avg} p50=${result.latencyMs.p50} p90=${result.latencyMs.p90} p99=${result.latencyMs.p99} max=${result.latencyMs.max}\n` +
      (errorCount ? `  errorBreakdown: ${JSON.stringify(result.errors)}\n` : '') +
      (non2xx > 0 ? `  statusBuckets: ${JSON.stringify(result.statusBuckets)}\n` : '')
  )
  process.stdout.write('RESULT_JSON ' + JSON.stringify(result) + '\n')
}

main().catch((err) => {
  console.error('loadgen fatal:', err)
  process.exit(1)
})
