// Pure helpers for scripts/perf-lab.mjs: argument parsing, medians and table output.
// Kept free of Playwright so they can be unit tested.

export const PROFILES = {
  unthrottled: { latency: 0, downKbps: 0, upKbps: 0, cpu: 1 },
  'fast-4g': { latency: 60, downKbps: 9000, upKbps: 1500, cpu: 4 },
}

export const USAGE = `Usage: pnpm perf:lab -- --url <url> [--ready <selector>] [--url <url> ...] [options]

  --url <url>              page to measure (repeatable)
  --ready <selector>       element that marks the page usable; applies to the preceding --url
                           (needed for URLs that redirect in the browser, e.g. /)
  --urls-file <file>       JSON array of urls or {"url", "ready"} objects
  --profile <name>         unthrottled | fast-4g (repeatable or comma separated; default both)
  --runs <n>               runs per url and profile, the median is reported (default 3)
  --storage-state <file>   Playwright storage state for logged-in runs (never commit it)
  --json                   print JSON instead of a table
  --help                   show this text`

const parseSpec = (spec) =>
  (Array.isArray(spec) ? spec : []).map((item) =>
    typeof item === 'string' ? { url: item, ready: undefined } : { url: item.url, ready: item.ready }
  )

export function parseArgs(argv, readFile) {
  const opts = { targets: [], runs: 3, profiles: [], json: false, storageState: undefined, help: false }
  const value = (i, flag) => {
    if (i + 1 >= argv.length) throw new Error(`${flag} needs a value`)
    return argv[i + 1]
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--': // pnpm forwards a bare separator
        break
      case '--url':
        opts.targets.push({ url: value(i++, arg), ready: undefined })
        break
      case '--ready': {
        const selector = value(i++, arg)
        if (!opts.targets.length) throw new Error('--ready must come after the --url it belongs to')
        opts.targets[opts.targets.length - 1].ready = selector
        break
      }
      case '--urls-file':
        opts.targets.push(...parseSpec(JSON.parse(readFile(value(i++, arg)))))
        break
      case '--profile':
        opts.profiles.push(...value(i++, arg).split(','))
        break
      case '--runs':
        opts.runs = Number(value(i++, arg))
        break
      case '--storage-state':
        opts.storageState = value(i++, arg)
        break
      case '--json':
        opts.json = true
        break
      case '--help':
      case '-h':
        opts.help = true
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (opts.help) return opts
  if (!opts.targets.length) throw new Error('Pass at least one --url (or --urls-file)')
  if (!Number.isInteger(opts.runs) || opts.runs < 1) throw new Error('--runs must be a positive integer')
  if (!opts.profiles.length) opts.profiles = Object.keys(PROFILES)
  for (const p of opts.profiles)
    if (!PROFILES[p]) throw new Error(`Unknown profile "${p}" (use ${Object.keys(PROFILES).join(', ')})`)
  return opts
}

export function median(values) {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)).sort((a, b) => a - b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

// Blocking time: the part of each long task (> 50 ms) beyond the first 50 ms.
export const blockingTime = (durations) => durations.reduce((sum, d) => sum + Math.max(0, d - 50), 0)

export const typeBucket = (resourceType) =>
  resourceType === 'Script' ? 'js' : resourceType === 'Font' ? 'fonts' : 'other'

const METRICS = ['readyMs', 'documents', 'fcp', 'lcp', 'blockingMs', 'longTasks', 'jsBytes', 'fontBytes', 'otherBytes']

export function summarize(runs) {
  return Object.fromEntries(METRICS.map((m) => [m, median(runs.map((r) => r[m]))]))
}

const ms = (v) => (v == null ? '-' : `${Math.round(v)} ms`)
const kb = (v) => (v == null ? '-' : `${Math.round(v / 1024)} KB`)
const num = (v) => (v == null ? '-' : String(Math.round(v)))

export function formatTable(rows) {
  const header = ['url', 'profile', 'ready', 'docs', 'FCP', 'LCP', 'blocking', 'JS', 'fonts', 'other', 'runs']
  const body = rows.map((r) => [
    r.url,
    r.profile,
    ms(r.readyMs),
    num(r.documents),
    ms(r.fcp),
    ms(r.lcp),
    ms(r.blockingMs),
    kb(r.jsBytes),
    kb(r.fontBytes),
    kb(r.otherBytes),
    String(r.runs),
  ])
  const widths = header.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)))
  const line = (cells) =>
    cells
      .map((c, i) => c.padEnd(widths[i]))
      .join('  ')
      .trimEnd()
  return [line(header), ...body.map(line)].join('\n')
}
