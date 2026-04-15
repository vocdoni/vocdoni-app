import { ElectionResults } from './election'

describe('ElectionResults recipe', () => {
  it('keeps result questions stacked vertically', () => {
    expect(ElectionResults.base.wrapper.gridTemplateColumns).toBe('1fr')
  })
})
