import { describe, expect, it } from 'vitest'
import { colors, PAGE_BACKGROUNDS } from './colors'
import {
  contrastColor,
  contrastRatio,
  generateAccentTokens,
  generateBrandSemanticTokens,
  generatePaletteScale,
  generateSolidEdge,
  INK,
  normalizeHexColor,
  solidHoverColor,
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
  it('uses white text on mid and dark tones and ink on pale ones', () => {
    expect(contrastColor('#1a73e8')).toBe('#ffffff') // mid blue: white, not the luminance-optimal dark label
    expect(contrastColor('#000000')).toBe('#ffffff')
    expect(contrastColor('#ffe600')).toBe(INK)
    expect(contrastColor('#ffffff')).toBe(INK)
  })

  it("is Fil's ink, the gray.900 of the theme", () => {
    expect(INK).toBe(colors.gray[900].value)
  })

  // The 3:1 non-text bar would pass white here even though ink reads twice as well; labels are text, so they are
  // held to AA's 4.5:1.
  it('falls back to ink when white does not clear the 4.5:1 text bar', () => {
    for (const hex of ['#ff578d', '#ce8027', '#25d366', '#8bc34a', '#ff6600', '#df5020']) {
      const picked = contrastColor(hex)
      expect(picked, hex).toBe(INK)
      expect(contrastRatio(hex, picked), hex).toBeGreaterThanOrEqual(4.5)
    }
  })

  // Between luminance 0.1833 (white under 4.5:1) and 0.2136 (ink at 4.5:1) neither reads; black still does.
  it.each(['#8b5cf6', '#ed0630'])('uses black where neither white nor ink reaches 4.5:1 (%s)', (hex) => {
    expect(contrastRatio(hex, '#ffffff')).toBeLessThan(4.5)
    expect(contrastRatio(hex, INK)).toBeLessThan(4.5)
    expect(contrastColor(hex)).toBe('#000000')
    expect(contrastRatio(hex, '#000000')).toBeGreaterThanOrEqual(4.5)
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

  // `fg` is brand-coloured text on the page itself (links, outline buttons,
  // active tab labels), so it is held to the 4.5:1 text bar, not 3:1.
  it.each(['#1a73e8', '#ffd600', '#ffe600', '#ffffff', '#0b1a3a', '#001f54', '#000000', '#ff6600'])(
    'keeps the brand text color readable on the page in both modes for %s',
    (base) => {
      const scale = generatePaletteScale(base)
      const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
      expect(contrastRatio(scale[stepOf(tokens.fg._light)], BACKGROUNDS.light), 'light').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(scale[stepOf(tokens.fg._dark)], BACKGROUNDS.dark), 'dark').toBeGreaterThanOrEqual(4.5)
    }
  )

  it('walks a pale brand (#ffd600) down the scale in light mode instead of keeping a washed-out 700', () => {
    const scale = generatePaletteScale('#ffd600')
    expect(contrastRatio(scale[700], BACKGROUNDS.light)).toBeLessThan(4.5) // the old fixed step
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    expect(stepOf(tokens.fg._light)).toBeGreaterThan(700)
    expect(tokens.fg._dark).toBe('{colors.brand.300}') // already reads on the dark page
  })

  // The dark-mode 300 is a 60% tint of the brand, so it stays light whatever the
  // hue: a navy keeps chakra's mapping and still reads on the near-black page.
  // (The walk towards 50 is a guard that the current scale mixing never reaches.)
  it.each(['#001a4d', '#000080', '#0b1a3a'])('gives a navy brand (%s) readable text in dark mode', (base) => {
    const scale = generatePaletteScale(base)
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    expect(tokens.fg._dark).toBe('{colors.brand.300}')
    expect(contrastRatio(scale[stepOf(tokens.fg._dark)], BACKGROUNDS.dark)).toBeGreaterThanOrEqual(4.5)
  })

  // The owner's rule: the organisation's colour is the colour that fills, whatever its lightness, in both scopes.
  it.each(['#1a73e8', '#ffe600', '#fff59d', '#0b1a3a', '#000000', '#ffffff'])(
    'fills with the exact colour in both scopes for %s',
    (base) => {
      const tokens = generateBrandSemanticTokens(generatePaletteScale(base), BACKGROUNDS)
      expect(tokens.solid).toEqual({ _light: '{colors.brand.500}', _dark: '{colors.brand.500}' })
    }
  )

  it.each(['#0b1a3a', '#000000'])(
    'keeps a near-black brand (%s) exact in the dark scope, with a readable ring',
    (base) => {
      const scale = generatePaletteScale(base)
      const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
      expect(tokens.solid._dark).toBe('{colors.brand.500}')
      expect(contrastRatio(scale[500], BACKGROUNDS.dark)).toBeLessThan(3)
      expect(stepOf(tokens.focusRing._dark)).toBeLessThan(500)
      expect(contrastRatio(scale[stepOf(tokens.focusRing._dark)], BACKGROUNDS.dark)).toBeGreaterThanOrEqual(3)
    }
  )

  it.each(['#ffe600', '#ffffff'])('keeps a pale brand (%s) exact on the light page, with a readable ring', (base) => {
    const scale = generatePaletteScale(base)
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    expect(tokens.solid._light).toBe('{colors.brand.500}')
    expect(contrastRatio(scale[500], BACKGROUNDS.light)).toBeLessThan(3)
    expect(stepOf(tokens.focusRing._light)).toBeGreaterThan(500)
    expect(contrastRatio(scale[stepOf(tokens.focusRing._light)], BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
  })

  // Asserts the ratio, not `contrast === contrastColor(solid)` — that form is
  // tautological and passed even while light-mode labels sat at 3.0:1.
  it.each(['#1a73e8', '#ffe600', '#ff578d', '#25d366', '#8b5cf6', '#000000', '#ffffff'])(
    'pairs solid with a label that clears the 4.5:1 text bar for %s',
    (base) => {
      const scale = generatePaletteScale(base)
      const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
      expect(contrastRatio(scale[stepOf(tokens.solid._light)], tokens.contrast._light)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(scale[stepOf(tokens.solid._dark)], tokens.contrast._dark)).toBeGreaterThanOrEqual(4.5)
    }
  )

  it('labels a pale solid in ink in both scopes', () => {
    const tokens = generateBrandSemanticTokens(generatePaletteScale('#ffe600'), BACKGROUNDS)
    expect(tokens.contrast).toEqual({ _light: INK, _dark: INK })
  })
})

describe('generateSolidEdge', () => {
  it("draws no edge for Fil's blue in either scope", () => {
    expect(generateSolidEdge(generatePaletteScale('#1d62e9'), BACKGROUNDS)).toEqual({
      _light: 'transparent',
      _dark: 'transparent',
    })
  })

  it('edges a pale fill on the light page and a near-black one in the dark scope, with the control line', () => {
    expect(generateSolidEdge(generatePaletteScale('#f5d90a'), BACKGROUNDS)).toEqual({
      _light: '{colors.border.emphasized}',
      _dark: 'transparent',
    })
    expect(generateSolidEdge(generatePaletteScale('#0b1a3a'), BACKGROUNDS)).toEqual({
      _light: 'transparent',
      _dark: '{colors.border.emphasized}',
    })
  })
})

describe('generateAccentTokens', () => {
  it('keeps the stock black accent white on the dark page instead of its grey readable step', () => {
    expect(generateAccentTokens(generatePaletteScale('#000000'), BACKGROUNDS)).toEqual({
      fg: { _light: '{colors.brand.fg}', _dark: '{colors.white}' },
    })
  })

  it.each(['#1a73e8', '#ffd600', '#0b1a3a', '#cccccc'])('follows the brand in both modes for %s', (base) => {
    const tokens = generateAccentTokens(generatePaletteScale(base), BACKGROUNDS)
    expect(tokens.fg).toEqual({ _light: '{colors.brand.fg}', _dark: '{colors.brand.fg}' })
  })
})

describe('solidHoverColor', () => {
  it('darkens a fill whose label is white', () => {
    expect(contrastColor('#1a73e8')).toBe('#ffffff')
    expect(luminanceOf(solidHoverColor('#1a73e8'))).toBeLessThan(luminanceOf('#1a73e8'))
  })

  it('darkens a pale fill whose ink label still reads on the darker hover', () => {
    expect(contrastColor('#f5d90a')).toBe(INK)
    const hover = solidHoverColor('#f5d90a')
    expect(luminanceOf(hover)).toBeLessThan(luminanceOf('#f5d90a'))
    expect(contrastRatio(hover, INK)).toBeGreaterThanOrEqual(4.5)
  })

  // White is under 4.5:1 on this orange, so its label is ink; 12% darker would take ink under 4.5:1 too.
  it('lightens a fill whose dark label would not read on a darker hover', () => {
    expect(contrastColor('#df5020')).toBe(INK)
    const hover = solidHoverColor('#df5020')
    expect(luminanceOf(hover)).toBeGreaterThan(luminanceOf('#df5020'))
    expect(contrastRatio(hover, INK)).toBeGreaterThanOrEqual(4.5)
  })
})

// An organisation colour is arbitrary input (a branded vote paints the page with it), so every pairing the voter page
// draws is checked on 24 hues x 5 lightness steps at 75% saturation, plus white, black, a pale yellow and a mid grey.
const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const k = (n: number) => (n + hue / 30) % 12
  const a = saturation * Math.min(lightness, 1 - lightness)
  const channel = (n: number) => lightness - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return `#${[0, 8, 4]
    .map((n) =>
      Math.round(channel(n) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

const ORGANISATION_COLOURS = [
  ...Array.from({ length: 24 }, (_, i) => [0.2, 0.35, 0.5, 0.65, 0.8].map((l) => hslToHex(i * 15, 0.75, l))).flat(),
  '#ffffff',
  '#000000',
  '#fff59d',
  '#808080',
]

describe('readability of any organisation colour', () => {
  it('covers 124 colours', () => {
    expect(new Set(ORGANISATION_COLOURS).size).toBe(124)
  })

  it.each(ORGANISATION_COLOURS)('keeps every accent pairing readable for %s', (base) => {
    const scale = generatePaletteScale(base)
    const tokens = generateBrandSemanticTokens(scale, BACKGROUNDS)
    const edge = generateSolidEdge(scale, BACKGROUNDS)
    const at = (ref: string) => scale[Number(/\{colors\.brand\.(\d+)\}/.exec(ref)?.[1]) as keyof PaletteScale]
    const solid = at(tokens.solid._light)

    // The fill is the given colour, in both scopes.
    expect(solid, 'solid is the given colour').toBe(normalizeHexColor(base))
    expect(at(tokens.solid._dark), 'solid is the given colour, dark').toBe(normalizeHexColor(base))
    // Under 3:1 against a scope's page the fill draws the control line as its edge; otherwise none.
    for (const mode of ['light', 'dark'] as const) {
      const under = contrastRatio(solid, BACKGROUNDS[mode]) < 3
      expect(edge[`_${mode}`], `edge (${mode})`).toBe(under ? '{colors.border.emphasized}' : 'transparent')
    }
    // Its label, at rest and on the hover fill (the same in both scopes).
    const hover = solidHoverColor(solid)
    expect(contrastRatio(solid, tokens.contrast._light), 'label on solid').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(solid, tokens.contrast._dark), 'label on solid, dark').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(hover, tokens.contrast._light), 'label on solidHover').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(hover, tokens.contrast._dark), 'label on solidHover, dark').toBeGreaterThanOrEqual(4.5)
    // Lines and text on the page keep walking the scale.
    expect(contrastRatio(at(tokens.focusRing._light), BACKGROUNDS.light), 'focus ring').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(at(tokens.focusRing._dark), BACKGROUNDS.dark), 'focus ring, dark').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(at(tokens.border._light), BACKGROUNDS.light), 'accent line').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(at(tokens.fg._light), BACKGROUNDS.light), 'fg on the page').toBeGreaterThanOrEqual(4.5)
    // A selected option's text on its subtle fill, a link under the pointer.
    expect(contrastRatio(at(tokens.fg._light), at(tokens.subtle._light)), 'fg on subtle').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(at(tokens.fg._dark), at(tokens.subtle._dark)), 'fg on subtle, dark').toBeGreaterThanOrEqual(
      4.5
    )
    expect(contrastRatio(scale[950], BACKGROUNDS.light), 'accent.fg.hover (brand.950)').toBeGreaterThanOrEqual(4.5)
  })
})
