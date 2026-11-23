import { describe, expect, it } from 'vitest'
import { blockingTime, formatTable, median, parseArgs, PROFILES, summarize, typeBucket } from './perf-lab-lib.mjs'

describe('parseArgs', () => {
  it('uses defaults', () => {
    const o = parseArgs(['--url', 'https://a.test/'])
    expect(o.targets).toEqual([{ url: 'https://a.test/', ready: undefined }])
    expect(o.runs).toBe(3)
    expect(o.profiles).toEqual(['unthrottled', 'fast-4g'])
    expect(o.json).toBe(false)
  })

  it('attaches --ready to the preceding --url', () => {
    const o = parseArgs(['--url', 'https://a.test/', '--url', 'https://a.test/x', '--ready', 'input[type=email]'])
    expect(o.targets.map((t: { ready?: string }) => t.ready)).toEqual([undefined, 'input[type=email]'])
  })

  it('reads runs, profile, json and storage state', () => {
    const o = parseArgs(['--url', 'u', '--runs', '5', '--profile', 'fast-4g', '--json', '--storage-state', 's.json'])
    expect(o).toMatchObject({ runs: 5, profiles: ['fast-4g'], json: true, storageState: 's.json' })
  })

  it('loads targets from a file spec', () => {
    const o = parseArgs(['--urls-file', 'x.json'], () =>
      JSON.stringify(['https://a.test/', { url: 'https://b.test/', ready: '#r' }])
    )
    expect(o.targets).toEqual([
      { url: 'https://a.test/', ready: undefined },
      { url: 'https://b.test/', ready: '#r' },
    ])
  })

  it('rejects bad input', () => {
    expect(() => parseArgs([])).toThrow(/at least one/i)
    expect(() => parseArgs(['--url', 'u', '--runs', '0'])).toThrow(/runs/)
    expect(() => parseArgs(['--url', 'u', '--profile', 'nope'])).toThrow(/profile/)
    expect(() => parseArgs(['--ready', '#a'])).toThrow(/--url/)
    expect(() => parseArgs(['--bogus'])).toThrow(/unknown/i)
  })
})

describe('median', () => {
  it('handles odd, even, unsorted and empty input', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
  })

  it('ignores nulls', () => {
    expect(median([null, 5, null, 7])).toBe(6)
    expect(median([null])).toBeNull()
  })
})

describe('blockingTime and typeBucket', () => {
  it('sums only the part of long tasks over 50 ms', () => {
    expect(blockingTime([120, 50, 70, 30])).toBe(70 + 0 + 20)
  })

  it('buckets resource types', () => {
    expect(typeBucket('Script')).toBe('js')
    expect(typeBucket('Font')).toBe('fonts')
    expect(typeBucket('Image')).toBe('other')
  })
})

describe('summarize and formatTable', () => {
  const run = (ready: number, js: number) => ({
    readyMs: ready,
    documents: 2,
    fcp: 100,
    lcp: 200,
    blockingMs: 10,
    longTasks: 1,
    jsBytes: js,
    fontBytes: 50,
    otherBytes: 5,
  })

  it('takes the median of every metric', () => {
    const s = summarize([run(300, 1000), run(100, 3000), run(200, 2000)])
    expect(s.readyMs).toBe(200)
    expect(s.jsBytes).toBe(2000)
  })

  it('renders a table with one row per url and profile', () => {
    const rows = [{ url: 'https://a.test/', profile: 'fast-4g', runs: 3, ...summarize([run(2700, 1244160)]) }]
    const out = formatTable(rows)
    expect(out).toContain('fast-4g')
    expect(out).toContain('https://a.test/')
    expect(out).toContain('1215 KB')
    expect(out.split('\n')).toHaveLength(2)
  })

  it('shows a dash for missing metrics', () => {
    const out = formatTable([{ url: 'u', profile: 'p', runs: 1, ...summarize([{ ...run(1, 1), lcp: null }]) }])
    expect(out).toContain('-')
  })

  it('exposes the throttling profiles', () => {
    expect(PROFILES['fast-4g']).toEqual({ latency: 60, downKbps: 9000, upKbps: 1500, cpu: 4 })
    expect(PROFILES.unthrottled.cpu).toBe(1)
  })
})
