import { describe, expect, it } from 'vitest'
import { system } from '../system'

const button = system.cva(system.getRecipe('button'))
const input = system.cva(system.getRecipe('input'))
const field = system.sva(system.getSlotRecipe('field'))

// The declarations a recipe layer ends up with, and its media queries.
type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const media = (rules: Rules) => Object.keys(rules).filter((key) => key.includes('min-width'))
const INVALID = '&:is([data-invalid], [aria-invalid=true], [data-state=invalid])'

// The voter scale (docs/ui-guidelines.md, "Voter page"): the same measures at every width, so no media query.
describe('voter controls', () => {
  it('draws the voter button 52px tall at every width, with 24px sides, 12px corners and a 17px semibold label', () => {
    const styles = layer(button({ size: 'ballot' }))
    expect(styles).toMatchObject({
      height: 'var(--chakra-sizes-control-ballot)',
      paddingInline: 'var(--chakra-spacing-6)',
      borderRadius: 'var(--chakra-radii-xl)',
      fontSize: 'var(--chakra-font-sizes-ballot-option)',
      lineHeight: 'var(--chakra-line-heights-moderate)',
      fontWeight: 'var(--chakra-font-weights-semibold)',
    })
    expect(media(styles)).toEqual([])
    expect(system.token('sizes.control.ballot')).toBe('52px')
    expect(system.token('fontSizes.ballot.option')).toBe('1.0625rem')
  })

  it('keeps the primary filled from the palette and edged at the voter size', () => {
    const styles = layer(button({ variant: 'solid', size: 'ballot' }))
    expect(styles.background).toBe('var(--chakra-colors-color-palette-solid)')
    expect(styles.color).toBe('var(--chakra-colors-color-palette-contrast)')
    expect(String(styles.boxShadow)).toContain('color-palette-solid-edge')
  })

  it('sets the voter secondary in 550 with its ring', () => {
    const styles = layer(button({ variant: 'outline', size: 'ballot' }))
    expect(styles.fontWeight).toBe('var(--chakra-font-weights-medium-plus)')
    expect(styles.boxShadow).toBe('var(--chakra-shadows-shadow-control)')
    expect(styles.height).toBe('var(--chakra-sizes-control-ballot)')
  })

  it('keeps the unavailable look sunken at every width at the voter size, with a 16px label in 550', () => {
    const styles = layer(button({ variant: 'off', size: 'ballot' }))
    expect(styles).toMatchObject({
      background: 'var(--chakra-colors-bg-emphasized)',
      color: 'var(--chakra-colors-fg-muted)',
      fontSize: 'var(--chakra-font-sizes-lg)',
      fontWeight: 'var(--chakra-font-weights-medium-plus)',
      cursor: 'var(--chakra-cursor-unavailable)',
    })
    expect(media(styles)).toEqual([])
  })

  it('keeps a wrapping voter label at least 52px tall', () => {
    expect(layer(button({ size: 'ballot', multiline: true })).minHeight).toBe('var(--chakra-sizes-control-ballot)')
  })

  it('draws the language tag as a 22px-line tag ringed in the strong grey, with a 44px hit area', () => {
    const styles = layer(button({ variant: 'lang-tag', size: 'tag' }))
    expect(styles).toMatchObject({
      height: 'var(--chakra-sizes-auto)',
      paddingInline: 'var(--chakra-spacing-1\\.5)',
      borderRadius: 'var(--chakra-radii-xs)',
      fontSize: 'var(--chakra-font-sizes-sm)',
      lineHeight: 'var(--chakra-line-heights-row-touch)',
      fontWeight: 'var(--chakra-font-weights-medium)',
      color: 'var(--chakra-colors-fg-muted)',
      boxShadow: '0 0 0 var(--chakra-border-widths-hairline) var(--chakra-colors-border-strong)',
      position: 'relative',
    })
    expect(media(styles)).toEqual([])
    expect(styles['&::before']).toEqual({
      content: '""',
      position: 'absolute',
      inset: 'calc((100% - var(--chakra-sizes-control-touch)) / 2)',
    })
    expect(system.token('lineHeights.row.touch')).toBe('1.375rem')
  })

  it('draws the voter field 52px tall with 16px text, 12px corners and a 2px inner error ring when it fails', () => {
    const styles = layer(input({ size: 'ballot', variant: 'outline' }))
    expect(styles).toMatchObject({
      '--input-height': 'var(--chakra-sizes-control-ballot)',
      paddingInline: 'var(--chakra-spacing-4)',
      borderRadius: 'var(--chakra-radii-xl)',
      fontSize: 'var(--chakra-font-sizes-lg)',
      boxShadow: 'var(--chakra-shadows-shadow-field)',
    })
    expect(media(styles)).toEqual([])
    expect((styles[INVALID] as Rules).boxShadow).toBe('var(--chakra-shadows-shadow-invalid)')
  })

  it('sets the voter field label at 15px, medium', () => {
    expect(layer(field({ size: 'ballot' }).label)).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-item)',
      lineHeight: 'var(--chakra-line-heights-moderate)',
      fontWeight: 'var(--chakra-font-weights-medium)',
    })
  })
})
