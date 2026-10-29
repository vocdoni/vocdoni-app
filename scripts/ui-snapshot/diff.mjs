// Compares two UI snapshot runs (see README.md) and prints every element whose computed style or
// rounded size changed. Exit code 0 = identical, 1 = differences (or captures missing on one side).
//
//   pnpm ui:diff -- <labelA> <labelB> [--ignore prop,prop] [--limit <n per capture>]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT_ROOT = path.join(ROOT, '.ui-snapshot')

const usage = (message) => {
  if (message) console.error(`ui:diff: ${message}`)
  console.error('usage: pnpm ui:diff -- <labelA> <labelB> [--ignore prop,prop] [--limit 50]')
  process.exit(2)
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== '--'),
  allowPositionals: true,
  options: {
    ignore: { type: 'string', default: '' },
    limit: { type: 'string', default: '50' },
  },
})
if (positionals.length !== 2) usage('give exactly two labels')
const [labelA, labelB] = positionals
const ignore = new Set(values.ignore.split(',').filter(Boolean))
const limit = Number(values.limit)
if (!Number.isInteger(limit) || limit < 0) usage('--limit must be a whole number')

const dirOf = (label) => {
  const dir = path.join(OUT_ROOT, label)
  if (!fs.existsSync(path.join(dir, 'summary.json')))
    usage(`no snapshot "${label}" in ${path.relative(ROOT, OUT_ROOT)}/`)
  return dir
}
const dirA = dirOf(labelA)
const dirB = dirOf(labelB)
const summaryA = JSON.parse(fs.readFileSync(path.join(dirA, 'summary.json'), 'utf8'))
const summaryB = JSON.parse(fs.readFileSync(path.join(dirB, 'summary.json'), 'utf8'))

if (summaryA.browser?.version !== summaryB.browser?.version) {
  console.log(
    `WARNING: different browsers (${summaryA.browser?.version} vs ${summaryB.browser?.version}); rendering may differ.\n`
  )
}

const captures = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'summary.json')
    .map((f) => f.slice(0, -5))
    .sort()

// { path: { prop: value, width, height } } from the compact on-disk format.
const expand = (file) => {
  const { props, styles, elements } = JSON.parse(fs.readFileSync(file, 'utf8'))
  const out = new Map()
  for (const [key, [index, width, height]] of Object.entries(elements)) {
    const row = { width: String(width), height: String(height) }
    styles[index].forEach((v, i) => (row[props[i]] = v))
    for (const p of ignore) delete row[p]
    out.set(key, row)
  }
  return out
}

const namesA = captures(dirA)
const namesB = captures(dirB)
const onlyA = namesA.filter((n) => !namesB.includes(n))
const onlyB = namesB.filter((n) => !namesA.includes(n))
const common = namesA.filter((n) => namesB.includes(n))

const total = { captures: 0, changed: 0, props: 0, added: 0, removed: 0 }
let samePng = 0
let comparedPng = 0

for (const name of common) {
  const a = expand(path.join(dirA, `${name}.json`))
  const b = expand(path.join(dirB, `${name}.json`))
  const lines = []
  let changed = 0
  let added = 0
  let removed = 0
  for (const [key, before] of a) {
    const after = b.get(key)
    if (!after) {
      removed += 1
      lines.push(`  - ${key}`)
      continue
    }
    const props = Object.keys(before).filter((p) => before[p] !== after[p])
    if (!props.length) continue
    changed += 1
    total.props += props.length
    lines.push(`  ~ ${key}`)
    for (const p of props) lines.push(`      ${p}: ${before[p]} → ${after[p]}`)
  }
  for (const key of b.keys()) {
    if (!a.has(key)) {
      added += 1
      lines.push(`  + ${key}`)
    }
  }

  const pngA = path.join(dirA, `${name}.png`)
  const pngB = path.join(dirB, `${name}.png`)
  if (fs.existsSync(pngA) && fs.existsSync(pngB)) {
    comparedPng += 1
    if (fs.readFileSync(pngA).equals(fs.readFileSync(pngB))) samePng += 1
  }

  if (!changed && !added && !removed) continue
  total.captures += 1
  total.changed += changed
  total.added += added
  total.removed += removed
  console.log(`${name}: ${changed} changed, ${added} added, ${removed} removed`)
  // Only whole element blocks are cut, so a property line never loses its element.
  let elements = 0
  for (const line of lines) {
    const isElement = !line.startsWith('      ')
    if (isElement) elements += 1
    if (elements > limit) break
    console.log(line)
  }
  if (elements > limit) console.log(`  … ${changed + added + removed - limit} more elements (raise --limit)`)
  console.log('')
}

for (const n of onlyA) console.log(`only in ${labelA}: ${n}`)
for (const n of onlyB) console.log(`only in ${labelB}: ${n}`)
const errorsA = summaryA.captures.filter((c) => c.error).length
const errorsB = summaryB.captures.filter((c) => c.error).length
if (errorsA || errorsB) console.log(`failed captures: ${labelA} ${errorsA}, ${labelB} ${errorsB} (see summary.json)`)

console.log(
  `Total: ${total.captures} of ${common.length} captures differ; ${total.changed} elements changed ` +
    `(${total.props} properties), ${total.added} added, ${total.removed} removed; ` +
    `${onlyA.length + onlyB.length} captures on one side only.` +
    (ignore.size ? ` Ignored: ${[...ignore].join(', ')}.` : '')
)
console.log(`Screenshots: ${samePng} of ${comparedPng} byte-identical (informational).`)
process.exit(total.captures || onlyA.length || onlyB.length ? 1 : 0)
