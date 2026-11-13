// Stress mode of the UI snapshot (`--theme stress`, see README.md): the app runs with
// src/theme/test-themes/stress.ts, which moves every themed value off its stock value, and each capture
// lists the elements that still show a stock one. New leaks against stress-baseline.json fail the run.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')

export const STRESS_MODULE = 'src/theme/test-themes/stress.ts'
export const STRESS_BASELINE = path.join(HERE, 'stress-baseline.json')
export const UPDATE_FLAG = '--update-stress-baseline'

// The vite alias that swaps the app's system for the stress one, on the server and in the browser.
export const stressAlias = () => ({ '~theme/system': path.join(ROOT, STRESS_MODULE) })

// Elements that keep stock values on purpose. `selector` is matched with closest(), so it covers descendants.
// Leaks still waiting for a fix are not exceptions: they live in stress-baseline.json.
export const STRESS_EXCEPTIONS = []

const KINDS = ['font', 'font-size', 'radius', 'spacing', 'grey', 'palette', 'shadow']

// Runs in the page. Returns one entry per stock value found: [kind, value, element description].
export const probeStress = ({ spec, exceptions, kinds }) => {
  const COLOR_RE = /rgba?\([^)]*\)|color\(srgb[^)]*\)/g
  const parse = (css) => {
    const srgb = /^color\(srgb ([^)]+)\)$/.exec(css)
    const rgb = /^rgba?\(([^)]+)\)$/.exec(css)
    const parts = (srgb || rgb)?.[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number)
    if (!parts) return null
    const [r, g, b] = parts.slice(0, 3).map((n) => Math.round(srgb ? n * 255 : n))
    return { r, g, b, a: parts[3] ?? 1 }
  }
  const hex = ({ r, g, b, a }) =>
    `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}${a < 1 ? `/${Math.round(a * 100)}` : ''}`
  const isGrey = (c) => Math.abs(c.r - c.g) < 4 && Math.abs(c.g - c.b) < 4
  const stockRadii = new Set(spec.radii)
  const stockFontSizes = new Set(spec.fontSizes)
  const stockSpacing = new Set(spec.spacing)
  const marker = new RegExp(`"?${spec.fontMarker} `)

  const describe = (el) => {
    const scope = el.getAttribute('data-scope')
    const part = el.getAttribute('data-part')
    const label = (
      el.getAttribute('aria-label') || [...el.childNodes].map((n) => (n.nodeType === 3 ? n.textContent : '')).join('')
    )
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40)
    return `${el.tagName.toLowerCase()}${scope || part ? `[${scope || ''}.${part || ''}]` : ''}${label ? ` "${label}"` : ''}`
  }
  const excused = (el, kind) =>
    exceptions.some(({ selector, kinds: k }) => (k === '*' || k.includes(kind)) && el.closest(selector))

  const leaks = []
  const add = (el, kind, value) => {
    if (kinds.includes(kind) && !excused(el, kind)) leaks.push([kind, value, describe(el)])
  }
  const colour = (el, property, css) => {
    const c = parse(css)
    if (!c || c.a <= 0.05) return
    if (isGrey(c)) add(el, 'grey', `${property} ${hex(c)}`)
    else if (spec.palette[hex({ ...c, a: 1 })]) add(el, 'palette', `${property} ${spec.palette[hex({ ...c, a: 1 })]}`)
  }
  const px = (value) => (/^-?\d*\.?\d+px$/.test(value) ? Number.parseFloat(value) : undefined)

  const elements = [document.body, ...document.body.querySelectorAll('*')]
  for (const el of elements) {
    if (el.closest('[data-ui-snapshot]') || (el.closest('svg') && el.tagName.toLowerCase() !== 'svg')) continue
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    if ((rect.width === 0 && rect.height === 0) || cs.visibility === 'hidden' || cs.display === 'none') continue
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())

    if (text) {
      if (!marker.test(cs.fontFamily)) add(el, 'font', cs.fontFamily.split(',')[0].replace(/"/g, '').trim())
      if (stockFontSizes.has(px(cs.fontSize))) add(el, 'font-size', cs.fontSize)
    }
    if (text || el.tagName.toLowerCase() === 'svg') colour(el, 'color', cs.color)
    colour(el, 'background', cs.backgroundColor)
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const style = cs.getPropertyValue(`border-${side}-style`)
      if (px(cs.getPropertyValue(`border-${side}-width`)) > 0 && style !== 'none' && style !== 'hidden') {
        colour(el, 'border', cs.getPropertyValue(`border-${side}-color`))
      }
    }
    const radii = new Set(
      ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((corner) =>
        px(cs.getPropertyValue(`border-${corner}-radius`).split(' ')[0])
      )
    )
    for (const radius of radii) if (stockRadii.has(radius)) add(el, 'radius', `${radius}px`)
    const spacing = new Set(
      ['padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'].map((p) =>
        px(cs.getPropertyValue(p))
      )
    )
    for (const value of spacing) if (stockSpacing.has(value)) add(el, 'spacing', `${value}px`)
    if (cs.boxShadow !== 'none') {
      for (const css of cs.boxShadow.match(COLOR_RE) ?? []) {
        const c = parse(css)
        if (c && c.a > 0.05 && isGrey(c)) add(el, 'shadow', hex(c))
      }
    }
  }
  return leaks
}

// Counts per `<kind> <value>`, with a few examples each.
export const summarize = (leaks) => {
  const byKey = {}
  for (const [kind, value, where] of leaks) {
    const entry = (byKey[`${kind} ${value}`] ??= { count: 0, examples: [] })
    entry.count += 1
    if (entry.examples.length < 3 && !entry.examples.includes(where)) entry.examples.push(where)
  }
  return byKey
}

// Reads the probe's inputs from the stress module the app itself loaded; null when the page does not render
// the stress theme (any vite dev server serves the module, so the import alone proves nothing).
export const loadSpec = (page) =>
  page.evaluate(async (url) => {
    try {
      const { stressProbeSpec } = await import(url)
      return getComputedStyle(document.body).fontFamily.includes(stressProbeSpec.fontMarker) ? stressProbeSpec : null
    } catch {
      return null
    }
  }, `/${STRESS_MODULE}`)

export const probe = (page, spec) =>
  page.evaluate(probeStress, { spec, exceptions: STRESS_EXCEPTIONS, kinds: KINDS }).then(summarize)

const readBaseline = () => (fs.existsSync(STRESS_BASELINE) ? JSON.parse(fs.readFileSync(STRESS_BASELINE, 'utf8')) : {})

const sortKeys = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))

// Compares the captures' leaks with the baseline; with `update`, writes them into it instead. Captures that did
// not run keep their baseline entry. Returns whether the run has leaks the baseline does not hold.
export const checkStress = (captures, { update }) => {
  const baseline = readBaseline()
  const ran = captures.filter((c) => c.stress)
  if (update) {
    for (const capture of ran) {
      const counts = Object.fromEntries(Object.entries(capture.stress).map(([key, { count }]) => [key, count]))
      if (Object.keys(counts).length) baseline[capture.file] = sortKeys(counts)
      else delete baseline[capture.file]
    }
    fs.writeFileSync(STRESS_BASELINE, `${JSON.stringify(sortKeys(baseline), null, 2)}\n`)
    console.log(`Stress baseline written: ${path.relative(ROOT, STRESS_BASELINE)}`)
    return false
  }
  const added = []
  let fixed = 0
  for (const capture of ran) {
    const before = baseline[capture.file] ?? {}
    for (const [key, { count, examples }] of Object.entries(capture.stress)) {
      if (count > (before[key] ?? 0))
        added.push(
          `  ${capture.file}  ${key}: ${count} (baseline ${before[key] ?? 0})\n      ${examples.join('\n      ')}`
        )
    }
    for (const [key, count] of Object.entries(before)) if ((capture.stress[key]?.count ?? 0) < count) fixed += 1
  }
  const total = ran.reduce((sum, c) => sum + Object.values(c.stress).reduce((n, { count }) => n + count, 0), 0)
  console.log(`Stress theme: ${total} stock values left in ${ran.length} captures (report: stress-report.json)`)
  if (fixed) console.log(`${fixed} leak counts went down; lock them in with ${UPDATE_FLAG}.`)
  if (!added.length) return false
  console.log(
    [
      'Elements that kept a stock value under the stress theme (the theme cannot reach them):',
      ...added,
      'Style them with theme tokens or a recipe. A real exception (a third-party widget, a brand mark) goes in',
      `STRESS_EXCEPTIONS in ${path.relative(ROOT, path.join(HERE, 'stress.mjs'))}, with a reason.`,
    ].join('\n')
  )
  return true
}
