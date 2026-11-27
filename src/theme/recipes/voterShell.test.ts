import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { VoterShell } from './voterShell'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const at = (rules: Rules, min: '48rem' | '64rem' | '80rem') =>
  rules[`@media screen and (min-width: ${min})`] as Rules | undefined
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

  it.each(['full', 'lead'] as const)('makes the %s column 600px wide from lg and 560px on a tablet', (column) => {
    const main = layer(shell({ column }).main)
    expect(at(main, '48rem')).toMatchObject({ maxWidth: 'var(--chakra-sizes-lead)' })
    expect(at(main, '64rem')).toMatchObject({ maxWidth: 'var(--chakra-sizes-ballot-column)' })
  })

  it('keeps a lead column at the 560px measure from lg, anchored left, and a full one at 600px', () => {
    expect(at(layer(shell({ column: 'lead' }).main), '64rem')).toMatchObject({
      paddingInlineEnd: 'calc(var(--chakra-sizes-ballot-column) - var(--chakra-sizes-lead))',
    })
    expect(at(layer(shell({ column: 'full' }).main), '64rem')).not.toHaveProperty('paddingInlineEnd')
  })

  it('holds the column in the centre track from xl, with the rail in the track on its left', () => {
    expect(at(layer(styles.body), '80rem')).toEqual({
      display: 'grid',
      gridTemplateColumns:
        'minmax(var(--chakra-sizes-ballot-rail), 1fr) var(--chakra-sizes-ballot-column) minmax(0, 1fr)',
    })
    expect(at(layer(styles.rail), '80rem')).toEqual({ gridColumn: '1', gridRow: '1', justifySelf: 'end' })
    expect(at(layer(styles.main), '80rem')).toEqual({ gridColumn: '2', gridRow: '1' })
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

  it('puts an organisation logo on the light tile in dark mode, and leaves the symbol in ink', () => {
    const logo = layer(styles.brand)['& img'] as Record<string, Rules>
    const dark = Object.entries(logo).find(([selector]) => selector.includes('.dark &'))?.[1]
    expect(dark).toMatchObject({
      backgroundColor: 'var(--chakra-colors-auth-logo-tile-bg)',
      borderColor: 'var(--chakra-colors-auth-logo-tile-border)',
      padding: 'var(--chakra-spacing-1)',
      boxSizing: 'content-box',
    })
    expect(layer(styles.brand)).not.toHaveProperty('backgroundColor')
  })

  it('sets the credit at 12px in the quiet ink with a 13px wordmark, in a 48px row', () => {
    expect(layer(styles.foot)).toMatchObject({ minHeight: 'var(--chakra-sizes-12)' })
    const credit = layer(styles.credit)
    expect(credit).toMatchObject({
      columnGap: 'var(--chakra-spacing-3)',
      rowGap: 'var(--chakra-spacing-0)',
      flexWrap: 'wrap',
      justifyContent: 'center',
      fontSize: 'var(--chakra-font-sizes-xs)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
    // The wordmark sits in the group with the words (`made`), so it is reached as a descendant.
    expect(credit['& svg']).toEqual({
      height: 'var(--chakra-sizes-wordmark-credit)',
      width: 'var(--chakra-sizes-auto)',
    })
  })

  it('lets a long status line wrap inside the strip and the rail head, the dot on its first line (R-2)', () => {
    for (const slot of [styles.head, styles.railHead]) {
      const rules = layer(slot)
      expect(rules['& [data-scope="status"][data-part="root"]']).toEqual({
        whiteSpace: 'normal',
        alignItems: 'flex-start',
      })
      expect(rules['& [data-scope="status"][data-part="indicator"]']).toEqual({
        flexShrink: 0,
        marginTop: 'var(--chakra-spacing-1\\.5)',
      })
    }
  })

  it('puts the terms and privacy links 12px after the wordmark, with no separator to dangle when they wrap (R18)', () => {
    // The words and the wordmark stay one group, 6px apart; the links are the other, and wrap to their own line as a
    // unit. A middle dot on either group was left at the end or the start of a line whenever they wrapped.
    const made = layer(styles.made)
    expect(made).toEqual({ display: 'inline-flex', alignItems: 'center', gap: 'var(--chakra-spacing-1\\.5)' })
    const credit = layer(styles.credit)
    expect(credit).toMatchObject({ flexWrap: 'wrap', columnGap: 'var(--chakra-spacing-3)' })
    expect(credit.gap).toBeUndefined()
    expect(JSON.stringify([credit, made, layer(styles.links) ?? {}])).not.toMatch(/::(after|before)/)
  })
})
