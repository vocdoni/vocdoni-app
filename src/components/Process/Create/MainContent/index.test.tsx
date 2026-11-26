import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MaxQuestionsPerProcess } from '~constants'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, defaultQuestion, Process } from '../common'
import { Questions } from './index'

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@dnd-kit/sortable')
  return {
    ...actual,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  }
})

vi.mock('~components/Editor', () => ({
  default: () => <div data-testid='editor' />,
}))

vi.mock('~components/Layout/Uploader', () => ({
  ImageUploader: () => <div data-testid='image-uploader' />,
}))

const QuestionsHarness = ({
  questionCount,
  votingMode = 'all',
}: {
  questionCount: number
  votingMode?: Process['votingMode']
}) => {
  const methods = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
      votingMode,
      questions: Array.from({ length: questionCount }, () => ({ ...defaultQuestion })),
    },
  })

  return (
    <FormProvider {...methods}>
      <Questions />
    </FormProvider>
  )
}

describe('Questions', () => {
  it('adds a question while under the limit', async () => {
    const user = userEvent.setup()
    render(<QuestionsHarness questionCount={1} />)

    await user.click(screen.getByRole('button', { name: 'Add question' }))

    expect(screen.getAllByText('Single choice')).toHaveLength(2)
    expect(screen.queryByText(/at most/)).not.toBeInTheDocument()
  })

  it('disables adding a question at the maximum and says why', () => {
    render(<QuestionsHarness questionCount={MaxQuestionsPerProcess} />)

    expect(screen.getByRole('button', { name: 'Add question' })).toBeDisabled()
    expect(screen.getByText(/at most 15 questions/)).toBeInTheDocument()
  })

  describe('voting mode', () => {
    it('lets the organizer choose question by question when the flag is on', async () => {
      const user = userEvent.setup()
      render(<QuestionsHarness questionCount={1} />, { appEnv: { QUESTION_BY_QUESTION: true } })

      expect(screen.getByRole('radiogroup', { name: 'How people vote' })).toBeInTheDocument()
      expect(screen.queryByText(/Questions start closed/)).not.toBeInTheDocument()

      await user.click(screen.getByRole('radio', { name: 'Question by question', hidden: true }))

      expect(screen.getByRole('radio', { name: 'Question by question', hidden: true })).toBeChecked()
      expect(screen.getByText(/Questions start closed/)).toBeInTheDocument()
    })

    it('hides the switch when the flag is off', () => {
      render(<QuestionsHarness questionCount={1} />, { appEnv: { QUESTION_BY_QUESTION: false } })

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
      expect(screen.queryByText(/Questions start closed/)).not.toBeInTheDocument()
    })

    it('shows the kept mode read-only when the flag is off and the draft is question by question', () => {
      render(<QuestionsHarness questionCount={1} votingMode='byQuestion' />, {
        appEnv: { QUESTION_BY_QUESTION: false },
      })

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
      expect(screen.getByText('Question by question')).toBeInTheDocument()
      expect(screen.getByText(/Questions start closed/)).toBeInTheDocument()
    })
  })
})
