import { describe, expect, it } from 'vitest'
import { colors } from './colors'
import { createAppSystem, system } from './system'

// Fil's untinted neutral scale. A retheme that moves the greys updates this table in the same change.
const GRAY = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#ebebeb',
  300: '#c9c9c9',
  400: '#8f8f8f',
  500: '#6b6b6b',
  600: '#4d4d4d',
  700: '#3d3d3d',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
}

describe('gray scale', () => {
  it.each([
    ['stock', system],
    ['branded', createAppSystem('#1a73e8')],
  ])('resolves every step to its Fil value (%s system)', (_name, sys) => {
    const resolved = Object.fromEntries(
      Object.keys(GRAY).map((step) => [step, sys.tokens.getByName(`colors.gray.${step}`)?.value])
    )
    expect(resolved).toEqual(GRAY)
  })

  // Nothing may merge through from Chakra's scale, or a retheme of colors.ts would leave tinted steps behind.
  it('defines every step in colors.ts', () => {
    expect(Object.keys(colors.gray)).toEqual(Object.keys(GRAY))
  })
})
