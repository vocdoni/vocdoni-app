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
    // The same in both modes: the accent text colour, which has its own dark value.
    expect(sys.tokens.getByName('colors.link.fg')?.originalValue).toBe('{colors.accent.fg}')
    expect(sys.tokens.getByName('colors.link.fg.hover')?.originalValue).toBe('{colors.accent.fg.hover}')
  })

  it('defines the 1px border width', () => {
    expect(sys.tokens.getByName('borderWidths.hairline')?.originalValue).toBe('1px')
  })

  // Fil toasts are a raised neutral card with a status icon; the toast.* fills are no longer read by the recipe.
  it('paints every toast type on the raised surface, not on a status fill', () => {
    const root = sys.getSlotRecipe('toast').base?.root as Record<string, Record<string, unknown>>
    for (const type of ['success', 'warning', 'error', 'info']) {
      expect(root[`&[data-type=${type}]`]).toMatchObject({ bg: 'surface.raised', color: 'fg' })
    }
  })

  it('defines the toast fills and text from the status palettes', () => {
    expect(conditions('colors.toast.success.bg', sys)).toEqual({
      _light: '{colors.success.700}',
      _dark: '{colors.success.solid}',
    })
    expect(conditions('colors.toast.warning.bg', sys)).toEqual({
      _light: '{colors.warning.700}',
      _dark: '{colors.warning.500}',
    })
    expect(sys.tokens.getByName('colors.toast.success.fg')?.originalValue).toBe('{colors.success.contrast}')
    expect(sys.tokens.getByName('colors.toast.warning.fg')?.originalValue).toBe('{colors.warning.contrast}')
  })

  // Chakra draws the X at 60%, which is 2.51:1 on the red error toast.
  it('draws the toast close button at 80% of its text colour', () => {
    const styles = sys.getSlotRecipe('toast').base?.closeTrigger as Record<string, unknown>
    expect(JSON.stringify(sys.css(styles as any))).toMatch(/currentColor 80%/)
  })
})

describe('link colours', () => {
  // Fil links are accent text (the link recipe); the editor keeps `link.fg` until its own slice moves it.
  it('are accent text in the link recipe', () => {
    const base = link.base as { color: string; _hover: { color: string } }
    expect(base.color).toBe('accent.fg')
    expect(base._hover.color).toBe('accent.fg.hover')
  })

  it('keep the editor on the link tokens', () => {
    const lexical = editor['& .lexical-link'] as { color: string; _hover: { color: string } }
    expect(lexical.color).toBe('link.fg')
    expect(lexical._hover.color).toBe('link.fg.hover')
  })
})

describe('link colour in dark mode', () => {
  const darkSelector = '.dark &, .dark .chakra-theme:not(.light) &'
  const hover = '&:is(:hover, [data-hover]):not(:disabled, [data-disabled])'
  const linkCss = (variant: string) =>
    system.css(system.cva(system.getRecipe('link'))({ variant }))['@layer recipes'] as Record<string, unknown>

  // `.dark &` outranks a single class, so in dark mode the link colour beats the palette colour of
  // Chakra's plain/underline variants and of a Button rendering a Link (`asChild`, e.g. the members CSV
  // template download, which uses the unstyled variant).
  it.each(['plain', 'underline', 'unstyled', 'icon-button', 'subtle'])(
    'is set by a dark-mode rule in the %s variant',
    (variant) => {
      expect(linkCss(variant)[darkSelector]).toEqual({
        color: 'var(--chakra-colors-link-fg)',
        '@media (hover: hover)': { [hover]: { color: 'var(--chakra-colors-link-fg-hover)' } },
      })
    }
  )
})
