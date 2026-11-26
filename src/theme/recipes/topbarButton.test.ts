import { describe, expect, it } from 'vitest'
import { system } from '../system'

const button = system.cva(system.getRecipe('button'))

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const media = (rules: Rules) => Object.keys(rules).filter((key) => key.includes('min-width'))
const HOVER = '&:is(:hover, [data-hover]):not(:disabled, [data-disabled])'

// The voter's "Surt" in the top bar (conformance D-7): text like the board's links, not a padded button.
describe('topbar button variant', () => {
  const styles = layer(button({ variant: 'topbar' }))

  it('draws plain 14px medium text in the muted ink, with no box, no sides and the height of its line', () => {
    expect(styles).toMatchObject({
      height: 'var(--chakra-sizes-auto)',
      paddingInline: 'var(--chakra-spacing-0)',
      background: 'var(--chakra-colors-transparent)',
      color: 'var(--chakra-colors-fg-muted)',
      fontSize: 'var(--chakra-font-sizes-md)',
      lineHeight: 'var(--chakra-line-heights-moderate)',
      fontWeight: 'var(--chakra-font-weights-medium)',
    })
  })

  it('replaces the default size at every width, so nothing changes from md or lg', () => {
    for (const query of media(styles)) {
      const rules = styles[query] as Rules
      expect(rules).not.toHaveProperty('height')
      expect(rules).not.toHaveProperty('minWidth')
      expect(rules).not.toHaveProperty('paddingInline')
      expect(rules).not.toHaveProperty('fontSize')
    }
  })

  it('turns ink on hover and keeps the focus ring of every button', () => {
    expect((styles['@media (hover: hover)'] as Rules)[HOVER]).toMatchObject({ color: 'var(--chakra-colors-fg)' })
    expect(styles['&:is(:focus-visible, [data-focus-visible])']).toMatchObject({
      outlineColor: 'var(--chakra-colors-color-palette-focus-ring)',
    })
  })

  it('keeps a 44px hit area', () => {
    expect(styles).toMatchObject({ position: 'relative' })
    expect(styles['&::before']).toEqual({
      content: '""',
      position: 'absolute',
      inset: 'calc((100% - var(--chakra-sizes-control-touch)) / 2)',
    })
  })
})
