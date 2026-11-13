import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { Process } from '../common'
import ExtendedQuestionEditor from './ExtendedQuestionEditor'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}))

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual<typeof import('react-i18next')>('react-i18next')
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { defaultValue?: string } | string) =>
        typeof options === 'string' ? options : (options?.defaultValue ?? key),
    }),
  }
})

vi.mock('~components/Editor', () => ({
  default: () => <div data-testid='editor' />,
}))

vi.mock('~components/Layout/Uploader', () => ({
  ImageUploader: () => <div data-testid='image-uploader' />,
}))

const Harness = ({
  questionOptions,
  append = vi.fn(),
}: {
  questionOptions: { id: string }[]
  append?: (value: { option: string; description: string }) => void
}) => {
  const form = useForm<Process>({
    defaultValues: {
      questions: [{ options: [{ option: 'A', description: 'Desc' }] }],
    },
  })
  return (
    <ExtendedQuestionEditor
      index={0}
      control={form.control}
      questionOptions={questionOptions}
      append={append}
      remove={vi.fn()}
    />
  )
}

describe('ExtendedQuestionEditor', () => {
  it('renders options using choice card wrappers', () => {
    const questionOptions = [{ id: 'opt-1' }]

    const { container } = render(<Harness questionOptions={questionOptions} />)

    expect(screen.getByTestId('image-uploader')).toBeTruthy()
    expect(container.querySelectorAll('[data-choice-card]')).toHaveLength(1)
  })

  it('adds an option from a keyboard-reachable button', async () => {
    const user = userEvent.setup()
    const append = vi.fn()

    render(<Harness questionOptions={[{ id: 'opt-1' }]} append={append} />)

    const add = screen.getByRole('button', { name: 'Add option' })
    add.focus()
    await user.keyboard('{Enter}')

    expect(append).toHaveBeenCalledWith({ option: '', description: '' })
  })
})
