import { describe, expect, it } from 'vitest'
import {
  contrastColor,
  contrastRatio,
  generateBrandSemanticTokens,
  generatePaletteScale,
  normalizeHexColor,
  type PaletteScale,
} from './palette'

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

// Page backgrounds as in system.ts: white and the dark-mode `ink.650` surface.
const BACKGROUNDS = { light: '#ffffff', dark: '#0a0a0a' }

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
})

describe('generateBrandSemanticTokens', () => {
  const stepOf = (ref: string) => Number(/\{colors\.brand\.(\d+)\}/.exec(ref)?.[1]) as keyof PaletteScale

  it('mirrors the chakra colored-palette slot mapping', () => {
    const tokens = generateBrandSemanticTokens(generatePaletteScale('#1a73e8'), BACKGROUNDS)
    expect(tokens.fg).toEqual({ _light: '{colors.brand.700}', _dark: '{colors.brand.300}' })
    expect(tokens.muted).toEqual({ _light: '{colors.brand.200}', _dark: '{colors.brand.800}' })
    expect(tokens.subtle).toEqual({ _light: '{colors.brand.100}', _dark: '{colors.brand.900}' })
    expect(tokens.emphasized).toEqual({ _light: '{colors.brand.300}', _dark: '{colors.brand.700}' })
    expect(tokens.focusRing).toEqual({ _light: '{colors.brand.500}', _dark: '{colors.brand.500}' })
  })

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

  it('derives the contrast text color from the step solid actually landed on', () => {
    const scale = generatePaletteScale('#ffe600')
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    // Light mode walked down to a dark olive: white text. Dark mode kept the yellow: black text.
    expect(tokens.contrast._light).toBe(contrastColor(scale[stepOf(tokens.solid._light)]))
    expect(tokens.contrast._dark).toBe('#000000')
  })
})
