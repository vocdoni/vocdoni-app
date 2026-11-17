import { describe, expect, it } from 'vitest'
import { contrastRatio } from './palette'
import { createAppSystem, system } from './system'

type Mode = 'light' | 'dark'

// Chakra's `contrast` slots are the CSS keywords, not references, so they are mapped to hex here.
const KEYWORDS: Record<string, string> = { white: '#ffffff', black: '#000000' }

// Resolves a semantic colour token to a hex value for one colour mode, following `{colors.*}` references.
const resolve = (name: string, mode: Mode, sys = system, depth = 0): string => {
  const token = sys.tokens.getByName(`colors.${name}`)
  if (!token || depth > 20) throw new Error(`cannot resolve colors.${name}`)
  const conditions = token.extensions?.conditions as Record<string, string> | undefined
  const value = conditions ? (conditions[mode === 'dark' ? '_dark' : '_light'] ?? conditions.base) : token.value
  const ref = /^\{colors\.([\w.-]+)\}$/.exec(String(value))
  return ref ? resolve(ref[1], mode, sys, depth + 1) : (KEYWORDS[String(value)] ?? String(value))
}

// Composites a translucent surface (e.g. `surface.sunken` in dark mode) over the page it sits on.
const opaque = (color: string, mode: Mode): string => {
  // Both spellings: `rgba(r, g, b, a)` and Fil's `rgb(r g b / a)`.
  const match = /^rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:, | \/ )([\d.]+)\)$/.exec(color)
  if (!match) return color
  const page = resolve('bg', mode)
  const channels = [1, 2, 3].map((group, index) => {
    const under = parseInt(page.slice(1 + index * 2, 3 + index * 2), 16)
    return Math.round(Number(match[group]) * Number(match[4]) + under * (1 - Number(match[4])))
  })
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const SURFACES = ['bg', 'bg.panel', 'bg.subtle', 'surface.raised', 'surface.sunken']
// The dark page, sidebar, card, dialog and menu greys, which carry the body text.
const DARK_LAYERS = ['bg', 'surface.sidebar', 'surface.card', 'surface.overlay', 'surface.raised']

// WCAG AA for text: 4.5:1 against every surface the text is painted on, in both colour modes.
describe('text colour contrast (WCAG AA)', () => {
  it.each(['fg.error', 'status.error.fg', 'danger.action', 'ballot.schedule', 'ballot.error', 'input.placeholder'])(
    '%s reads at 4.5:1 on the page surfaces',
    (token) => {
      for (const mode of ['light', 'dark'] as const) {
        for (const surface of SURFACES) {
          const ratio = contrastRatio(resolve(token, mode), opaque(resolve(surface, mode), mode))
          expect(ratio, `${token} on ${surface} (${mode})`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  )

  it.each(['fg', 'fg.muted', 'fg.subtle', 'fg.success', 'fg.warning', 'accent.fg'])(
    '%s reads at 4.5:1 on every dark layer',
    (token) => {
      for (const layer of DARK_LAYERS) {
        const ratio = contrastRatio(resolve(token, 'dark'), resolve(layer, 'dark'))
        expect(ratio, `${token} on ${layer}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  )

  // A toast's text and fill are separate tokens, so they are checked as a pair.
  it.each(['success', 'warning'])('reads the %s toast text on its fill at 4.5:1', (status) => {
    for (const mode of ['light', 'dark'] as const) {
      const ratio = contrastRatio(resolve(`toast.${status}.fg`, mode), resolve(`toast.${status}.bg`, mode))
      expect(ratio, `${status} toast (${mode})`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps the inactive tab label readable on the tab list', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(contrastRatio(resolve('tabs.tab.color', mode), opaque(resolve('tabs.bg', mode), mode))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each([
    ['stock', system],
    ['branded', createAppSystem('#1a73e8')],
  ])('keeps the brand accents readable in both modes (%s system)', (_name, sys) => {
    for (const mode of ['light', 'dark'] as const) {
      const pairs = [
        ['tabs.tab.active.color', 'tabs.tab.active.bg'],
        ['accent.fg', 'bg'],
      ]
      for (const [text, surface] of pairs) {
        const ratio = contrastRatio(resolve(text, mode, sys), resolve(surface, mode, sys))
        expect(ratio, `${text} on ${surface} (${mode})`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('keeps the WhatsApp button label readable on the brand green, resting and hovered', () => {
    const label = resolve('black', 'light')
    expect(contrastRatio(label, resolve('whatsapp.500', 'light'))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(label, resolve('whatsapp.600', 'light'))).toBeGreaterThanOrEqual(4.5)
  })
})
