import type { ChangeEvent, ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { VerificationPending } from './Verify'

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react')
  const React = await vi.importActual<typeof import('react')>('react')

  type PinInputContextValue = {
    count: number
    value: string[]
    onValueChange?: (details: { value: string[]; valueAsString: string }) => void
  }

  const PinInputContext = React.createContext<PinInputContextValue>({
    count: 6,
    value: [],
  })

  const PinInputRoot = ({
    children,
    count = 6,
    onValueChange,
    value = [],
    ...props
  }: {
    children: ReactNode
    count?: number
    onValueChange?: (details: { value: string[]; valueAsString: string }) => void
    value?: string[]
  }) => (
    <PinInputContext.Provider value={{ count, onValueChange, value }}>
      <div {...props}>{children}</div>
    </PinInputContext.Provider>
  )

  const PinInputControl = ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>

  const PinInputInput = ({ index, ...props }: { index: number }) => {
    const { count, onValueChange, value } = React.useContext(PinInputContext)

    const updateValue = (next: string[]) => {
      onValueChange?.({
        value: next,
        valueAsString: next.join(''),
      })
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.currentTarget.value ?? ''
      const nextValue = Array.from({ length: count }, (_, currentIndex) => value[currentIndex] ?? '')

      if (rawValue.length > 1) {
        rawValue
          .slice(0, count)
          .split('')
          .forEach((char, currentIndex) => {
            nextValue[currentIndex] = char
          })
      } else {
        nextValue[index] = rawValue
      }

      updateValue(nextValue)
    }

    return (
      <input
        aria-label={`pin code ${index + 1} of ${count}`}
        onChange={handleChange}
        type='text'
        value={value[index] ?? ''}
        {...props}
      />
    )
  }

  return {
    ...actual,
    PinInputControl,
    PinInputInput,
    PinInputRoot,
  }
})

const verifyAsyncMock = vi.fn()
const navigateMock = vi.fn()
const toastMock = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    mailVerify: {
      mutateAsync: verifyAsyncMock,
      isPending: false,
      isError: false,
    },
  }),
}))

vi.mock('~components/Auth/authQueries', () => ({
  useResendVerificationMail: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useOutletContext: () => ({
      setTitle: vi.fn(),
      setSubtitle: vi.fn(),
    }),
  }
})

vi.mock('~components/Toast', async () => {
  const actual = await vi.importActual<typeof import('~components/Toast')>('~components/Toast')
  return {
    ...actual,
    useToast: () => toastMock,
  }
})

const getPinInputs = () => screen.getAllByRole<HTMLInputElement>('textbox', { name: /pin code \d of 6/i })

describe('VerificationPending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyAsyncMock.mockResolvedValue(undefined)
  })

  it('renders 6 pin input fields', async () => {
    render(<VerificationPending email='test@example.com' />)

    await waitFor(() => {
      expect(getPinInputs()).toHaveLength(6)
    })
  })

  it('does not render undefined values when pasting the pin code', async () => {
    const user = userEvent.setup()
    render(<VerificationPending email='test@example.com' />)

    const pinInputs = getPinInputs()
    await user.click(pinInputs[0])
    await user.paste('123456')

    await waitFor(() => {
      const values = getPinInputs().map((input) => input.value)

      expect(values).toEqual(['1', '2', '3', '4', '5', '6'])
      expect(values).not.toContain('undefined')
      expect(screen.queryByDisplayValue('undefined')).not.toBeInTheDocument()
    })
  })

  it('preserves the deleted position instead of compacting the remaining digits', async () => {
    const user = userEvent.setup()
    render(<VerificationPending email='test@example.com' />)

    const pinInputs = getPinInputs()

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.click(pinInputs[index])
      await user.type(pinInputs[index], digit)
    }

    await user.click(pinInputs[1])
    await user.clear(pinInputs[1])

    await waitFor(() => {
      const values = getPinInputs().map((input) => input.value)

      expect(values).toEqual(['1', '', '3', '4', '5', '6'])
      expect(values).not.toContain('undefined')
    })
  })

  it('submits the full code when all 6 digits are entered sequentially', async () => {
    const user = userEvent.setup()
    render(<VerificationPending email='test@example.com' />)

    const pinInputs = getPinInputs()

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.click(pinInputs[index])
      await user.type(pinInputs[index], digit)
    }

    await waitFor(() => {
      expect(verifyAsyncMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
      })
    })
  })
})
