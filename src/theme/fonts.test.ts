import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FONT_FAMILY, FONT_PACKAGE, FONT_STACKS, LOADED_FONT_WEIGHTS } from './fonts'
import { system } from './system'

const themeSource = readFileSync(resolve(__dirname, 'Theme.tsx'), 'utf-8')

const importedFontCss = () =>
  Array.from(themeSource.matchAll(/\bimport\s*['"](@fontsource\/[^'"]+)['"]/g), (match) => match[1])

describe('font config', () => {
  it('Theme.tsx loads exactly the configured weights, one static import each', () => {
    expect(importedFontCss()).toEqual(LOADED_FONT_WEIGHTS.map((weight) => `${FONT_PACKAGE}/${weight}.css`))
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

  it('renders headings, bold and <b>/<strong> at 500, labels and running text at 400', () => {
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
