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

const QuestionsHarness = ({ questionCount }: { questionCount: number }) => {
  const methods = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
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
})
