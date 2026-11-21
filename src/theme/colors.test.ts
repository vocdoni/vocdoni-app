import { describe, expect, it } from 'vitest'
import { colors } from './colors'
import { createAppSystem, system } from './system'

// The neutral scale as it resolved when colors.ts took over all of it, Chakra's steps included. A retheme that moves
// the greys updates this table in the same change.
const GRAY = {
  50: '#fcfcfc',
  100: '#f5f5f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#b2b2b2',
  500: '#737373',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#111111',
}

describe('gray scale', () => {
  it.each([
    ['stock', system],
    ['branded', createAppSystem('#1a73e8')],
  ])('resolves every step to the value it had before (%s system)', (_name, sys) => {
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
