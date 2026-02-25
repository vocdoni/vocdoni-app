import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '~src/test-utils'
import { CspAuthModal } from './CSPAuthModal'

const mockSetAuthData = vi.fn()
const mockSetCurrentStep = vi.fn()
const mockCsp1 = vi.fn()

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    election: {},
    actions: {
      csp1: mockCsp1,
    },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    currentStep: 0,
    setCurrentStep: mockSetCurrentStep,
    setAuthData: mockSetAuthData,
    authData: {},
    authFields: [],
    twoFaFields: [],
  }),
  CspAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./basics', async () => {
  const actual = await vi.importActual<typeof import('./basics')>('./basics')
  return {
    ...actual,
    useTwoFactorAuth: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: new Error('boom'),
    }),
  }
})

vi.mock('./Step0', () => ({
  Step0Base: () => <div>Step0</div>,
}))

vi.mock('./Step1', () => ({
  Step1Base: () => <div>Step1</div>,
}))

describe('CspAuthModal', () => {
  it('clears auth state when modal closes', async () => {
    const user = userEvent.setup()

    render(<CspAuthModal />)

    await user.click(screen.getByRole('button', { name: 'Login' }))
    await user.click(screen.getByLabelText('Close'))

    expect(mockSetCurrentStep).toHaveBeenCalledWith(0)
    expect(mockSetAuthData).toHaveBeenCalledWith({})
  })
})
