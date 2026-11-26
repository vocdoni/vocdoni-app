import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FONT_FAMILY, FONT_PACKAGE, FONT_STACKS, LOADED_FONT_WEIGHTS } from './fonts'
import { system } from './system'

const srcRoot = resolve(__dirname, '..')

// Every @fontsource specifier in src/, whatever the import form, so a font
// loaded elsewhere cannot slip past the check.
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx|css)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : []
  })

const importedFontCss = () =>
  sourceFiles(srcRoot).flatMap((file) =>
    Array.from(readFileSync(file, 'utf-8').matchAll(/['"](@fontsource\/[^'"]+\.css)['"]/g), (match) => match[1])
  )

describe('font config', () => {
  it('the app loads exactly the configured weights, one static import each', () => {
    expect(importedFontCss()).toEqual(LOADED_FONT_WEIGHTS.map((weight) => `${FONT_PACKAGE}/latin-${weight}.css`))
  })

  it('body and heading stacks lead with the loaded family', () => {
    expect(system.token('fonts.body')).toBe(FONT_STACKS.body)
    expect(system.token('fonts.heading')).toBe(FONT_STACKS.heading)
    expect(FONT_STACKS.body.startsWith(`"${FONT_FAMILY}",`)).toBe(true)
  })

  // No faux bold: a weight token without a loaded file behind it makes the
  // browser synthesize one. Checked on the built system, so Chakra's stock
  // names (semibold, extrabold, black...) are held to the same bar.
  it('every font weight token is a loaded weight', () => {
    const weights = system.tokens.categoryMap.get('fontWeights')
    expect(weights?.size).toBeGreaterThan(0)
    const loaded: readonly number[] = LOADED_FONT_WEIGHTS
    const offenders = Array.from(weights ?? [], ([name, token]) => [name, Number(token.value)] as const).filter(
      ([, value]) => !loaded.includes(value)
    )
    expect(offenders).toEqual([])
  })

  it('renders headings, bold and <b>/<strong> at 500, default labels and running text at 400', () => {
    expect(system.token('fontWeights.bold')).toBe('500')
    expect(system.token('fontWeights.semibold')).toBe('500')
    expect(system.token('fontWeights.medium')).toBe('400')
    expect(system.token('fontWeights.normal')).toBe('400')
    expect(system.token('fontWeights.light')).toBe('300')
    // Lands in the base layer, which wins over the reset layer's `bolder`.
    expect(system.getGlobalCss()).toMatchObject({
      '@layer base': { '&b, &strong': { fontWeight: 'var(--chakra-font-weights-bold)' } },
    })
  })
})
