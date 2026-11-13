import { ElectionResults, QuestionChoice, QuestionsTypeBadge } from './election'

describe('ElectionResults recipe', () => {
  it('keeps result questions stacked vertically', () => {
    expect(ElectionResults.base.wrapper.gridTemplateColumns).toBe('1fr')
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
