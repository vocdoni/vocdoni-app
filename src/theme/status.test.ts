import { defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { createAppSystem, system } from './system'

const BRANDED = createAppSystem('#1a73e8')
const exists = (sys: typeof system, path: string) => sys.tokens.getByName(`colors.${path}`) !== undefined
const SCALE = { success: 'green', warning: 'orange', danger: 'red', info: 'gray' }
// Fil's light-mode values for the slots it names; every other light slot is the raw scale's.
const FIL_LIGHT: Record<string, Record<string, string>> = {
  success: { solid: '#2caa4f', fg: '#0b7636', subtle: '#f0faf3' },
  warning: { solid: '#875500', contrast: '#ffffff', fg: '#875500', subtle: '#fff8eb' },
  danger: { solid: '#ca2a30', contrast: '#ffffff', fg: '#ca2a30', subtle: '#fff0f0' },
}
// Fil's dark values for the slots it names; the rest of dark is the raw scale's.
const FIL_DARK: Record<string, Record<string, string>> = {
  success: { solid: '#2caa4f', fg: '#6fc884', contrast: '#0a0a0a' },
  warning: { fg: '#e4ac59' },
  danger: { fg: '#f97770' },
}
const PALETTES = Object.keys(SCALE)

// Follow `{colors.x}` references down to literal values, per colour mode.
const resolve = (ref: string, mode: string): string => {
  const token = system.tokens.getByName(ref.replace(/^\{|\}$/g, '').replace(/^(?!colors\.)/, 'colors.'))
  const conditions = token?.extensions?.conditions as Record<string, string> | undefined
  const raw = conditions ? (conditions[mode] ?? conditions.base) : (token?.value as string)
  return typeof raw === 'string' && raw.startsWith('{') ? resolve(raw, mode) : String(raw)
}

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

  it.each(PALETTES)('resolves %s to its raw scale, except the slots Fil sets', (p) => {
    for (const slot of ['solid', 'fg', 'subtle', 'muted', 'emphasized', 'focusRing', 'contrast', 'border', '500']) {
      for (const mode of ['_light', '_dark']) {
        const got = resolve(`${p}.${slot}`, mode)
        expect(got, `${p}.${slot} ${mode}`).not.toBe('undefined')
        const fil = (mode === '_light' ? FIL_LIGHT : FIL_DARK)[p]?.[slot]
        expect(got, `${p}.${slot} ${mode}`).toBe(fil ?? resolve(`${SCALE[p]}.${slot}`, mode))
      }
    }
  })

  it.each(['success', 'warning', 'error', 'info', 'neutral'])('defines every role for status.%s', (tone) => {
    for (const slot of ['fg', 'bg', 'border', 'solid', 'contrast']) {
      expect(exists(system, `status.${tone}.${slot}`), `status.${tone}.${slot}`).toBe(true)
    }
  })

  it.each([
    ['success', 'success'],
    ['warning', 'warning'],
    ['error', 'error'],
    ['info', 'info'],
  ])("status.%s resolves to chakra's %s roles", (tone, role) => {
    for (const mode of ['_light', '_dark']) {
      expect(resolve(`status.${tone}.fg`, mode), `fg ${mode}`).not.toBe('undefined')
      expect(resolve(`status.${tone}.fg`, mode), `fg ${mode}`).toBe(resolve(`fg.${role}`, mode))
      expect(resolve(`status.${tone}.bg`, mode), `bg ${mode}`).toBe(resolve(`bg.${role}`, mode))
      // `info` is neutral now, so its border is the gray palette's, not Chakra's blue info border.
      if (tone !== 'info') {
        expect(resolve(`status.${tone}.border`, mode), `border ${mode}`).toBe(resolve(`border.${role}`, mode))
      }
    }
  })

  it('keeps the danger action text at Fil red in light mode and a lighter red in dark mode', () => {
    expect(resolve('danger.action', '_light')).toBe('#ca2a30')
    expect(resolve('danger.action', '_dark')).toBe('#f97770')
    expect(resolve('danger.action', '_dark')).not.toBe(resolve('danger.action', '_light'))
  })
})
