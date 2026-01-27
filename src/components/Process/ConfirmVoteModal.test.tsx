import { render, screen } from '~src/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ElectionResultsTypeNames, PublishedElection } from '@vocdoni/sdk'
import { FieldValues } from 'react-hook-form'
import { ConfirmVoteModal } from './ConfirmVoteModal'

vi.mock('~components/vocdoni-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/vocdoni-ui')>()
  return {
    ...actual,
    useConfirm: () => ({
      isOpen: true,
      cancel: vi.fn(),
      proceed: vi.fn(),
    }),
  }
})

describe('ConfirmVoteModal', () => {
  it('renders election title and selections', () => {
    const election = {
      title: { default: 'Test Election' },
      resultsType: { name: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION },
      questions: [
        {
          title: { default: 'Question 1' },
          choices: [{ title: { default: 'Choice A' } }],
        },
      ],
    } as unknown as PublishedElection

    const answers = { 0: 0 } as FieldValues

    render(<ConfirmVoteModal election={election} answers={answers} />)

    expect(screen.getByText('Your vote has been recorded for:')).toBeInTheDocument()
    expect(screen.getByText('Test Election')).toBeInTheDocument()
    expect(screen.getByText('Question 1')).toBeInTheDocument()
    expect(screen.getByText('Choice A')).toBeInTheDocument()
  })
})
