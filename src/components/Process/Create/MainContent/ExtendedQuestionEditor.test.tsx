import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
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

vi.mock('~components/Process/Create/TemplateProvider', () => ({
  useProcessTemplates: () => ({
    activeTemplate: 'default',
    placeholders: {},
  }),
}))

vi.mock('~components/Editor', () => ({
  default: () => <div data-testid='editor' />,
}))

vi.mock('~components/Layout/Uploader', () => ({
  ImageUploader: () => <div data-testid='image-uploader' />,
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    defaultValues: {
      questions: [{ options: [{ option: 'A', description: 'Desc' }] }],
    },
  })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('ExtendedQuestionEditor', () => {
  it('renders options using choice card wrappers', () => {
    const questionOptions = [{ id: 'opt-1' }]

    const { container } = render(
      <ExtendedQuestionEditor index={0} questionOptions={questionOptions} append={vi.fn()} remove={vi.fn()} />,
      { wrapper: Wrapper }
    )

    expect(screen.getByTestId('image-uploader')).toBeTruthy()
    expect(container.querySelectorAll('[data-choice-card]')).toHaveLength(1)
  })

  it('renders option titles with semibold value and placeholder styles', () => {
    const questionOptions = [{ id: 'opt-1' }]

    render(<ExtendedQuestionEditor index={0} questionOptions={questionOptions} append={vi.fn()} remove={vi.fn()} />, {
      wrapper: Wrapper,
    })

    const [optionInput] = screen.getAllByRole('textbox')
    const inputClassName =
      optionInput
        .getAttribute('class')
        ?.split(' ')
        .find((className) => className.startsWith('css-')) ?? ''

    expect(optionInput).toHaveStyle({ fontWeight: 'var(--chakra-font-weights-semibold)' })
    expect(inputClassName).toBeTruthy()

    const styleTags = Array.from(document.head.querySelectorAll('style'))
      .map((tag) => tag.textContent ?? '')
      .join('\n')

    expect(styleTags).toContain(`.${inputClassName}::placeholder`)
    expect(styleTags).toMatch(
      new RegExp(`\\.${inputClassName}::placeholder[^}]*font-weight:var\\(--chakra-font-weights-semibold\\)`)
    )
  })
})
