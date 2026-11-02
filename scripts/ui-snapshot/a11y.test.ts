import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  A11Y_TAGS,
  audit,
  capturesFromReport,
  checkA11y,
  compareA11y,
  runA11y,
  safeAudit,
  summarizeAxe,
} from './a11y.mjs'

const run = (html: string, exceptions: { selector: string; rules: string[] | '*'; reason: string }[] = []) => {
  // The page-level rules (title, lang) would fire on jsdom's bare document.
  document.title = 'Page'
  document.documentElement.lang = 'en'
  document.body.innerHTML = html
  return runA11y({ tags: A11Y_TAGS, exceptions })
}

describe('runA11y', () => {
  beforeAll(async () => {
    ;(globalThis as { axe?: unknown }).axe = (await import('axe-core')).default
  })

  it('reports a violation with the targets of its nodes', async () => {
    const found = await run('<button></button>')
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ id: 'button-name', targets: ['button'] })
    expect(found[0].helpUrl).toMatch(/^https:\/\/dequeuniversity\.com\//)
  })

  it('skips what an exception covers for that rule', async () => {
    const html = '<div class="widget"><button></button></div>'
    expect(await run(html, [{ selector: '.widget', rules: ['button-name'], reason: 'third party' }])).toEqual([])
    expect(await run(html, [{ selector: '.widget', rules: '*', reason: 'third party' }])).toEqual([])
    expect(await run(html, [{ selector: '.widget', rules: ['image-alt'], reason: 'other rule' }])).toHaveLength(1)
  })

  it('leaves out the snapshot harness own elements', async () => {
    expect(await run('<div data-ui-snapshot><button></button></div>')).toEqual([])
  })
})

describe('summarizeAxe', () => {
  it('counts nodes per rule and keeps the first three targets', () => {
    const summary = summarizeAxe([
      { id: 'button-name', impact: 'critical', helpUrl: 'https://x/button-name', targets: ['a', 'b', 'c', 'd'] },
      { id: 'label', impact: 'minor', helpUrl: 'https://x/label', targets: ['input'] },
    ])
    expect(summary).toEqual({
      'button-name': { impact: 'critical', count: 4, examples: 'a, b, c', help: 'https://x/button-name' },
      label: { impact: 'minor', count: 1, examples: 'input', help: 'https://x/label' },
    })
  })
})

const entry = (count: number, impact = 'serious') => ({ impact, count, examples: 'button', help: 'https://x/rule' })

describe('compareA11y', () => {
  it('flags a count above the baseline and a rule the baseline lacks', () => {
    const ran = [
      { file: 'a', a11y: { 'button-name': entry(3), label: entry(1) } },
      { file: 'b', a11y: { label: entry(2) } },
    ]
    const { added, fixed } = compareA11y(ran, { a: { 'button-name': 2 } })
    expect(fixed).toBe(0)
    expect(added).toHaveLength(3)
    expect(added[0]).toContain('a  button-name (serious): 3 (baseline 2)')
    expect(added[0]).toContain('button')
    expect(added[0]).toContain('https://x/rule')
    expect(added[1]).toContain('a  label (serious): 1 (baseline 0)')
    expect(added[2]).toContain('b  label (serious): 2 (baseline 0)')
  })

  it('counts lower counts as fixed and accepts equal ones', () => {
    const ran = [{ file: 'a', a11y: { 'button-name': entry(1) } }]
    expect(compareA11y(ran, { a: { 'button-name': 2, label: 1 } })).toEqual({ added: [], fixed: 2 })
    expect(compareA11y(ran, { a: { 'button-name': 1 } })).toEqual({ added: [], fixed: 0 })
  })

  it('ignores captures that did not run', () => {
    expect(compareA11y([], { gone: { label: 4 } })).toEqual({ added: [], fixed: 0 })
  })
})

describe('checkA11y', () => {
  let dir: string
  let baselinePath: string
  let log: ReturnType<typeof vi.spyOn>
  const printed = () => log.mock.calls.map((c) => c.join(' ')).join('\n')

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-'))
    baselinePath = path.join(dir, 'a11y-baseline.json')
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('is report-only while there is no baseline file', () => {
    const captures = [{ file: 'a', a11y: { label: entry(5) } }]
    expect(checkA11y(captures, { update: false, baselinePath })).toBe(false)
    expect(printed()).toContain('Accessibility: 5 violating nodes in 1 captures')
    expect(printed()).toContain('report-only')
    expect(fs.existsSync(baselinePath)).toBe(false)
  })

  it('fails on a regression against the baseline and says how to fix it', () => {
    fs.writeFileSync(baselinePath, JSON.stringify({ a: { label: 1 } }))
    const captures = [{ file: 'a', a11y: { label: entry(2) } }, { file: 'b' }]
    expect(checkA11y(captures, { update: false, baselinePath })).toBe(true)
    expect(printed()).toContain('a  label (serious): 2 (baseline 1)')
    expect(printed()).toContain('A11Y_EXCEPTIONS')
  })

  it('passes when nothing is above the baseline and mentions fixes', () => {
    fs.writeFileSync(baselinePath, JSON.stringify({ a: { label: 3 } }))
    expect(checkA11y([{ file: 'a', a11y: { label: entry(1) } }], { update: false, baselinePath })).toBe(false)
    expect(printed()).toContain('1 violation counts went down')
  })

  it('writes the baseline: ran captures replaced, others kept, clean ones removed, keys sorted', () => {
    fs.writeFileSync(baselinePath, JSON.stringify({ z: { label: 1 }, keep: { label: 7 }, clean: { label: 2 } }))
    const captures = [
      { file: 'z', a11y: { 'button-name': entry(2), 'aria-roles': entry(1) } },
      { file: 'clean', a11y: {} },
      { file: 'not-run' },
    ]
    expect(checkA11y(captures, { update: true, baselinePath })).toBe(false)
    const text = fs.readFileSync(baselinePath, 'utf8')
    expect(JSON.parse(text)).toEqual({ keep: { label: 7 }, z: { 'aria-roles': 1, 'button-name': 2 } })
    expect(Object.keys(JSON.parse(text))).toEqual(['keep', 'z'])
    expect(Object.keys(JSON.parse(text).z)).toEqual(['aria-roles', 'button-name'])
  })

  it('appends a table of rules to the GitHub step summary', () => {
    const summaryPath = path.join(dir, 'summary.md')
    vi.stubEnv('GITHUB_STEP_SUMMARY', summaryPath)
    const captures = [
      { file: 'a', a11y: { label: entry(2), 'button-name': entry(1, 'critical') } },
      { file: 'b', a11y: { label: entry(3) } },
    ]
    checkA11y(captures, { update: false, baselinePath })
    const md = fs.readFileSync(summaryPath, 'utf8')
    expect(md).toContain('| Rule | Impact | Nodes | Captures |')
    expect(md.indexOf('| label |')).toBeLessThan(md.indexOf('| button-name |'))
    expect(md).toContain('| label | serious | 5 | 2 |')
  })
})

describe('capturesFromReport', () => {
  const report = {
    'home-1280-light': { label: entry(2), 'button-name': entry(1, 'critical') },
    'clean-390-dark': {},
  }

  it('turns each report key into a capture, keeping clean ones', () => {
    expect(capturesFromReport(report)).toEqual([
      { file: 'home-1280-light', a11y: report['home-1280-light'] },
      { file: 'clean-390-dark', a11y: {} },
    ])
  })

  it('feeds checkA11y so the baseline holds the sorted counts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-'))
    const baselinePath = path.join(dir, 'a11y-baseline.json')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      checkA11y(capturesFromReport(report), { update: true, baselinePath })
      const text = fs.readFileSync(baselinePath, 'utf8')
      expect(JSON.parse(text)).toEqual({ 'home-1280-light': { 'button-name': 1, label: 2 } })
      expect(Object.keys(JSON.parse(text)['home-1280-light'])).toEqual(['button-name', 'label'])
    } finally {
      vi.restoreAllMocks()
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('audit', () => {
  it('injects axe once per page, then runs it', async () => {
    let injected = false
    const evaluate = vi.fn(async (arg: unknown) => {
      if (typeof arg === 'string') {
        injected = true
        return undefined
      }
      const name = (arg as { name?: string }).name
      if (name === 'runA11y') return [{ id: 'label', impact: 'minor', helpUrl: 'u', targets: ['input'] }]
      return injected // the "is axe already in the page" probe
    })
    const page = { evaluate }
    const first = await audit(page)
    await audit(page)
    expect(first).toEqual({ label: { impact: 'minor', count: 1, examples: 'input', help: 'u' } })
    expect(evaluate.mock.calls.filter(([arg]) => typeof arg === 'string')).toHaveLength(1)
  })
})

describe('safeAudit', () => {
  it('records an axe-error entry instead of throwing, so the capture survives', async () => {
    const page = {
      evaluate: vi.fn().mockRejectedValue(new Error('Execution context was destroyed ' + 'x'.repeat(300))),
    }
    const found = await safeAudit(page)
    expect(Object.keys(found)).toEqual(['axe-error'])
    expect(found['axe-error']).toMatchObject({ impact: 'n/a', count: 1, help: '' })
    expect(found['axe-error'].examples).toMatch(/^Execution context was destroyed/)
    expect(found['axe-error'].examples.length).toBeLessThanOrEqual(200)
  })

  it('returns the audit result when axe works', async () => {
    const page = {
      evaluate: vi.fn(async (arg: unknown) => (typeof arg === 'string' || typeof arg === 'function' ? [] : true)),
    }
    expect(await safeAudit(page)).toEqual({})
  })
})
