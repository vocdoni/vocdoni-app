import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { SelectorTypes } from '../common'
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

vi.mock('~components/Process/Create/TemplateProvider', () => ({
  useProcessTemplates: () => ({
    activeTemplate: 'default',
    placeholders: {},
  }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    defaultValues: {
      questions: [{ type: SelectorTypes.Single, options: [{ option: 'A' }, { option: 'B' }] }],
    },
  })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('SimpleQuestionEditor', () => {
  it('renders options using choice card wrappers', () => {
    const questionOptions = [{ id: 'opt-1' }, { id: 'opt-2' }]

    const { container } = render(
      <SimpleQuestionEditor index={0} questionOptions={questionOptions} append={vi.fn()} remove={vi.fn()} />,
      { wrapper: Wrapper }
    )

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    expect(container.querySelectorAll('[data-choice-card]')).toHaveLength(2)
  })
})
