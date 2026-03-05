import { Button } from '@chakra-ui/react'
import { ElectionResultsTypeNames, PublishedElection } from '@vocdoni/sdk'
import { FieldValues } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { ConfirmVoteModal } from './ConfirmVoteModal'

const cancelSpy = vi.fn()
const proceedSpy = vi.fn()

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()

  return {
    ...actual,
    Dialog: {
      ...actual.Dialog,
      Root: ({ onOpenChange, children, ...props }: any) => (
        <>
          <Button onClick={() => onOpenChange?.({ open: false })}>trigger-close</Button>
          <actual.Dialog.Root onOpenChange={onOpenChange} {...props}>
            {children}
          </actual.Dialog.Root>
        </>
      ),
    },
  }
})

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  return {
    ...actual,
    useConfirm: () => ({
      isOpen: true,
      cancel: cancelSpy,
      proceed: proceedSpy,
    }),
  }
})

describe('ConfirmVoteModal', () => {
  beforeEach(() => {
    cancelSpy.mockClear()
    proceedSpy.mockClear()
  })

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

  it('cancels when pressing the cancel action button', () => {
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

    screen.getByRole('button', { name: 'confirm.cancel' }).click()

    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(proceedSpy).not.toHaveBeenCalled()
  })
})
