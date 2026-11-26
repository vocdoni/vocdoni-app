import { voterResultsChoice, voterResultsMetadata, voterSeesQuestionResult, voterSeesResults } from './voter-results'

const q = (voterResults?: unknown) => ({ metadata: voterResults === undefined ? { choices: [] } : { voterResults } })

describe('voter results choice', () => {
  it('reads shown, hidden and the first builds’ per-question value', () => {
    expect(voterResultsChoice([q('shown')])).toBe('shown')
    expect(voterResultsChoice([q('perQuestion')])).toBe('shown')
    expect(voterResultsChoice([q('hidden')])).toBe('hidden')
    expect(voterResultsChoice([q(), q('hidden')])).toBe('hidden')
  })

  it('is null on a vote that predates it, or on anything else', () => {
    expect(voterResultsChoice([q(), { metadata: null }, {}, null, undefined])).toBeNull()
    expect(voterResultsChoice([q(true), q('other')])).toBeNull()
    expect(voterResultsChoice(undefined)).toBeNull()
  })

  it('offers the results screen unless the creator hid them', () => {
    expect(voterSeesResults([q('shown')])).toBe(true)
    expect(voterSeesResults([q()])).toBe(true)
    expect(voterSeesResults([q('hidden')])).toBe(false)
  })

  it('shows a closed question’s result only when the creator chose so', () => {
    expect(voterSeesQuestionResult(q('shown'))).toBe(true)
    expect(voterSeesQuestionResult(q('perQuestion'))).toBe(true)
    expect(voterSeesQuestionResult(q('hidden'))).toBe(false)
    expect(voterSeesQuestionResult(q())).toBe(false)
    expect(voterSeesQuestionResult(null)).toBe(false)
  })

  it('writes the choice either way, and reads back what it wrote', () => {
    expect(voterResultsMetadata(true)).toEqual({ voterResults: 'shown' })
    expect(voterResultsMetadata(false)).toEqual({ voterResults: 'hidden' })
    expect(voterResultsChoice([{ metadata: voterResultsMetadata(false) }])).toBe('hidden')
  })
})
