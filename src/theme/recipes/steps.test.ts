import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { StepProgress, StepRail } from './steps'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']

describe('step rail recipe', () => {
  const styles = system.sva(StepRail)({})

  it('sets a row as a 24px column and the title, 12px apart and 9px above and below, at 15px', () => {
    expect(layer(styles.row)).toMatchObject({
      gridTemplateColumns: 'var(--chakra-sizes-6) minmax(0, 1fr)',
      columnGap: 'var(--chakra-spacing-3)',
      paddingBlock: 'var(--chakra-spacing-step)',
      fontSize: 'var(--chakra-font-sizes-item)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
    expect(system.token('spacing.step')).toBe('9px')
  })

  it('turns the current row semibold in ink and a done one muted', () => {
    const row = layer(styles.row)
    expect(row['&[data-state=now]']).toEqual({
      color: 'var(--chakra-colors-fg)',
      fontWeight: 'var(--chakra-font-weights-semibold)',
    })
    expect(row['&[data-state=done]']).toEqual({ color: 'var(--chakra-colors-fg-muted)' })
  })

  it('keeps the badge ring as a 1.5px border where forced colours drop its box shadow', () => {
    expect(layer(styles.badge)['@media (forced-colors: active)']).toEqual({
      borderWidth: 'var(--chakra-border-widths-mark)',
    })
  })

  it('rings a badge still to come, fills the current one with the vote colour and its edge, a done one in ink', () => {
    const badge = layer(styles.badge)
    expect(badge).toMatchObject({
      width: 'var(--chakra-sizes-6)',
      borderRadius: 'var(--chakra-radii-full)',
      boxShadow: 'var(--chakra-shadows-shadow-mark)',
      fontFamily: 'var(--chakra-fonts-figure)',
      fontSize: 'var(--chakra-font-sizes-xs)',
    })
    expect(badge['&[data-state=now]']).toMatchObject({
      background: 'var(--chakra-colors-accent-solid)',
      color: 'var(--chakra-colors-accent-contrast)',
      boxShadow: 'var(--chakra-shadows-shadow-edge-inner)',
    })
    expect(badge['&[data-state=done]']).toMatchObject({
      background: 'var(--chakra-colors-bg-inverted)',
      color: 'var(--chakra-colors-fg-inverted)',
      boxShadow: 'none',
    })
  })

  it('sets the answer at 13.5px under the title', () => {
    expect(layer(styles.detail)).toMatchObject({
      gridColumn: '2',
      fontSize: 'var(--chakra-font-sizes-control)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
  })
})

describe('step progress recipe', () => {
  const styles = system.sva(StepProgress)({})

  it('sets the label at 13px medium in the muted ink, 12px under the head', () => {
    expect(layer(styles.label)).toMatchObject({
      marginTop: 'var(--chakra-spacing-3)',
      fontSize: 'var(--chakra-font-sizes-sm)',
      fontWeight: 'var(--chakra-font-weights-medium)',
      color: 'var(--chakra-colors-fg-muted)',
    })
  })

  it('centres the 3px line on the strip bottom rule, across its whole width', () => {
    expect(layer(styles.bar)).toMatchObject({
      position: 'absolute',
      insetInline: 'var(--chakra-spacing-0)',
      bottom: 'calc((var(--chakra-sizes-bar-thin) + var(--chakra-border-widths-hairline)) / -2)',
    })
  })
})
