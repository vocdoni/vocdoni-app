import { defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { createAppSystem, system } from './system'

const BRANDED = createAppSystem('#1a73e8')
const exists = (sys: typeof system, path: string) => sys.tokens.getByName(`colors.${path}`) !== undefined
const SCALE = { success: 'green', warning: 'orange', danger: 'red', info: 'blue' }
const PALETTES = Object.keys(SCALE)

describe('status palettes', () => {
  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('defines every slot chakra defines on its own palettes (%s system)', (_name, sys) => {
    // colorPalette props fall back silently on an unknown token, so check every slot.
    const slots = Object.keys(defaultConfig.theme?.semanticTokens?.colors?.gray ?? {})
    expect(slots.length).toBeGreaterThan(0)
    const missing = PALETTES.flatMap((p) => slots.filter((s) => !exists(sys, `${p}.${s}`)).map((s) => `${p}.${s}`))
    expect(missing).toEqual([])
  })

  it.each(PALETTES)('defines the numbered steps for %s', (p) => {
    for (const step of ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']) {
      expect(exists(system, `${p}.${step}`), `${p}.${step}`).toBe(true)
    }
  })

  it.each(PALETTES)('resolves %s to the same colours as its raw scale', (p) => {
    // Follow `{colors.x}` references down to literal values, per colour mode.
    const resolve = (ref: string, mode: string): string => {
      const token = system.tokens.getByName(ref.replace(/^\{|\}$/g, '').replace(/^(?!colors\.)/, 'colors.'))
      const conditions = token?.extensions?.conditions as Record<string, string> | undefined
      const raw = conditions ? (conditions[mode] ?? conditions.base) : (token?.value as string)
      return typeof raw === 'string' && raw.startsWith('{') ? resolve(raw, mode) : String(raw)
    }
    for (const slot of ['solid', 'fg', 'subtle', 'muted', 'emphasized', 'focusRing', 'contrast', 'border', '500']) {
      for (const mode of ['_light', '_dark']) {
        const got = resolve(`${p}.${slot}`, mode)
        expect(got, `${p}.${slot} ${mode}`).not.toBe('undefined')
        expect(got, `${p}.${slot} ${mode}`).toBe(resolve(`${SCALE[p]}.${slot}`, mode))
      }
    }
  })

  it.each(['success', 'warning', 'error', 'info', 'neutral'])('defines every role for status.%s', (tone) => {
    for (const slot of ['fg', 'bg', 'border', 'solid', 'contrast']) {
      expect(exists(system, `status.${tone}.${slot}`), `status.${tone}.${slot}`).toBe(true)
    }
  })

  it('defines the danger action text', () => {
    expect(exists(system, 'danger.action')).toBe(true)
  })
})
