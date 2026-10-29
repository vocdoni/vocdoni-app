import { describe, expect, it } from 'vitest'
import editor from './editor'
import { link } from './recipes/typography'
import { createAppSystem, system } from './system'

const conditions = (name: string, sys = system) =>
  sys.tokens.getByName(name)?.extensions?.conditions as Record<string, string> | undefined

describe.each([
  ['stock', system],
  ['branded', createAppSystem('#1a73e8')],
])('recipe tokens (%s system)', (_name, sys) => {
  it('defines the link colours with the values links render with', () => {
    expect(conditions('colors.link.fg', sys)).toEqual({ _light: '{colors.gray.800}', _dark: '{colors.gray.400}' })
    expect(conditions('colors.link.fg.hover', sys)).toEqual({ _light: '{colors.gray.500}', _dark: '{colors.gray.200}' })
  })

  it('defines the 1px and 2px border widths', () => {
    expect(sys.tokens.getByName('borderWidths.hairline')?.originalValue).toBe('1px')
    expect(sys.tokens.getByName('borderWidths.thick')?.originalValue).toBe('2px')
  })

  it('keeps the pricing card action border one grey in both color modes', () => {
    expect(sys.tokens.getByName('colors.control.border')?.originalValue).toBe('{colors.gray.300}')
  })
})

describe('link colours', () => {
  it('are shared by the link recipe and the editor', () => {
    const lexical = editor['& .lexical-link'] as { color: string; _hover: { color: string } }
    const base = link.base as { color: string; _hover: { color: string } }
    expect(lexical.color).toBe('link.fg')
    expect(lexical.color).toBe(base.color)
    expect(lexical._hover.color).toBe('link.fg.hover')
    expect(lexical._hover.color).toBe(base._hover.color)
  })

  it('let the palette-coloured variants win in light mode only', () => {
    const variants = link.variants?.variant as Record<string, { color?: unknown }>
    for (const name of ['plain', 'underline']) {
      expect(variants[name].color).toEqual({ base: 'colorPalette.fg', _dark: 'link.fg' })
    }
  })
})
