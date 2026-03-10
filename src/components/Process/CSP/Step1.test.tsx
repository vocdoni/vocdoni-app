import type { ChangeEvent, ReactNode } from 'react'
import type { PublishedElection } from '@vocdoni/sdk'
import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
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

const getPinInputs = () => screen.getAllByRole<HTMLInputElement>('textbox', { name: /pin code \d of 6/i })

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    authData: {
      authToken: 'token',
    },
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
  }),
}))

describe('Step1Base', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ authToken: 'next-token' })

    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          actions: {
            csp1: vi.fn(),
          },
        }),
    })
  })

  it('renders the authenticate button', async () => {
    const election = {} as PublishedElection
    const { findByRole } = render(<Step1Base election={election} />)

    expect(await findByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })

  it('does not render undefined values when pasting the pin code', async () => {
    const election = {} as PublishedElection
    const user = userEvent.setup()

    render(<Step1Base election={election} />)

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
    const election = {} as PublishedElection
    const user = userEvent.setup()

    render(<Step1Base election={election} />)

    const pinInputs = getPinInputs()
    expect(pinInputs).toHaveLength(6)

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.click(pinInputs[index])
      await user.type(pinInputs[index], digit)
    }

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        authToken: 'token',
        authData: ['123456'],
      })
    })
  })

  it('preserves the deleted position instead of compacting the remaining digits', async () => {
    const election = {} as PublishedElection
    const user = userEvent.setup()

    render(<Step1Base election={election} />)

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
})
