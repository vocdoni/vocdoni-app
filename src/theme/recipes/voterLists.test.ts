import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { AgendaList, PhaseList, ReceiptCodes, ReviewRow } from './voterLists'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']

describe('phase list recipe', () => {
  const styles = system.sva(PhaseList)({})

  it('sets each phase at 17px, 10px above and below, 12px after a 22px disc', () => {
    expect(layer(styles.item)).toMatchObject({
      gap: 'var(--chakra-spacing-3)',
      paddingBlock: 'var(--chakra-spacing-2\\.5)',
      fontSize: 'var(--chakra-font-sizes-ballot-option)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
    expect(layer(styles.disc)).toMatchObject({
      width: 'var(--chakra-sizes-mark-ballot)',
      boxShadow: 'var(--chakra-shadows-shadow-mark)',
    })
  })

  it('keeps the pending disc as a 1.5px ring where forced colours drop its box shadow', () => {
    expect(layer(styles.disc)['@media (forced-colors: active)']).toEqual({
      borderWidth: 'var(--chakra-border-widths-mark)',
    })
  })

  it('turns the current disc with an arc in the vote line colour, still when less motion is asked', () => {
    const now = layer(styles.disc)['&[data-state=now]'] as Rules
    expect(now).toMatchObject({
      borderWidth: 'var(--chakra-border-widths-thick)',
      borderColor: 'var(--chakra-colors-border-pending)',
      borderTopColor: 'var(--chakra-colors-color-palette-border)',
      boxShadow: 'none',
      animation: 'var(--chakra-animations-spin)',
    })
    expect(now['@media (prefers-reduced-motion: reduce)']).toEqual({ animation: 'none' })
    expect(layer(styles.disc)['&[data-state=done]']).toMatchObject({ background: 'var(--chakra-colors-bg-inverted)' })
  })
})

describe('review row recipe', () => {
  it('shades the vote-weight row under the card top corners, and only that row', () => {
    expect(layer(system.sva(ReviewRow)({ first: true, shaded: true }).root)).toMatchObject({
      background: 'var(--chakra-colors-bg-subtle)',
      borderTopLeftRadius: 'var(--chakra-radii-xl)',
      borderTopRightRadius: 'var(--chakra-radii-xl)',
      borderTopWidth: '0',
    })
    expect(layer(system.sva(ReviewRow)({}).root)).not.toHaveProperty('background')
  })

  it('sets the label in the quiet ink, and the action in the column beside the label and value', () => {
    const styles = system.sva(ReviewRow)({})
    expect(layer(styles.label)).toMatchObject({ color: 'var(--chakra-colors-fg-subtle)' })
    expect(layer(styles.action)).toMatchObject({ gridColumn: '2', gridRow: '1 / span 2' })
  })
})

describe('receipt codes recipe', () => {
  const styles = system.sva(ReceiptCodes)({})

  it('rules each row lightly, 10px and 18px in, the code in mono at 13px in the muted ink', () => {
    expect(layer(styles.row)).toMatchObject({
      gap: 'var(--chakra-spacing-4)',
      paddingInline: 'var(--chakra-spacing-4\\.5)',
      paddingBlock: 'var(--chakra-spacing-2\\.5)',
      borderColor: 'var(--chakra-colors-border-muted)',
      fontSize: 'var(--chakra-font-sizes-item)',
    })
    expect(layer(styles.code)).toMatchObject({
      fontFamily: 'var(--chakra-fonts-figure)',
      fontSize: 'var(--chakra-font-sizes-sm)',
      letterSpacing: 'var(--chakra-letter-spacings-voter)',
      color: 'var(--chakra-colors-fg-muted)',
    })
  })

  it('gives a code that links to its verification a 44px hit area', () => {
    const button = layer(styles.code)['&:is(button), &:is(a)'] as Rules
    expect(button['&::before']).toMatchObject({ inset: 'calc((100% - var(--chakra-sizes-control-touch)) / 2)' })
  })
})

describe('agenda list recipe', () => {
  const styles = system.sva(AgendaList)({})

  it('keeps no outer margin: the screen spaces it from what comes before', () => {
    expect(layer(styles.root)).not.toHaveProperty('marginTop')
  })

  it('rules each row, 11px above and below, the number in mono 14px wide and 14px before the title', () => {
    expect(layer(styles.item)).toMatchObject({
      gap: 'var(--chakra-spacing-3\\.5)',
      paddingBlock: 'var(--chakra-spacing-row)',
      borderTopWidth: 'var(--chakra-border-widths-hairline)',
      fontSize: 'var(--chakra-font-sizes-lg)',
    })
    expect(layer(styles.number)).toMatchObject({
      width: 'var(--chakra-sizes-3\\.5)',
      fontFamily: 'var(--chakra-fonts-figure)',
      letterSpacing: 'var(--chakra-letter-spacings-none)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
    expect(layer(styles.label)).toMatchObject({ fontSize: 'var(--chakra-font-sizes-xs)' })
    expect(system.token('spacing.row')).toBe('11px')
  })
})
