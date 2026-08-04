import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, defaultQuestion, Process, SelectorTypes } from '../common'
import { QuestionForm } from './QuestionForm'

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

vi.mock('~components/Process/Create/TemplateProvider', () => ({
  useProcessTemplates: () => ({ activeTemplate: 'default', placeholders: {} }),
}))

vi.mock('~components/Editor', () => ({
  default: () => <div data-testid='editor' />,
}))

vi.mock('~components/Layout/Uploader', () => ({
  ImageUploader: () => <div data-testid='image-uploader' />,
}))

const QuestionFormHarness = ({ questions }: { questions: Process['questions'] }) => {
  const methods = useForm<Process>({ defaultValues: { ...defaultProcessValues, questions } })

  return (
    <FormProvider {...methods}>
      {questions.map((_, index) => (
        <QuestionForm key={index} index={index} questionId={`question-${index}`} onRemove={vi.fn()} />
      ))}
    </FormProvider>
  )
}

describe('QuestionForm', () => {
  it('gives every question its own settings', () => {
    render(<QuestionFormHarness questions={[{ ...defaultQuestion }, { ...defaultQuestion }]} />)

    expect(screen.getAllByRole('checkbox', { name: 'Extended info' })).toHaveLength(2)
    expect(screen.getAllByText('Single choice')).toHaveLength(2)
  })

  it('renders extended choice cards only for the questions that asked for them', () => {
    render(<QuestionFormHarness questions={[{ ...defaultQuestion, extendedInfo: true }, { ...defaultQuestion }]} />)

    // Only the extended editor uploads images, and it renders one uploader per
    // choice: the two of the first question, none of the second.
    expect(screen.getAllByTestId('image-uploader')).toHaveLength(2)
  })

  it('renders plain choices when no question asked for extended info', () => {
    render(<QuestionFormHarness questions={[{ ...defaultQuestion }, { ...defaultQuestion }]} />)

    expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument()
  })

  it('shows the selection limits only for multiple-choice questions', () => {
    render(
      <QuestionFormHarness questions={[{ ...defaultQuestion }, { ...defaultQuestion, type: SelectorTypes.Multiple }]} />
    )

    expect(screen.getAllByText('Selection limits:')).toHaveLength(1)
  })
})
