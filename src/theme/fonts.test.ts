import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FONT_FAMILY, FONT_PACKAGE, FONT_STACKS, LOADED_FONT_WEIGHTS } from './fonts'
import { system } from './system'

const themeSource = readFileSync(resolve(__dirname, 'Theme.tsx'), 'utf-8')

const importedFontCss = () =>
  Array.from(themeSource.matchAll(/^import\s+['"](@fontsource\/[^'"]+)['"]/gm), (match) => match[1])

describe('font config', () => {
  it('Theme.tsx loads exactly the configured weights, one static import each', () => {
    expect(importedFontCss()).toEqual(LOADED_FONT_WEIGHTS.map((weight) => `${FONT_PACKAGE}/${weight}.css`))
  })

  it('body and heading stacks lead with the loaded family', () => {
    expect(system.token('fonts.body')).toBe(FONT_STACKS.body)
    expect(system.token('fonts.heading')).toBe(FONT_STACKS.heading)
    expect(FONT_STACKS.body.startsWith(`"${FONT_FAMILY}",`)).toBe(true)
  })
})
