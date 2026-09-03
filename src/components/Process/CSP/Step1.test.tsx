import type { ChangeEvent, ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { Step1Base } from './Step1'

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

  const PinInputHiddenInput = (props: Record<string, unknown>) => {
    const { value } = React.useContext(PinInputContext)

    return <input aria-hidden='true' readOnly type='text' value={value.join('')} {...props} />
  }

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
    PinInputHiddenInput,
    PinInputInput,
    PinInputRoot,
  }
})

const mutateAsync = vi.fn()
const resendMutateAsync = vi.fn()

const getPinInputs = () => screen.getAllByRole<HTMLInputElement>('textbox', { name: /pin code \d of 6/i })

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    authData: {
      email: 'user@example.com',
      phone: '+34600000000',
    },
  }),
}))

vi.mock('./basics', () => ({
  useCspAuth1: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
  }),
  useCspResend: () => ({
    mutateAsync: resendMutateAsync,
    isPending: false,
  }),
}))

describe('Step1Base', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue(undefined)
    resendMutateAsync.mockReset()
    resendMutateAsync.mockResolvedValue(undefined)
  })

  it('renders the authenticate button', async () => {
    const { findByRole } = render(<Step1Base />)

    expect(await findByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })

  it('renders the updated 2FA copy', () => {
    render(<Step1Base />)

    expect(screen.getByText('Enter the verification code')).toBeInTheDocument()
    expect(
      screen.getByText(
        "We've sent a code to your phone number or email address. If you chose to receive it by email, please check your spam folder."
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Authenticate' })).toBeInTheDocument()
    expect(screen.getByText("Didn't receive the code?", { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resend it' })).toBeInTheDocument()
    expect(screen.getByText('If you experience any issues, contact your organization.')).toBeInTheDocument()
  })

  it('does not render undefined values when pasting the pin code', async () => {
    const user = userEvent.setup()

    render(<Step1Base />)

    const pinInputs = getPinInputs()
    expect(pinInputs).toHaveLength(6)

    await user.click(pinInputs[0])
    await user.paste('123456')

    await waitFor(() => {
      const values = getPinInputs().map((input) => input.value)

      expect(values).toEqual(['1', '2', '3', '4', '5', '6'])
      expect(values).not.toContain('undefined')
      expect(screen.queryByDisplayValue('undefined')).not.toBeInTheDocument()
    })
  })

  it('submits the full code when digits are entered sequentially', async () => {
    const user = userEvent.setup()

    render(<Step1Base />)

    const pinInputs = getPinInputs()
    expect(pinInputs).toHaveLength(6)

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.click(pinInputs[index])
      await user.type(pinInputs[index], digit)
    }

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('123456')
    })
  })

  it('preserves the deleted position instead of compacting the remaining digits', async () => {
    const user = userEvent.setup()

    render(<Step1Base />)

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

  it('calls resend.mutateAsync with the contact info when the resend button is clicked', async () => {
    const user = userEvent.setup()

    render(<Step1Base />)

    await user.click(screen.getByRole('button', { name: 'Resend it' }))

    await waitFor(() => {
      expect(resendMutateAsync).toHaveBeenCalledWith({
        email: 'user@example.com',
        phone: '+34600000000',
      })
    })
  })

  it('shows a success toast when the resend succeeds', async () => {
    const user = userEvent.setup()

    render(<Step1Base />)

    await user.click(screen.getByRole('button', { name: 'Resend it' }))

    await waitFor(() => {
      expect(screen.getByText('Code resent successfully')).toBeInTheDocument()
    })
  })

  it('shows an error toast when the resend fails', async () => {
    resendMutateAsync.mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()

    render(<Step1Base />)

    await user.click(screen.getByRole('button', { name: 'Resend it' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to resend code')).toBeInTheDocument()
    })
  })
})
