import { describe, expect, it } from 'vitest'
import { system as stockSystem } from '../system'
import { getAppSystem, STRESS_FONT_MARKER, stressProbeSpec, stressSystem } from './stress'

const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
const isGrey = (hex: string) => {
  const [r, g, b] = rgb(hex)
  return Math.abs(r - g) < 4 && Math.abs(g - b) < 4
}

// allTokens repeats a semantic token once per condition
const semantic = (category: string) =>
  [...new Map(stressSystem.tokens.allTokens.map((token) => [token.name, token])).values()].filter(
    (token) =>
      token.extensions.category === category &&
      token.extensions.conditions &&
      !token.name.startsWith('colors.colorPalette') &&
      !token.extensions.negative
  )

const modeValues = (name: string) => {
  const conditions = stressSystem.tokens.getByName(name)?.extensions.conditions ?? {}
  return [conditions._light, conditions._dark] as string[]
}

describe('stress theme', () => {
  it('stands in for ~theme/system whatever the primary color', () => {
    expect(getAppSystem('#1a73e8')).toBe(stressSystem)
  })

  it('unwraps [value] escapes like the app system, so the captures render what users get', () => {
    expect(stressSystem.css({ p: '[3px]', mx: '[-5px]' })).toEqual({ padding: '3px', marginInline: '-5px' })
  })

  it('gives every semantic colour its own non-grey value in both modes, never a palette step', () => {
    const tokens = semantic('colors')
    expect(tokens.length).toBeGreaterThan(200)
    // The roles that start as aliases of another token still get a value of their own here.
    expect(tokens.map((token) => token.name)).toEqual(
      expect.arrayContaining([
        'colors.fg.faint',
        'colors.border.strong',
        'colors.accent.solid',
        'colors.accent.solidHover',
        'colors.accent.contrast',
        'colors.accent.subtle',
      ])
    )
    for (const [mode, index] of [
      ['light', 0],
      ['dark', 1],
    ] as const) {
      const values = tokens.map((token) => modeValues(token.name)[index])
      for (const [i, value] of values.entries()) {
        expect(value, `${tokens[i].name} (${mode})`).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)
        expect(isGrey(value), `${tokens[i].name} (${mode}) is grey: ${value}`).toBe(false)
        expect(stressProbeSpec.palette[value.slice(0, 7)], `${tokens[i].name} (${mode})`).toBeUndefined()
      }
      for (const group of ['surface', 'state', 'status', 'chart', 'bg', 'fg', 'border']) {
        const inGroup = tokens.filter((token) => token.name.startsWith(`colors.${group}.`)).map((t) => t.name)
        const groupValues = inGroup.map((name) => modeValues(name)[index])
        expect(new Set(groupValues).size, `${group} values repeat (${mode})`).toBe(groupValues.length)
      }
    }
  })

  // A hover is a fill and an edge is a line, so the stress palette gives them the lightness of those roles, not the
  // surface's (the light values run solid 40, line 55, surface 90).
  it('gives the accent fill hover the solid role and its edge the line role', () => {
    const lightness = (hex: string) => {
      const [r, g, b] = rgb(hex).map((channel) => channel / 255)
      return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100
    }
    expect(lightness(modeValues('colors.accent.solidHover')[0])).toBeLessThan(70)
    expect(lightness(modeValues('colors.accent.solidEdge')[0])).toBeLessThan(75)
    expect(lightness(modeValues('colors.accent.solid')[0])).toBeLessThan(70)
  })

  it('gives every shadow role its own coloured shadow', () => {
    const tokens = semantic('shadows')
    expect(tokens.map((token) => token.name)).toEqual(
      expect.arrayContaining(['shadows.shadow.card', 'shadows.shadow.control', 'shadows.md'])
    )
    const light = tokens.map((token) => modeValues(token.name)[0])
    expect(new Set(light).size).toBe(light.length)
    for (const value of light) {
      const colour = /#[0-9a-f]{8}/.exec(value)?.[0]
      expect(colour && !isGrey(colour), value).toBe(true)
    }
  })

  it('moves fonts, radii, font sizes and spacing off every stock value', () => {
    for (const name of ['fonts.body', 'fonts.heading', 'fonts.figure', 'fonts.mono']) {
      expect(stressSystem.tokens.getByName(name)?.value).toContain(`"${STRESS_FONT_MARKER} `)
    }
    for (const [category, stockValues] of [
      ['radii', stressProbeSpec.radii],
      ['fontSizes', stressProbeSpec.fontSizes],
      ['spacing', stressProbeSpec.spacing],
    ] as const) {
      expect(stockValues.length, category).toBeGreaterThan(5)
      const changed = stockSystem.tokens.allTokens.filter(
        (token) => token.extensions.category === category && /^\d*\.?\d+(px|rem)$/.test(String(token.value))
      )
      for (const token of changed) {
        const stressed = String(stressSystem.tokens.getByName(token.name)?.value)
        if (/^0(px|rem)$/.test(String(token.value))) continue
        expect(stressed, token.name).toMatch(/^\d+(\.\d+)?px$/)
        expect(stockValues, `${token.name} = ${stressed}`).not.toContain(Number.parseFloat(stressed))
      }
    }
  })

  it('moves the control heights a pixel, so an input padded by its height is off the spacing scale', () => {
    expect(stockSystem.token('sizes.control.touch')).toBe('44px')
    expect(stressSystem.token('sizes.control.touch')).toBe('45px')
    expect(stressSystem.token('sizes.control.tablet')).toBe('41px')
    expect(stressSystem.token('sizes.control.md')).toBe('35px')
  })

  it('lists the stock palette steps it looks for, without the third-party brand marks', () => {
    expect(stressProbeSpec.palette['#6b6b6b']).toBe('gray.500')
    expect(Object.values(stressProbeSpec.palette).some((name) => name.startsWith('whatsapp.'))).toBe(false)
  })
})
