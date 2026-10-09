import { electionComponents } from './election'
import { uiScaffoldComponents } from './index'

describe('uiScaffoldComponents', () => {
  // composeComponents lets later partials overwrite earlier ones, so a second definition of a
  // slot silently replaces the election one; QuestionsError must stay the election slot, which
  // hands stale-ballot vote rejections to the ballot update flow.
  it('keeps the election QuestionsError slot', () => {
    expect(uiScaffoldComponents.QuestionsError).toBe(electionComponents.QuestionsError)
  })
})
