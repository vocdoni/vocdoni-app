import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FONT_STACKS, FONT_WEIGHTS, fontCssFiles, SANS, shipsWeight, WEB_FONTS, type WebFont } from './fonts'
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
    Array.from(
      readFileSync(file, 'utf-8').matchAll(/['"](@fontsource(?:-variable)?\/[^'"]+\.css)['"]/g),
      (match) => match[1]
    )
  )

describe('font config', () => {
  it('the app loads exactly the files of the configured families, one static import each', () => {
    expect(importedFontCss()).toEqual(WEB_FONTS.flatMap(fontCssFiles))
  })

  it('text, heading and figure stacks lead with a family the app loads', () => {
    for (const name of ['body', 'heading', 'figure'] as const) {
      expect(system.token(`fonts.${name}`)).toBe(FONT_STACKS[name])
      expect(
        WEB_FONTS.some((font) => FONT_STACKS[name].startsWith(`"${font.family}",`)),
        name
      ).toBe(true)
    }
  })

  // No faux bold: a weight token without a real face behind it makes the
  // browser synthesize one. Checked on the built system, so Chakra's stock
  // names (semibold, extrabold, black...) are held to the same bar.
  it('every font weight token is a weight the text family ships', () => {
    const weights = system.tokens.categoryMap.get('fontWeights')
    expect(weights?.size).toBeGreaterThan(0)
    const offenders = Array.from(weights ?? [], ([name, token]) => [name, Number(token.value)] as const).filter(
      ([, value]) => !shipsWeight(SANS, value)
    )
    expect(offenders).toEqual([])
  })

  it('builds one weight token per step of the ladder', () => {
    for (const [name, weight] of Object.entries(FONT_WEIGHTS)) {
      expect(system.token(`fontWeights.${name}`), name).toBe(String(weight))
    }
  })

  it('renders headings, bold and <b>/<strong> at 600, labels at 500 to 550, running text at 400', () => {
    expect(system.token('fontWeights.bold')).toBe('600')
    expect(system.token('fontWeights.semibold')).toBe('600')
    expect(system.token('fontWeights.medium-plus')).toBe('550')
    expect(system.token('fontWeights.medium')).toBe('500')
    expect(system.token('fontWeights.normal-plus')).toBe('450')
    expect(system.token('fontWeights.normal')).toBe('400')
    expect(system.token('fontWeights.light')).toBe('400')
    expect(system.token('fontWeights.bolder')).toBe('700')
    // Lands in the base layer, which wins over the reset layer's `bolder`.
    expect(system.getGlobalCss()).toMatchObject({
      '@layer base': { '&b, &strong': { fontWeight: 'var(--chakra-font-weights-semibold)' } },
    })
  })

  it('loads Commissioner for the interface and JetBrains Mono for figures', () => {
    expect(FONT_STACKS.body).toMatch(/^"Commissioner Variable", /)
    expect(FONT_STACKS.figure).toMatch(/^"JetBrains Mono Variable", .*monospace$/)
    expect(FONT_STACKS.mono).toBe(FONT_STACKS.figure)
  })

  it('models a static family as one file per weight and a variable one as one file for its range', () => {
    expect(fontCssFiles(SANS)).toEqual(['@fontsource-variable/commissioner/wght.css'])
    const variable: WebFont = {
      family: 'Variable Sans',
      package: '@fontsource-variable/variable-sans',
      files: { kind: 'variable', range: [400, 700], css: 'wght.css' },
    }
    expect(fontCssFiles(variable)).toEqual(['@fontsource-variable/variable-sans/wght.css'])
    expect([300, 400, 450, 550, 700, 800].map((weight) => shipsWeight(variable, weight))).toEqual([
      false,
      true,
      true,
      true,
      true,
      false,
    ])
    const staticFont: WebFont = {
      family: 'Static Sans',
      package: '@fontsource/static-sans',
      files: { kind: 'static', weights: [400, 500] },
    }
    expect(fontCssFiles(staticFont)).toEqual(['@fontsource/static-sans/400.css', '@fontsource/static-sans/500.css'])
    expect(shipsWeight(staticFont, 450)).toBe(false)
    expect(shipsWeight(SANS, 550)).toBe(true)
  })
})
