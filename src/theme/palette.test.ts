import { describe, expect, it } from 'vitest'
import { PAGE_BACKGROUNDS } from './colors'
import {
  contrastColor,
  contrastRatio,
  generateBrandSemanticTokens,
  generatePaletteScale,
  normalizeHexColor,
  type PaletteScale,
} from './palette'

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

// The real page backgrounds, not a copy: these tests are the readability
// guarantee, so they have to measure against what the app actually paints.
const BACKGROUNDS = PAGE_BACKGROUNDS

const luminanceOf = (hex: string) => contrastRatio(hex, '#000000')

describe('normalizeHexColor', () => {
  it('accepts #rgb and #rrggbb in any case, with or without the hash', () => {
    expect(normalizeHexColor('#1A73E8')).toBe('#1a73e8')
    expect(normalizeHexColor('1a73e8')).toBe('#1a73e8')
    expect(normalizeHexColor('#abc')).toBe('#aabbcc')
    expect(normalizeHexColor('  #abc  ')).toBe('#aabbcc')
  })

  it('rejects anything that is not a 3 or 6 digit hex color', () => {
    for (const value of ['', 'red', '#12', '#1234', '#12345', '#1234567', 'rgb(0,0,0)', '#ggg', undefined]) {
      expect(normalizeHexColor(value), String(value)).toBeUndefined()
    }
  })
})

describe('generatePaletteScale', () => {
  it('keeps the configured color verbatim at 500', () => {
    expect(generatePaletteScale('#1a73e8')[500]).toBe('#1a73e8')
    expect(generatePaletteScale('1A73E8')[500]).toBe('#1a73e8')
  })

  it('rejects invalid input instead of producing a garbage scale', () => {
    expect(() => generatePaletteScale('blue')).toThrow(/Invalid hex color/)
  })

  it.each(['#1a73e8', '#ff6600', '#22c55e', '#000000', '#ffffff', '#808080'])(
    'produces a monotone light-to-dark ladder for %s',
    (base) => {
      const scale = generatePaletteScale(base)
      for (const step of STEPS) expect(scale[step]).toMatch(/^#[0-9a-f]{6}$/)
      const luminances = STEPS.map((step) => luminanceOf(scale[step]))
      for (let i = 1; i < luminances.length; i++) {
        expect(luminances[i], `${base}: step ${STEPS[i]} must not be lighter than ${STEPS[i - 1]}`).toBeLessThanOrEqual(
          luminances[i - 1]
        )
      }
    }
  )

  it('tints towards white and shades towards black', () => {
    const scale = generatePaletteScale('#1a73e8')
    expect(contrastRatio(scale[50], '#ffffff')).toBeLessThan(1.1)
    expect(contrastRatio(scale[950], '#000000')).toBeLessThan(1.2)
  })
})

describe('contrastColor', () => {
  it('uses white text on mid and dark tones and black only on pale ones', () => {
    expect(contrastColor('#1a73e8')).toBe('#ffffff') // mid blue: white, not the luminance-optimal black
    expect(contrastColor('#000000')).toBe('#ffffff')
    expect(contrastColor('#ffe600')).toBe('#000000')
    expect(contrastColor('#ffffff')).toBe('#000000')
  })

  // The 3:1 non-text bar would pass white here even though black reads twice as
  // well; labels are text, so they are held to AA's 4.5:1.
  it('falls back to black when white does not clear the 4.5:1 text bar', () => {
    for (const hex of ['#ff578d', '#ce8027', '#25d366', '#8bc34a', '#ff6600']) {
      const picked = contrastColor(hex)
      expect(picked, hex).toBe('#000000')
      expect(contrastRatio(hex, picked), hex).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('always clears 4.5:1, whatever the surface color', () => {
    for (let i = 0; i < 2000; i++) {
      const hex = `#${Math.floor(Math.random() * 0x1000000)
        .toString(16)
        .padStart(6, '0')}`
      expect(contrastRatio(hex, contrastColor(hex)), hex).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('generateBrandSemanticTokens', () => {
  const stepOf = (ref: string) => Number(/\{colors\.brand\.(\d+)\}/.exec(ref)?.[1]) as keyof PaletteScale

  it('mirrors the chakra colored-palette slot mapping', () => {
    const tokens = generateBrandSemanticTokens(generatePaletteScale('#1a73e8'), BACKGROUNDS)
    expect(tokens.fg).toEqual({ _light: '{colors.brand.700}', _dark: '{colors.brand.300}' })
    expect(tokens.muted).toEqual({ _light: '{colors.brand.200}', _dark: '{colors.brand.800}' })
    expect(tokens.subtle).toEqual({ _light: '{colors.brand.100}', _dark: '{colors.brand.900}' })
    expect(tokens.emphasized).toEqual({ _light: '{colors.brand.300}', _dark: '{colors.brand.700}' })
  })

  // focusRing and border are the two slots that must stay *visible against the
  // page*, so they follow the same readable step `solid` lands on rather than
  // chakra's fixed 500 (which is only safe for its own hand-tuned palettes).
  it.each(['#1a73e8', '#ffe600', '#0b1a3a', '#000000', '#ffffff'])(
    'keeps the focus ring and outline border readable against the page for %s',
    (base) => {
      const scale = generatePaletteScale(base)
      const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
      for (const slot of [tokens.focusRing, tokens.border]) {
        expect(contrastRatio(scale[stepOf(slot._light)], BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
        expect(contrastRatio(scale[stepOf(slot._dark)], BACKGROUNDS.dark)).toBeGreaterThanOrEqual(3)
      }
    }
  )

  it('uses the exact color for solid surfaces when it reads on both backgrounds', () => {
    const tokens = generateBrandSemanticTokens(generatePaletteScale('#1a73e8'), BACKGROUNDS)
    expect(tokens.solid).toEqual({ _light: '{colors.brand.500}', _dark: '{colors.brand.500}' })
    expect(tokens.contrast).toEqual({ _light: '#ffffff', _dark: '#ffffff' })
  })

  it.each(['#0b1a3a', '#000000'])('steps a near-black brand (%s) up in dark mode so buttons stay visible', (base) => {
    const scale = generatePaletteScale(base)
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    expect(tokens.solid._light).toBe('{colors.brand.500}')
    expect(stepOf(tokens.solid._dark)).toBeLessThan(500)
    expect(contrastRatio(scale[stepOf(tokens.solid._dark)], BACKGROUNDS.dark)).toBeGreaterThanOrEqual(3)
  })

  it.each(['#ffe600', '#ffffff'])('steps a pale brand (%s) down in light mode so buttons stay visible', (base) => {
    const scale = generatePaletteScale(base)
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    expect(tokens.solid._dark).toBe('{colors.brand.500}')
    expect(stepOf(tokens.solid._light)).toBeGreaterThan(500)
    expect(contrastRatio(scale[stepOf(tokens.solid._light)], BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
  })

  // Asserts the ratio, not `contrast === contrastColor(solid)` — that form is
  // tautological and passed even while light-mode labels sat at 3.0:1.
  it.each(['#1a73e8', '#ffe600', '#ff578d', '#25d366', '#000000', '#ffffff'])(
    'pairs solid with a label that clears the 4.5:1 text bar for %s',
    (base) => {
      const scale = generatePaletteScale(base)
      const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
      expect(contrastRatio(scale[stepOf(tokens.solid._light)], tokens.contrast._light)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(scale[stepOf(tokens.solid._dark)], tokens.contrast._dark)).toBeGreaterThanOrEqual(4.5)
    }
  )

  it('flips the label to black on a pale solid', () => {
    const scale = generatePaletteScale('#ffe600')
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    // Dark mode keeps the yellow at 500, so the label has to go black.
    expect(tokens.solid._dark).toBe('{colors.brand.500}')
    expect(tokens.contrast._dark).toBe('#000000')
  })
})
