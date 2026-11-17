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

  // A colour too pale for the page keeps its shape with the control line: outside the chosen option's 2px ring, and
  // inside the chosen disc and the checked box.
  it('edges the chosen option, its disc and its box when the colour needs it', () => {
    const edge = 'var(--chakra-colors-color-palette-solid-edge, transparent)'
    expect(card['&[data-state="checked"]'].boxShadow).toBe(
      `[0 0 0 {borderWidths.hairline} {colors.colorPalette.solid}, 0 0 0 {borderWidths.thick} ${edge}]`
    )
    expect(QuestionChoice.base.wrapper['&[data-state="checked"] [data-choice-mark]'].boxShadow).toBe(
      `[inset 0 0 0 {borderWidths.hairline} ${edge}]`
    )
    const box = card['& [data-choice-control][data-control-type="checkbox"]']['&[data-state="checked"]']
    expect(box.boxShadow).toBe(`[inset 0 0 0 {borderWidths.hairline} ${edge}]`)
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
