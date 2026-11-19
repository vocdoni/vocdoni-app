import { ElectionResults, Voted } from './election'

describe('ElectionResults recipe', () => {
  it('keeps result questions stacked vertically', () => {
    expect(ElectionResults.base.wrapper.gridTemplateColumns).toBe('1fr')
  })

  it('styles the vote id link inside the Voted notice', () => {
    expect(Voted.base.description).toHaveProperty(['& a', 'color'], 'link.fg')
    expect(Voted.base.description).toHaveProperty(['& a', 'textDecoration'], 'underline')
  })
})
