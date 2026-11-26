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

const QuestionsHarness = ({ questionCount, startPaused = false }: { questionCount: number; startPaused?: boolean }) => {
  const methods = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
      startPaused,
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

  describe('start paused', () => {
    const label = /Open the questions yourself/

    it('lets the organizer open the questions themselves when the flag is on', async () => {
      const user = userEvent.setup()
      render(<QuestionsHarness questionCount={1} />, { appEnv: { QUESTION_BY_QUESTION: true } })

      expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked()
      expect(screen.getByRole('checkbox', { name: label })).toBeEnabled()
      expect(screen.getByRole('checkbox', { name: label })).toHaveAccessibleDescription(/start paused/)

      await user.click(screen.getByRole('checkbox', { name: label }))

      expect(screen.getByRole('checkbox', { name: label })).toBeChecked()
    })

    it('hides the switch when the flag is off', () => {
      render(<QuestionsHarness questionCount={1} />, { appEnv: { QUESTION_BY_QUESTION: false } })

      expect(screen.queryByRole('checkbox', { name: label })).not.toBeInTheDocument()
    })

    it('keeps a draft that started paused on, read-only, when the flag is off', () => {
      render(<QuestionsHarness questionCount={1} startPaused />, {
        appEnv: { QUESTION_BY_QUESTION: false },
      })

      expect(screen.getByRole('checkbox', { name: label })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: label })).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: label })).toHaveAccessibleDescription(/can't change it here/)
    })
  })
})
