import { describe, expect, it } from 'vitest'
import { accentPalette, statusPalette, statusPaletteAlt } from './status'
import { createAppSystem, system } from './system'

const BRANDED = createAppSystem('#1a73e8')
const exists = (sys: typeof system, path: string) => sys.tokens.getByName(`colors.${path}`) !== undefined

describe('status roles', () => {
  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('maps every status to a palette the system defines (%s system)', (_name, sys) => {
    const palettes = [
      ...Object.values(statusPalette),
      ...Object.values(statusPaletteAlt),
      ...Object.values(accentPalette),
    ]
    // colorPalette props fall back silently on an unknown palette, so check the slots recipes read.
    const missing = palettes.filter(
      (p) => !['solid', 'contrast', 'fg', 'subtle'].every((s) => exists(sys, `${p}.${s}`))
    )
    expect(missing).toEqual([])
  })

  it.each(['success', 'warning', 'error', 'info', 'neutral'])('defines every role for %s', (tone) => {
    for (const slot of ['fg', 'bg', 'border', 'solid', 'contrast']) {
      expect(exists(system, `status.${tone}.${slot}`), `status.${tone}.${slot}`).toBe(true)
    }
  })

  it('defines the destructive action roles', () => {
    for (const slot of ['fg', 'solid', 'contrast']) expect(exists(system, `destructive.${slot}`)).toBe(true)
  })
})
