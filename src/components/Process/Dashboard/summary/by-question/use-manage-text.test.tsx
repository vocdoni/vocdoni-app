import { renderHook } from '@testing-library/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { useManageText } from './use-manage-text'

const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>

// No ballot protocol: the note is the description alone, with no "Single choice." after it.
const note = (description: string) => {
  const { result } = renderHook(() => useManageText(), { wrapper })
  const question = { id: 'q1', title: { default: 'Q' }, description: { default: description } }
  return result.current.note(question as unknown as VotingProcessQuestion)
}

describe('useManageText note', () => {
  it('keeps characters that are not markup where they are', () => {
    expect(note('Quota_2027 for the budget')).toBe('Quota_2027 for the budget')
    expect(note('#1 priority')).toBe('#1 priority')
    expect(note('5 > 3, in C#')).toBe('5 > 3, in C#')
    expect(note('rename snake_case_name')).toBe('rename snake_case_name')
  })

  it('strips real markdown and keeps the text of links', () => {
    expect(note('# Budget\n> **Approve** the _new_ [article](https://example.org) ~~4~~ `5`')).toBe(
      'Budget Approve the new article 4 5'
    )
    expect(note('- one\n* two\n__three__ *four*')).toBe('one two three four')
  })
})
