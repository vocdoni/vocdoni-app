// Reads and writes the ratchet baselines of the snapshot modes (a11y-baseline.json, stress-baseline.json): one JSON
// object per capture file, holding the counts of that capture, with keys sorted so that diffs stay small.
import fs from 'node:fs'

export const sortKeys = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))

export const readBaseline = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {})

export const writeBaseline = (file, baseline) =>
  fs.writeFileSync(file, `${JSON.stringify(sortKeys(baseline), null, 2)}\n`)
