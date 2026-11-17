import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { VoterShell } from './voterShell'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const at = (rules: Rules, min: '48rem' | '64rem') => rules[`@media screen and (min-width: ${min})`] as Rules | undefined
const shell = system.sva(VoterShell)
const WITH_BAR = '&:has([data-scope="action-bar"][data-part="root"])'

describe('voter shell recipe', () => {
  const styles = shell({})

  it('draws the top bar 56px tall with 20px sides, 64px with 32px sides from lg, over the light rule', () => {
    const topbar = layer(styles.topbar)
    expect(topbar).toMatchObject({
      height: 'var(--chakra-sizes-14)',
      paddingInline: 'var(--chakra-spacing-5)',
      borderColor: 'var(--chakra-colors-border-muted)',
    })
    expect(at(topbar, '64rem')).toEqual({ height: 'var(--chakra-sizes-16)', paddingInline: 'var(--chakra-spacing-8)' })
    expect(layer(styles.name)).toMatchObject({ fontSize: 'var(--chakra-font-sizes-item)' })
    expect(layer(styles.symbol)).toMatchObject({ height: 'var(--chakra-sizes-ballot-symbol)' })
  })

  it('shows the strip below lg only, 560px wide on a tablet, positioned for the progress line', () => {
    const strip = layer(styles.strip)
    expect(strip).toMatchObject({
      display: 'flex',
      position: 'relative',
      paddingInline: 'var(--chakra-spacing-5)',
      paddingTop: 'var(--chakra-spacing-3)',
      paddingBottom: 'var(--chakra-spacing-2\\.5)',
    })
    expect(at(strip, '48rem')).toMatchObject({
      maxWidth: 'var(--chakra-sizes-lead)',
      paddingTop: 'var(--chakra-spacing-4\\.5)',
      paddingBottom: 'var(--chakra-spacing-3\\.5)',
    })
    expect(at(strip, '64rem')).toEqual({ display: 'none' })
  })

  it('shows the rail from lg only, 280px wide and 72px from the column', () => {
    const rail = layer(styles.rail)
    expect(rail).toMatchObject({ display: 'none', width: 'var(--chakra-sizes-ballot-rail)' })
    expect(at(rail, '64rem')).toEqual({ display: 'flex' })
    expect(at(layer(styles.body), '64rem')).toMatchObject({ gap: 'var(--chakra-spacing-ballot-gutter)' })
  })

  it.each([
    ['rail', 'var(--chakra-sizes-ballot-column)'],
    ['narrow', 'var(--chakra-sizes-ballot-column-narrow)'],
    ['code', 'var(--chakra-sizes-ballot-column-code)'],
    ['sending', 'var(--chakra-sizes-ballot-column-sending)'],
    ['results', 'var(--chakra-sizes-ballot-column-results)'],
  ] as const)('makes the %s column %s wide from lg and 560px on a tablet', (column, width) => {
    const main = layer(shell({ column }).main)
    expect(at(main, '48rem')).toMatchObject({ maxWidth: 'var(--chakra-sizes-lead)' })
    expect(at(main, '64rem')).toMatchObject({ maxWidth: width })
  })

  it('keeps a status column at 560px from md', () => {
    const main = layer(shell({ column: 'status' }).main)
    expect(at(main, '48rem')).toMatchObject({ maxWidth: 'var(--chakra-sizes-lead)' })
    expect(at(main, '64rem')).not.toHaveProperty('maxWidth')
  })

  it('keeps the column clear of an action bar and hands it the credit below md', () => {
    const root = layer(styles.root)
    const main = root[`${WITH_BAR} [data-scope="voter-shell"][data-part="main"]`] as Rules
    expect(main.paddingBottom).toBe('calc(var(--chakra-spacing-ballot-dock) + env(safe-area-inset-bottom))')
    expect(at(main, '48rem')).toEqual({ paddingBottom: 'var(--chakra-spacing-10)' })
    const foot = root[`${WITH_BAR} [data-scope="voter-shell"][data-part="foot"]`] as Rules
    expect(foot.display).toBe('none')
    expect(at(foot, '48rem')).toEqual({ display: 'flex' })
  })

  it('sets the credit at 12px in the quiet ink with a 13px wordmark, in a 48px row', () => {
    expect(layer(styles.foot)).toMatchObject({ height: 'var(--chakra-sizes-12)' })
    const credit = layer(styles.credit)
    expect(credit).toMatchObject({
      gap: 'var(--chakra-spacing-1\\.5)',
      rowGap: 'var(--chakra-spacing-0)',
      flexWrap: 'wrap',
      justifyContent: 'center',
      fontSize: 'var(--chakra-font-sizes-xs)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
    expect(layer(styles.wordmark)).toMatchObject({ height: 'var(--chakra-sizes-wordmark-credit)' })
  })

  it('puts the terms and privacy links after the wordmark behind a middle dot, 6px clear (ruling R18)', () => {
    expect(layer(styles.links)['&::before']).toEqual({ content: '"·"', marginInlineEnd: 'var(--chakra-spacing-1\\.5)' })
  })
})
