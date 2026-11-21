import { useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { Process, SelectorTypes } from '../common'
import SimpleQuestionEditor from './SimpleQuestionEditor'

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

const Harness = ({ questionOptions }: { questionOptions: { id: string }[] }) => {
  const form = useForm<Process>({
    defaultValues: {
      questions: [{ type: SelectorTypes.Single, options: [{ option: 'A' }, { option: 'B' }] }],
    },
  })
  return (
    <SimpleQuestionEditor
      index={0}
      control={form.control}
      questionOptions={questionOptions}
      append={vi.fn()}
      remove={vi.fn()}
    />
  )
}

describe('SimpleQuestionEditor', () => {
  it('renders options using choice card wrappers', () => {
    const questionOptions = [{ id: 'opt-1' }, { id: 'opt-2' }]

    const { container } = render(<Harness questionOptions={questionOptions} />)

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    expect(container.querySelectorAll('[data-choice-card]')).toHaveLength(2)
  })
})
