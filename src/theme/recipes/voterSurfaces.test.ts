import { describe, expect, it } from 'vitest'
import { system } from '../system'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const at = (rules: Rules, min: '48rem' | '64rem') => rules[`@media screen and (min-width: ${min})`] as Rules | undefined

const pinInput = system.sva(system.getSlotRecipe('pinInput'))
const progress = system.sva(system.getSlotRecipe('progress'))
const status = system.sva(system.getSlotRecipe('status'))
const alert = system.sva(system.getSlotRecipe('alert'))
const card = system.sva(system.getSlotRecipe('card'))

describe('voter one-time code (pinInput)', () => {
  it('draws 48 by 58 boxes 8px apart on a phone and 56 by 64 boxes 10px apart from md', () => {
    const styles = pinInput({ size: 'ballot', variant: 'field' })
    const input = layer(styles.input)
    expect(input).toMatchObject({
      '--input-height': 'var(--chakra-sizes-ballot-code-height-touch)',
      width: 'var(--chakra-sizes-ballot-code-width-touch)',
      minWidth: 'var(--chakra-sizes-ballot-code-width-touch)',
      borderRadius: 'var(--chakra-radii-xl)',
      fontFamily: 'var(--chakra-fonts-figure)',
      fontSize: 'var(--chakra-font-sizes-ballot-code)',
    })
    expect(at(input, '48rem')).toMatchObject({
      '--input-height': 'var(--chakra-sizes-ballot-code-height)',
      width: 'var(--chakra-sizes-ballot-code-width)',
      minWidth: 'var(--chakra-sizes-ballot-code-width)',
    })
    const control = layer(styles.control)
    expect(control.gap).toBe('var(--chakra-spacing-2)')
    expect(at(control, '48rem')).toEqual({ gap: 'var(--chakra-spacing-2\\.5)' })
  })

  it('rings each box like a field and the box being typed in with 2px of the focus colour inside its edge', () => {
    const input = layer(pinInput({ size: 'ballot', variant: 'field' }).input)
    expect(input.boxShadow).toBe('var(--chakra-shadows-shadow-field)')
    expect(input.borderWidth).toBe('0')
    expect((input['&:is(:focus, [data-focus])'] as Rules).boxShadow).toBe(
      'inset 0 0 0 var(--chakra-border-widths-thick) var(--chakra-colors-color-palette-focus-ring)'
    )
  })

  it('draws a 1px border where forced colours drop the ring, and 2px when invalid', () => {
    const forced = layer(pinInput({ size: 'ballot', variant: 'field' }).input)[
      '@media (forced-colors: active)'
    ] as Rules
    expect(forced).toMatchObject({ borderWidth: 'var(--chakra-border-widths-hairline)' })
    expect(forced['&:is([data-invalid], [aria-invalid=true], [data-state=invalid])']).toEqual({
      borderWidth: 'var(--chakra-border-widths-thick)',
    })
  })

  it('keeps Chakra defaults, so the pin inputs the app already draws do not change', () => {
    expect(system.getSlotRecipe('pinInput').defaultVariants).toEqual({ size: 'md', variant: 'outline' })
  })
})

describe('voter step progress (progress `line`)', () => {
  it('is a 3px square line in the palette fill on no track, with no gap after the fill', () => {
    const styles = progress({ variant: 'line' })
    expect(layer(styles.track)).toMatchObject({
      height: 'var(--chakra-sizes-bar-thin)',
      backgroundColor: 'var(--chakra-colors-transparent)',
      borderRadius: 'var(--chakra-radii-none)',
    })
    expect(layer(styles.range)).toMatchObject({
      backgroundColor: 'var(--chakra-colors-color-palette-solid)',
      borderRadius: 'var(--chakra-radii-none)',
      boxShadow: 'none',
    })
    expect(system.token('sizes.bar.thin')).toBe('3px')
  })
})

describe('voter status line (status `ballot`)', () => {
  it('sets the word at 13.5px medium in the voter tracking, 8px after a 7px dot', () => {
    const styles = status({ size: 'ballot', tone: 'success' })
    expect(layer(styles.root)).toMatchObject({
      gap: 'var(--chakra-spacing-2)',
      fontSize: 'var(--chakra-font-sizes-ballot-status)',
      lineHeight: 'var(--chakra-line-heights-moderate)',
      fontWeight: 'var(--chakra-font-weights-medium)',
      letterSpacing: 'var(--chakra-letter-spacings-voter)',
      color: 'var(--chakra-colors-status-success-fg)',
    })
    expect(layer(styles.indicator)).toMatchObject({ width: 'var(--chakra-sizes-dot)' })
  })

  it('draws a closed vote with the muted word and the faint dot', () => {
    const styles = status({ size: 'ballot', tone: 'closed' })
    expect(layer(styles.root).color).toBe('var(--chakra-colors-fg-muted)')
    expect(layer(styles.indicator).background).toBe('var(--chakra-colors-fg-faint)')
  })
})

describe('voter notice (alert `ballot`)', () => {
  it.each([
    ['warning', 'status-warning-bg'],
    ['error', 'status-error-bg'],
  ] as const)('tints a %s notice, keeps it in ink with an inner hairline, 12px corners and 15px text', (tone, bg) => {
    const styles = alert({ status: tone, layout: 'ballot' })
    const root = layer(styles.root)
    expect(root).toMatchObject({
      background: `var(--chakra-colors-${bg})`,
      color: 'var(--chakra-colors-fg)',
      borderRadius: 'var(--chakra-radii-xl)',
      boxShadow: 'var(--chakra-shadows-inner)',
      paddingInline: 'var(--chakra-spacing-4)',
      paddingBlock: 'var(--chakra-spacing-3\\.5)',
      fontSize: 'var(--chakra-font-sizes-item)',
    })
    expect(at(root, '64rem')).toBeUndefined()
    expect(layer(styles.indicator).display).toBe('none')
  })
})

describe('voter cards (card `ballot`, `ballot-notice`)', () => {
  it('rings a voter card thinly with 12px corners and rows 14px and 18px in at every width', () => {
    const styles = card({ variant: 'ballot' })
    expect(layer(styles.root)).toMatchObject({
      boxShadow: 'var(--chakra-shadows-shadow-ring)',
      borderRadius: 'var(--chakra-radii-xl)',
      borderWidth: '0',
    })
    const body = layer(styles.body)
    expect(body).toMatchObject({
      paddingInline: 'var(--chakra-spacing-4\\.5)',
      paddingBlock: 'var(--chakra-spacing-3\\.5)',
    })
    expect(at(body, '48rem')).toBeUndefined()
  })

  it('pads the feature card 20px and 22px, the same ring', () => {
    expect(layer(card({ variant: 'ballot-feature' }).root)).toMatchObject({
      paddingInline: 'var(--chakra-spacing-card)',
      paddingBlock: 'var(--chakra-spacing-5)',
      boxShadow: 'var(--chakra-shadows-shadow-ring)',
    })
  })

  it('pads a notice card 18px and 20px with a semibold title over a quiet note', () => {
    const styles = card({ variant: 'ballot-notice' })
    expect(layer(styles.root)).toMatchObject({
      paddingInline: 'var(--chakra-spacing-5)',
      paddingBlock: 'var(--chakra-spacing-4\\.5)',
      boxShadow: 'var(--chakra-shadows-shadow-ring)',
    })
    expect(layer(styles.title)).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-lg)',
      fontWeight: 'var(--chakra-font-weights-semibold)',
    })
    expect(layer(styles.description)).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-md)',
      color: 'var(--chakra-colors-fg-subtle)',
    })
  })
})
