import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '~src/test-utils'
import { Step1Base } from './Step1'

const mockSetAuthData = vi.fn()
const mockSetCurrentStep = vi.fn()
const mockCsp1 = vi.fn()
const mockVerifyMutateAsync = vi.fn()
const mockResendMutateAsync = vi.fn()

let mockAuthData: Record<string, any> = {}

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    actions: {
      csp1: mockCsp1,
    },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    authData: mockAuthData,
    setAuthData: mockSetAuthData,
    setCurrentStep: mockSetCurrentStep,
  }),
}))

vi.mock('./basics', async () => {
  const actual = await vi.importActual<typeof import('./basics')>('./basics')
  return {
    ...actual,
    useTwoFactorAuth: (_election: any, step: number) => {
      if (step === 0) {
        return {
          mutateAsync: mockResendMutateAsync,
          isPending: false,
          isError: false,
          error: new Error('boom'),
        }
      }
      return {
        mutateAsync: mockVerifyMutateAsync,
        isPending: false,
        isError: false,
        error: new Error('boom'),
      }
    },
  }
})

beforeEach(() => {
  mockVerifyMutateAsync.mockReset()
  mockResendMutateAsync.mockReset()
  mockVerifyMutateAsync.mockResolvedValue({ authToken: 'token-2' })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Step1Base', () => {
  it('shows a cooldown before enabling resend', async () => {
    vi.useFakeTimers()
    mockAuthData = {
      authToken: 'token-1',
      step0Request: {
        memberNumber: '123',
        email: 'alice@example.com',
      },
    }

    render(<Step1Base election={{} as any} onAuthSuccess={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Re-send' })).toBeNull()
    expect(screen.getByText(/Re-send in 45s/i)).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(45_000)
    })

    expect(screen.getByRole('button', { name: 'Re-send' })).toBeInTheDocument()
    expect(screen.queryByText(/Re-send in 45s/i)).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Re-send' }))
    })
    expect(mockResendMutateAsync).toHaveBeenCalled()

    expect(screen.queryByRole('button', { name: 'Re-send' })).toBeNull()
    expect(screen.getByText(/Re-send in 45s/i)).toBeInTheDocument()
  })
  it('resends the code using stored step0 data and clears pin input', async () => {
    vi.useFakeTimers()
    mockAuthData = {
      authToken: 'token-1',
      step0Request: {
        memberNumber: '123',
        email: 'alice@example.com',
      },
    }

    render(<Step1Base election={{} as any} onAuthSuccess={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    const digits = ['1', '2', '3', '4', '5', '6']
    for (let i = 0; i < digits.length; i += 1) {
      fireEvent.change(inputs[i], { target: { value: digits[i] } })
    }

    await act(async () => {
      vi.advanceTimersByTime(45_000)
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Re-send' }))
    })

    expect(mockResendMutateAsync).toHaveBeenCalledWith(mockAuthData.step0Request)

    inputs.forEach((input) => {
      expect(input).toHaveValue('')
    })
  })

  it('disables resend when no stored step0 data is available', async () => {
    vi.useFakeTimers()
    mockAuthData = {
      authToken: 'token-1',
    }

    render(<Step1Base election={{} as any} onAuthSuccess={vi.fn()} />)

    await act(async () => {
      vi.advanceTimersByTime(45_000)
    })

    expect(screen.getByRole('button', { name: 'Re-send' })).toBeDisabled()
  })

  it('calls onAuthSuccess after verifying the code', async () => {
    const user = userEvent.setup()
    const onAuthSuccess = vi.fn()
    mockAuthData = {
      authToken: 'token-1',
      step0Request: {
        memberNumber: '123',
        email: 'alice@example.com',
      },
    }
    mockVerifyMutateAsync.mockResolvedValue({ authToken: 'token-2' })

    render(<Step1Base election={{} as any} onAuthSuccess={onAuthSuccess} />)

    const inputs = screen.getAllByRole('textbox')
    const digits = ['1', '2', '3', '4', '5', '6']
    for (let i = 0; i < digits.length; i += 1) {
      await user.type(inputs[i], digits[i])
    }

    await waitFor(() => {
      expect(mockVerifyMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalled()
    })
  })
})
