import { describe, expect, it } from 'vitest'
import { PAGE_BACKGROUNDS } from './colors'
import { EMBED_DARK, embedBrandColors } from './embedColors'
import { contrastRatio, generateBrandSemanticTokens, generatePaletteScale, type PaletteScale } from './palette'

describe('embedBrandColors', () => {
  it('keeps Fil blue, its label and its hover without a configured brand', () => {
    expect(embedBrandColors(undefined)).toEqual({
      brand: EMBED_DARK.primary,
      text: EMBED_DARK.primaryText,
      emphasis: EMBED_DARK.primaryHover,
    })
    expect(embedBrandColors('not a colour').brand).toBe(EMBED_DARK.primary)
  })

  it('takes the dark solid of a configured brand, the one the buttons fill with', () => {
    const scale = generatePaletteScale('#ff6600')
    const darkSolid = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS).solid._dark
    const step = Number(/brand\.(\d+)/.exec(darkSolid)?.[1]) as keyof PaletteScale
    expect(embedBrandColors('#ff6600').brand).toBe(scale[step])
    expect(embedBrandColors('#ff6600').brand).not.toBe(EMBED_DARK.primary)
  })

  // The label is the palette's own contrast colour for the solid, so it reads on the brand as the buttons' labels do.
  it.each(['#1a55cc', '#ff6600', '#ffe600', '#000000'])('labels the brand %s with a readable text colour', (base) => {
    const { brand, text } = embedBrandColors(base)
    expect(contrastRatio(text, brand)).toBeGreaterThanOrEqual(4.5)
  })

  // The hover is the solid nudged 6% towards white, as the app's own solid hover is in dark.
  it.each(['#1a55cc', '#ff6600'])('makes the hover of %s a slightly lighter brand', (base) => {
    const { brand, emphasis } = embedBrandColors(base)
    expect(emphasis).not.toBe(brand)
    expect(contrastRatio(emphasis, brand)).toBeLessThan(1.3)
  })
})
