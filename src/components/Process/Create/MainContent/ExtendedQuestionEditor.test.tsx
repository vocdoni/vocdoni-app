import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import ExtendedQuestionEditor from './ExtendedQuestionEditor'

const mockInput = vi.fn()

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react')
  const React = await vi.importActual<typeof import('react')>('react')
  const Input = React.forwardRef<HTMLInputElement, Record<string, unknown>>((props, ref) => {
    mockInput(props)
    return React.createElement('input', { ...props, ref })
  })
  Input.displayName = 'Input'

  return {
    ...actual,
    Input,
  }
})

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
  beforeEach(() => {
    mockInput.mockClear()
  })

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
    expect(optionInput).toBeInTheDocument()

    expect(mockInput).toHaveBeenCalledWith(
      expect.objectContaining({
        fontWeight: 600,
        _placeholder: expect.objectContaining({ fontWeight: 600 }),
      })
    )
  })
})
