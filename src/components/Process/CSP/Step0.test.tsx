import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '~src/test-utils'
import { Step0Base } from './Step0'

const mockSetCurrentStep = vi.fn()
const mockSetAuthData = vi.fn()
const mockCsp1 = vi.fn()
const mockMutateAsync = vi.fn()

let mockAuthFields: string[] = ['memberNumber', 'name']
let mockTwoFaFields: string[] = ['email']

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    actions: {
      csp1: mockCsp1,
    },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: mockSetCurrentStep,
    setAuthData: mockSetAuthData,
    authFields: mockAuthFields,
    twoFaFields: mockTwoFaFields,
  }),
}))

vi.mock('./basics', async () => {
  const actual = await vi.importActual<typeof import('./basics')>('./basics')
  return {
    ...actual,
    useTwoFactorAuth: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: new Error('boom'),
    }),
  }
})

const setupCrisp = (push = vi.fn()) => {
  const typedWindow = window as typeof window & { $crisp?: { push: (...args: any[]) => void } }
  typedWindow.$crisp = { push }
  return push
}

const clearCrisp = () => {
  const typedWindow = window as typeof window & { $crisp?: { push: (...args: any[]) => void } }
  delete typedWindow.$crisp
}

const fillAndSubmit = async () => {
  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/Member Number/i), '123')
  await user.type(screen.getByLabelText(/^Name/i), 'Alice')
  await user.type(screen.getByLabelText(/Email/i), 'alice@example.com')
  await user.click(screen.getByRole('checkbox'))

  await user.click(screen.getByRole('button', { name: 'Receive Code' }))
}

beforeEach(() => {
  mockSetCurrentStep.mockClear()
  mockSetAuthData.mockClear()
  mockCsp1.mockClear()
  mockMutateAsync.mockReset()
  mockAuthFields = ['memberNumber', 'name']
  mockTwoFaFields = ['email']
})

afterEach(() => {
  clearCrisp()
})

describe('Step0Base crisp integration', () => {
  it('pushes auth fields to crisp on successful submit', async () => {
    import.meta.env.CRISP_WEBSITE_ID = 'test-id'
    const push = setupCrisp()
    mockMutateAsync.mockResolvedValue({ authToken: 'token-1' })

    render(<Step0Base election={{} as any} />)

    await fillAndSubmit()

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(['set', 'user:nickname', ['memberNumber 123']])
    })

    expect(push).toHaveBeenCalledTimes(1)
  })

  it('does not push to crisp when auth fails', async () => {
    import.meta.env.CRISP_WEBSITE_ID = 'test-id'
    const push = setupCrisp()
    mockMutateAsync.mockRejectedValue(new Error('nope'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<Step0Base election={{} as any} />)

    await fillAndSubmit()

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    expect(push).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('does not push to crisp when website id is missing', async () => {
    import.meta.env.CRISP_WEBSITE_ID = ''
    const push = setupCrisp()
    mockMutateAsync.mockResolvedValue({ authToken: 'token-1' })

    render(<Step0Base election={{} as any} />)

    await fillAndSubmit()

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    expect(push).not.toHaveBeenCalled()
  })

  it('does not block step progression when crisp push fails', async () => {
    import.meta.env.CRISP_WEBSITE_ID = 'test-id'
    const push = vi.fn(() => {
      throw new Error('invalid')
    })
    setupCrisp(push)
    mockMutateAsync.mockResolvedValue({ authToken: 'token-1' })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<Step0Base election={{} as any} />)

    await fillAndSubmit()

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1)
    })

    expect(push).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
