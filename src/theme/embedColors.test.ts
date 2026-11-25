import { describe, expect, it } from 'vitest'
import { PAGE_BACKGROUNDS } from './colors'
import { EMBED_DARK, embedBrandColor } from './embedColors'
import { generateBrandSemanticTokens, generatePaletteScale, type PaletteScale } from './palette'

describe('embedBrandColor', () => {
  it('keeps Fil blue without a configured brand', () => {
    expect(embedBrandColor(undefined)).toBe(EMBED_DARK.primary)
    expect(embedBrandColor('not a colour')).toBe(EMBED_DARK.primary)
  })

  it('takes the dark solid of a configured brand, the one the buttons fill with', () => {
    const scale = generatePaletteScale('#ff6600')
    const darkSolid = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS).solid._dark
    const step = Number(/brand\.(\d+)/.exec(darkSolid)?.[1]) as keyof PaletteScale
    expect(embedBrandColor('#ff6600')).toBe(scale[step])
    expect(embedBrandColor('#ff6600')).not.toBe(EMBED_DARK.primary)
  })
})
