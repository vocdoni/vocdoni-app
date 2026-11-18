import { describe, expect, it } from 'vitest'
import { system } from '../system'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']
const at = (rules: Rules, min: '48rem' | '64rem') => rules[`@media screen and (min-width: ${min})`] as Rules | undefined

const choice = system.sva(system.getSlotRecipe('QuestionChoice'))
const questions = system.sva(system.getSlotRecipe('ElectionQuestions'))
const tip = system.sva(system.getSlotRecipe('QuestionsTip'))
const dock = system.sva(system.getSlotRecipe('questionDock'))

describe('voter option (QuestionChoice context `voter`)', () => {
  const styles = choice({ context: 'voter', layout: 'list' })
  const wrapper = layer(styles.wrapper)

  it('keeps the card: 64px tall, 12px corners, the field ring, the chosen border and ring', () => {
    const card = layer(choice({ context: 'card', layout: 'list' }).wrapper)
    expect(wrapper.minHeight).toBe('var(--chakra-sizes-16)')
    expect(wrapper.borderRadius).toBe('var(--chakra-radii-xl)')
    expect(wrapper.borderColor).toBe('var(--chakra-colors-ballot-choice-border)')
    expect(wrapper['&[data-state="checked"]']).toEqual(card['&[data-state="checked"]'])
  })

  it('pads 8px and 16px on a phone, 18px from md', () => {
    expect(wrapper.paddingBlock).toBe('var(--chakra-spacing-2)')
    expect(wrapper.paddingInline).toBe('var(--chakra-spacing-4)')
    expect(at(wrapper, '48rem')).toMatchObject({ paddingInline: 'var(--chakra-spacing-4\\.5)' })
  })

  it('draws a 22px checkbox with 4px corners and a 22px radio mark, filled when chosen', () => {
    expect(wrapper['& [data-choice-control][data-control-type="checkbox"]']).toMatchObject({
      width: 'var(--chakra-sizes-mark-ballot)',
      height: 'var(--chakra-sizes-mark-ballot)',
      borderRadius: 'var(--chakra-radii-sm)',
    })
    expect(wrapper['& [data-choice-mark]']).toMatchObject({
      width: 'var(--chakra-sizes-mark-ballot)',
      borderRadius: 'var(--chakra-radii-full)',
      borderColor: 'var(--chakra-colors-ballot-choice-ring)',
    })
    expect(wrapper['&[data-state="checked"] [data-choice-mark]']).toMatchObject({
      background: 'var(--chakra-colors-color-palette-solid)',
    })
    expect(system.token('sizes.mark.ballot')).toBe('22px')
  })

  it('quiets a blank vote and an option that cannot be chosen now, unless chosen', () => {
    expect(wrapper['&[data-quiet]:not([data-state="checked"])']).toEqual({ color: 'var(--chakra-colors-fg-subtle)' })
    expect(wrapper['&[data-disabled="true"]:not([data-state="checked"])']).toEqual({
      color: 'var(--chakra-colors-fg-subtle)',
    })
  })

  it('sets the label on the running line height', () => {
    expect(layer(styles.label).lineHeight).toBe('var(--chakra-line-heights-moderate)')
  })
})

describe('voter question (ElectionQuestions layout `voter`, QuestionsTip layout `voter`)', () => {
  it('sets the help 10px under the title and the options 10px apart, 22px under it (28px from lg)', () => {
    const styles = questions({ layout: 'voter' })
    expect(layer(styles.description)).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-lg)',
      color: 'var(--chakra-colors-fg-muted)',
      marginTop: 'var(--chakra-spacing-2\\.5)',
    })
    const stack = layer(styles.stack)
    expect(stack).toMatchObject({
      gap: 'var(--chakra-spacing-2\\.5)',
      marginTop: 'var(--chakra-spacing-ballot-options)',
    })
    expect(at(stack, '64rem')).toEqual({ marginTop: 'var(--chakra-spacing-7)' })
    expect(layer(styles.title).fontSize).toBe('var(--chakra-font-sizes-ballot-question)')
  })

  it('sets the hint at 15px in the muted ink, 14px under the options', () => {
    const styles = tip({ layout: 'voter' })
    expect(layer(styles.wrapper)).toMatchObject({
      marginTop: 'var(--chakra-spacing-3\\.5)',
      justifyContent: 'flex-start',
    })
    expect(layer(styles.text)).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-item)',
      color: 'var(--chakra-colors-fg-muted)',
    })
  })
})

describe('voter action bar (questionDock `ballot`)', () => {
  const styles = dock({ variant: 'ballot' })

  it('is fixed to the bottom below md with 20px sides and a rule, and a row in the flow from md', () => {
    const root = layer(styles.root)
    expect(root).toMatchObject({
      display: 'flex',
      position: 'fixed',
      flexDirection: 'column',
      paddingInline: 'var(--chakra-spacing-5)',
      paddingTop: 'var(--chakra-spacing-3)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      borderTopWidth: 'var(--chakra-border-widths-hairline)',
    })
    expect(at(root, '48rem')).toMatchObject({
      position: 'static',
      flexDirection: 'row',
      marginTop: 'var(--chakra-spacing-8)',
      paddingInline: 'var(--chakra-spacing-0)',
      borderTopWidth: '0',
    })
  })

  it('puts the note above the buttons below md and after them from md', () => {
    const note = layer(styles.note)
    expect(note.order).toBe(-1)
    expect(at(note, '48rem')).toMatchObject({ order: 0, marginInlineStart: 'var(--chakra-spacing-2)' })
  })

  it('grows the main action below md and keeps the secondary at its width', () => {
    expect(layer(styles.primary).flex).toBe('1 1 0')
    expect(at(layer(styles.primary), '48rem')).toEqual({ flex: '0 0 auto' })
    expect(layer(styles.secondary).flex).toBe('0 0 auto')
  })

  it('shows the credit inside the bar below md only, 4px under the buttons', () => {
    const credit = layer(styles.credit)
    expect(credit).toMatchObject({
      display: 'flex',
      height: 'var(--chakra-sizes-ballot-credit)',
      marginTop: 'calc(var(--chakra-spacing-1\\.5) * -1)',
    })
    expect(at(credit, '48rem')).toEqual({ display: 'none' })
  })

  it('leaves the organiser dock as it was', () => {
    expect(layer(dock({}).root).display).toBe('flex')
    expect(at(layer(dock({}).root), '48rem')).toEqual({ display: 'none' })
  })
})
