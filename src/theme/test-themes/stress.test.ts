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

  it('gives every semantic colour its own non-grey value in both modes, never a palette step', () => {
    const tokens = semantic('colors')
    expect(tokens.length).toBeGreaterThan(200)
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

  it('gives every shadow role its own coloured shadow', () => {
    const tokens = semantic('shadows')
    expect(tokens.map((token) => token.name)).toEqual(expect.arrayContaining(['shadows.shadow.card', 'shadows.md']))
    const light = tokens.map((token) => modeValues(token.name)[0])
    expect(new Set(light).size).toBe(light.length)
    for (const value of light) {
      const colour = /#[0-9a-f]{8}/.exec(value)?.[0]
      expect(colour && !isGrey(colour), value).toBe(true)
    }
  })

  it('moves fonts, radii, font sizes and spacing off every stock value', () => {
    for (const name of ['fonts.body', 'fonts.heading', 'fonts.mono']) {
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
        expect(stressed, token.name).toMatch(/^\d+px$/)
        expect(stockValues, `${token.name} = ${stressed}`).not.toContain(Number.parseFloat(stressed))
      }
    }
  })

  it('lists the stock palette steps it looks for, without the third-party brand marks', () => {
    expect(stressProbeSpec.palette['#737373']).toBe('gray.500')
    expect(Object.values(stressProbeSpec.palette).some((name) => name.startsWith('whatsapp.'))).toBe(false)
  })
})
