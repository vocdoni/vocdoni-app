import { ElectionResults, QuestionChoice, QuestionsConfirmation, QuestionsTypeBadge, Voted } from './election'
import { link } from './typography'

describe('ElectionResults recipe', () => {
  it('keeps result questions stacked vertically', () => {
    expect(ElectionResults.base.wrapper.gridTemplateColumns).toBe('1fr')
  })

  it('styles the vote id link inside the Voted notice', () => {
    // The link recipe's look: Fil's accent text, without an underline.
    expect(Voted.base.description).toHaveProperty(['& a', 'color'], link.base?.color)
    expect(Voted.base.description).toHaveProperty(['& a', 'textDecoration'], link.base?.textDecoration)
  })

  it('lets a long vote id wrap when it has no explorer link', () => {
    expect(Voted.base.description).toHaveProperty('overflowWrap', 'anywhere')
  })
})

describe('QuestionChoice recipe', () => {
  const card = QuestionChoice.variants.context.card.wrapper

  it('draws the chosen option as a second ring of the border colour on the accent tint', () => {
    const checked = card['&[data-state="checked"]']
    expect(checked.borderColor).toBe('colorPalette.solid')
    expect(checked.boxShadow).toContain('colorPalette.solid')
    expect(checked.bg).toBe('accent.subtle')
  })

  it('pads the option vertically, so a wrapped label or description does not touch the border', () => {
    expect(card).toMatchObject({ minH: '16', py: '3' })
  })

  it('keeps the keyboard focus visible on the whole option', () => {
    expect(card['&:has(input:focus-visible)'].outlineStyle).toBe('solid')
  })
})

describe('QuestionsTypeBadge recipe', () => {
  it('is a ringed tag, not a filled pill', () => {
    expect(QuestionsTypeBadge.base.box.borderColor).toBe('border.emphasized')
    expect(QuestionsTypeBadge.base.box.bg).toBeUndefined()
  })
})

describe('QuestionsConfirmation recipe', () => {
  it('draws the confirmed answer as a success disc with a white tick', () => {
    expect(QuestionsConfirmation.base.check).toMatchObject({
      borderRadius: 'full',
      bg: 'status.success.fg',
      color: 'accent.contrast',
    })
  })
})
