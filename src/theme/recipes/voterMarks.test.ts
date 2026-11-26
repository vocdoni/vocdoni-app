import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { RankBadge, SuccessDisc } from './voterMarks'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const at = (rules: Rules, min: '48rem' | '64rem') => rules[`@media screen and (min-width: ${min})`] as Rules | undefined

describe('rank badge recipe', () => {
  const rank = system.cva(RankBadge)

  it('rings a rank still to give in the track grey: 32px, 6px corners, mono 15px in the quiet ink', () => {
    expect(layer(rank({}))).toMatchObject({
      width: 'var(--chakra-sizes-8)',
      borderRadius: 'var(--chakra-radii-md)',
      fontFamily: 'var(--chakra-fonts-figure)',
      fontSize: 'var(--chakra-font-sizes-item)',
      color: 'var(--chakra-colors-fg-subtle)',
      boxShadow: 'var(--chakra-shadows-shadow-mark)',
    })
  })

  it('keeps the empty rank box as a 1.5px border where forced colours drop its box shadow', () => {
    expect(layer(rank({}))['@media (forced-colors: active)']).toEqual({
      borderWidth: 'var(--chakra-border-widths-mark)',
    })
  })

  it('fills a given rank with the vote colour, its label and its edge', () => {
    expect(layer(rank({ set: true }))).toMatchObject({
      background: 'var(--chakra-colors-accent-solid)',
      color: 'var(--chakra-colors-accent-contrast)',
      boxShadow: 'var(--chakra-shadows-shadow-edge-inner)',
      fontWeight: 'var(--chakra-font-weights-medium)',
    })
  })
})

describe('success disc recipe', () => {
  it('is a 48px disc in the live green (56px from lg) with a 28px tick', () => {
    const styles = system.sva(SuccessDisc)({})
    const root = layer(styles.root)
    expect(root).toMatchObject({
      width: 'var(--chakra-sizes-12)',
      borderRadius: 'var(--chakra-radii-full)',
      background: 'var(--chakra-colors-status-success-solid)',
      color: 'var(--chakra-colors-status-success-contrast)',
    })
    expect(at(root, '64rem')).toEqual({ width: 'var(--chakra-sizes-14)', height: 'var(--chakra-sizes-14)' })
    expect(layer(styles.icon)).toMatchObject({ width: 'var(--chakra-sizes-7)' })
  })
})
