// Accessibility mode of the UI snapshot (`--a11y`, see README.md): axe-core runs on every capture with the stock
// theme and lists the WCAG 2.2 A/AA violations. Counts above a11y-baseline.json fail the run; without one it only reports.
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readBaseline, sortKeys, writeBaseline } from './baseline.mjs'
import { captureNames, DEFAULT_MODES, DEFAULT_VIEWPORTS } from './routes.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')

const A11Y_BASELINE = path.join(HERE, 'a11y-baseline.json')
export const A11Y_UPDATE_FLAG = '--update-a11y-baseline'
export const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Deliberate cases, each with a reason: { selector, rules: ['rule-id'] | '*', reason }. `selector` is matched with
// closest(), so it covers descendants. Violations waiting for a fix are not exceptions: they live in a11y-baseline.json.
const A11Y_EXCEPTIONS = []

// Read from node_modules because the harness blocks every non-localhost request, so no CDN. Read on the first audit,
// so runs without --a11y never touch it.
let axeSource
const readAxe = () =>
  (axeSource ??= fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8'))

// Runs in the page, with `axe` injected. Returns one entry per violated rule: { id, impact, helpUrl, targets }.
export const runA11y = async ({ tags, exceptions }) => {
  const results = await axe.run(
    { exclude: [['[data-ui-snapshot]']] },
    { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] }
  )
  const excused = (rule, node) => {
    const [first] = node.target
    if (typeof first !== 'string') return false
    let el = null
    try {
      el = document.querySelector(first)
    } catch {
      return false
    }
    return exceptions.some(
      ({ selector, rules }) => (rules === '*' || rules.includes(rule)) && el && el.closest(selector)
    )
  }
  const flat = (node) => node.target.map((t) => (Array.isArray(t) ? t.join(' >> ') : t)).join(' >> ')
  return results.violations
    .map(({ id, impact, helpUrl, nodes }) => ({
      id,
      impact,
      helpUrl,
      targets: nodes.filter((node) => !excused(id, node)).map(flat),
    }))
    .filter(({ targets }) => targets.length)
}

// Counts per rule, with the first targets as examples.
export const summarizeAxe = (violations) =>
  Object.fromEntries(
    violations.map(({ id, impact, helpUrl, targets }) => [
      id,
      { impact, count: targets.length, examples: targets.slice(0, 3).join(', '), help: helpUrl },
    ])
  )

// Injects axe once per page. page.evaluate, not addScriptTag, so the page's CSP cannot block it.
export const audit = async (page) => {
  if (!(await page.evaluate(() => typeof window.axe !== 'undefined'))) await page.evaluate(readAxe())
  return page.evaluate(runA11y, { tags: A11Y_TAGS, exceptions: A11Y_EXCEPTIONS }).then(summarizeAxe)
}

// An axe failure (page navigating mid-audit, evaluate timeout) must not turn a saved capture into a capture error;
// it is recorded as a pseudo-rule so the report shows it and the ratchet counts it.
export const safeAudit = async (page) => {
  try {
    return await audit(page)
  } catch (e) {
    return { 'axe-error': { impact: 'n/a', count: 1, examples: String(e?.message ?? e).slice(0, 200), help: '' } }
  }
}

// Pure. `ran` holds the captures that were audited; those that did not run are ignored.
export const compareA11y = (ran, baseline) => {
  const added = []
  let fixed = 0
  for (const capture of ran) {
    const before = baseline[capture.file] ?? {}
    for (const [rule, { impact, count, examples, help }] of Object.entries(capture.a11y)) {
      if (count > (before[rule] ?? 0))
        added.push(
          `  ${capture.file}  ${rule} (${impact}): ${count} (baseline ${before[rule] ?? 0})\n      ${examples}\n      ${help}`
        )
    }
    for (const [rule, count] of Object.entries(before)) if ((capture.a11y[rule]?.count ?? 0) < count) fixed += 1
  }
  return { added, fixed }
}

// a11y-report.json ({ [captureFile]: summary }) back into captures, so a CI report can seed the baseline.
export const capturesFromReport = (report) => Object.entries(report).map(([file, a11y]) => ({ file, a11y }))

// Rules by total node count, as a markdown table for the GitHub job summary.
const summaryTable = (ran) => {
  const rules = {}
  for (const { a11y } of ran) {
    for (const [rule, { impact, count }] of Object.entries(a11y)) {
      const row = (rules[rule] ??= { impact, nodes: 0, captures: 0 })
      row.nodes += count
      row.captures += 1
    }
  }
  const rows = Object.entries(rules)
    .sort(([, a], [, b]) => b.nodes - a.nodes)
    .map(([rule, { impact, nodes, captures }]) => `| ${rule} | ${impact} | ${nodes} | ${captures} |`)
  return [
    '### Accessibility (axe)',
    '',
    '| Rule | Impact | Nodes | Captures |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n')
}

// Compares the captures with the baseline, or with `update` writes them into it. Captures that did not run or whose axe
// failed keep their entry. `expected` (the names of a full run) drops the entries of any other file. Returns whether the
// run has violations the baseline does not hold; with no baseline file it only reports.
export const checkA11y = (captures, { update, baselinePath = A11Y_BASELINE, expected }) => {
  const exists = fs.existsSync(baselinePath)
  const baseline = readBaseline(baselinePath)
  const ran = captures.filter((c) => c.a11y)
  if (update) {
    const raised = []
    const axeFailed = []
    for (const capture of ran) {
      if (capture.a11y['axe-error']) {
        axeFailed.push(capture.file)
        continue
      }
      for (const [rule, { count }] of Object.entries(capture.a11y)) {
        const before = baseline[capture.file]?.[rule] ?? 0
        if (count > before) raised.push(`  ${capture.file}  ${rule}: ${before} -> ${count}`)
      }
      const counts = Object.fromEntries(Object.entries(capture.a11y).map(([rule, { count }]) => [rule, count]))
      if (Object.keys(counts).length) baseline[capture.file] = sortKeys(counts)
      else delete baseline[capture.file]
    }
    const pruned = []
    if (expected) {
      const keep = new Set([...expected, ...captures.map((c) => c.file)])
      for (const file of Object.keys(baseline)) {
        if (keep.has(file)) continue
        pruned.push(file)
        delete baseline[file]
      }
    }
    writeBaseline(baselinePath, baseline)
    console.log(`Accessibility baseline written: ${path.relative(ROOT, baselinePath)}`)
    if (axeFailed.length)
      console.warn(`axe failed on ${axeFailed.join(', ')}: their baseline entries were kept, not updated.`)
    if (raised.length)
      console.warn(
        [
          'Counts this update raised (old -> new), now locked in:',
          ...raised,
          'Prefer --baseline-from the CI report.',
        ].join('\n')
      )
    if (pruned.length) console.log(`Pruned baseline entries of captures no longer in routes.mjs: ${pruned.join(', ')}`)
    return false
  }
  const total = ran.reduce((sum, c) => sum + Object.values(c.a11y).reduce((n, { count }) => n + count, 0), 0)
  console.log(`Accessibility: ${total} violating nodes in ${ran.length} captures (report: a11y-report.json)`)
  if (process.env.GITHUB_STEP_SUMMARY && ran.length) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryTable(ran))
  }
  if (!exists) {
    console.log(`No ${path.basename(baselinePath)} yet: report-only. Write one with ${A11Y_UPDATE_FLAG}.`)
    return false
  }
  const { added, fixed } = compareA11y(ran, baseline)
  if (fixed) console.log(`${fixed} violation counts went down; lock them in with ${A11Y_UPDATE_FLAG}.`)
  if (!added.length) return false
  console.log(
    [
      'Accessibility violations the baseline does not hold:',
      ...added,
      'Fix them in the app. A deliberate case goes in',
      `A11Y_EXCEPTIONS in ${path.relative(ROOT, path.join(HERE, 'a11y.mjs'))}, with a reason.`,
    ].join('\n')
  )
  return true
}

// `node a11y.mjs --baseline-from <a11y-report.json>` writes the baseline from a report (the CI artifact), through
// the same checkA11y path as --update-a11y-baseline. Importing this module never runs it. The paths are compared
// after realpath, so a symlinked invocation runs it too.
const isMain = () => {
  try {
    return fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])
  } catch {
    return false
  }
}
if (isMain()) {
  const flag = process.argv.indexOf('--baseline-from')
  const source = flag === -1 ? undefined : process.argv[flag + 1]
  let report
  try {
    report = JSON.parse(fs.readFileSync(source, 'utf8'))
  } catch {
    console.error('Usage: node scripts/ui-snapshot/a11y.mjs --baseline-from <path/to/a11y-report.json>')
    process.exit(2)
  }
  const expected = captureNames({ viewports: DEFAULT_VIEWPORTS, modes: DEFAULT_MODES })
  checkA11y(capturesFromReport(report), { update: true, expected })
}
