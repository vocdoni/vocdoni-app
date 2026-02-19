import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, waitFor } from '~src/test-utils'
import { ElectionQuestion, QuestionsFormProvider } from './Questions'

const { PublishedElection, testElection } = vi.hoisted(() => {
  class PublishedElection {}
  return { PublishedElection, testElection: new PublishedElection() as any }
})

vi.mock('@vocdoni/sdk', () => ({
  ElectionResultsTypeNames: {
    SINGLE_CHOICE_MULTIQUESTION: 'SINGLE_CHOICE_MULTIQUESTION',
  },
  ElectionStatus: {
    ONGOING: 'ONGOING',
  },
  PublishedElection,
}))

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    election: testElection,
    isAbleToVote: true,
    loading: { voting: false },
    localize: (key: string) => key,
    client: { wallet: null },
    vote: vi.fn(),
    connected: true,
    errors: { voting: null },
    voted: null,
  }),
}))

vi.mock('../confirm/useConfirm', () => ({
  useConfirm: () => ({ confirm: vi.fn() }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    defaultValues: { 0: '' },
  })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('ElectionQuestion', () => {
  it('adds choice card wrappers for options', async () => {
    Object.assign(testElection, {
      questions: [
        {
          title: { default: 'Question' },
          choices: [{ title: { default: 'Option A' }, value: 0 }],
        },
      ],
      status: 'ONGOING',
      voteType: { maxCount: 1 },
      resultsType: { name: 'SINGLE_CHOICE_MULTIQUESTION' },
    })

    const { container } = render(
      <QuestionsFormProvider>
        <ElectionQuestion index='0' question={testElection.questions[0]} />
      </QuestionsFormProvider>,
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      expect(container.querySelectorAll('[data-choice-card]')).toHaveLength(1)
    })
  })

  it('checks the clicked checkbox in multi-choice', async () => {
    Object.assign(testElection, {
      questions: [
        {
          title: { default: 'Question' },
          choices: [
            { title: { default: 'Option A' }, value: 0 },
            { title: { default: 'Option B' }, value: 1 },
          ],
        },
      ],
      status: 'ONGOING',
      voteType: { maxCount: 2 },
      resultsType: { name: 'MULTIPLE_CHOICE', properties: { canAbstain: false } },
      get: () => false,
    })

    const user = userEvent.setup()

    const { container } = render(
      <QuestionsFormProvider>
        <ElectionQuestion index='0' question={testElection.questions[0]} />
      </QuestionsFormProvider>,
      { wrapper: Wrapper }
    )

    await user.click(screen.getByText('Option B'))

    const cards = container.querySelectorAll('[data-choice-card]')
    expect(cards).toHaveLength(2)
    expect(cards[1].getAttribute('data-state')).toBe('checked')
    expect(cards[0].getAttribute('data-state')).not.toBe('checked')
  })

  it('uses unique checkbox ids for multi-choice', async () => {
    Object.assign(testElection, {
      questions: [
        {
          title: { default: 'Question' },
          choices: [
            { title: { default: 'Option A' }, value: 0 },
            { title: { default: 'Option B' }, value: 1 },
          ],
        },
      ],
      status: 'ONGOING',
      voteType: { maxCount: 2 },
      resultsType: { name: 'MULTIPLE_CHOICE', properties: { canAbstain: false } },
      get: () => false,
    })

    const { container } = render(
      <QuestionsFormProvider>
        <ElectionQuestion index='0' question={testElection.questions[0]} />
      </QuestionsFormProvider>,
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      const inputs = Array.from(container.querySelectorAll('input[type="checkbox"][name="0"]'))
      const ids = inputs.map((input) => input.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(inputs.length)
      ids.forEach((id) => {
        expect(id.startsWith('question-0-choice-')).toBe(true)
      })
    })
  })
})
