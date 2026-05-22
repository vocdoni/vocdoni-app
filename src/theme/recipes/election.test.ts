import { ElectionResults, Voted } from './election'

describe('ElectionResults recipe', () => {
  it('keeps result questions stacked vertically', () => {
    expect(ElectionResults.base.wrapper.gridTemplateColumns).toBe('1fr')
  })
})

describe('Voted recipe', () => {
  it('allows long SHA vote IDs to wrap in the description', () => {
    expect(Voted.base.description.overflowWrap).toBe('anywhere')
  })
})
