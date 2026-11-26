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

  it('takes the dark line step of a configured brand, the one its focus ring uses', () => {
    const scale = generatePaletteScale('#ff6600')
    const darkLine = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS).focusRing._dark
    const step = Number(/brand\.(\d+)/.exec(darkLine)?.[1]) as keyof PaletteScale
    expect(embedBrandColors('#ff6600').brand).toBe(scale[step])
    expect(embedBrandColors('#ff6600').brand).not.toBe(EMBED_DARK.primary)
  })

  // The label and the hover are the ones the palette gives that fill, so they read on it as the app's buttons do.
  it.each(['#1a55cc', '#ff6600', '#ffe600', '#000000'])('labels the brand %s and its hover readably', (base) => {
    const { brand, text, emphasis } = embedBrandColors(base)
    expect(contrastRatio(text, brand)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(text, emphasis)).toBeGreaterThanOrEqual(4.5)
  })

  // The booker sits on the dark dialog, so a brand as dark as black must still show there (its fills would vanish).
  it('keeps a near-black brand readable on the dark dialog', () => {
    expect(contrastRatio(embedBrandColors('#000000').brand, EMBED_DARK.dialog)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(embedBrandColors('#0b0b0b').brand, EMBED_DARK.dialog)).toBeGreaterThanOrEqual(3)
  })
})
