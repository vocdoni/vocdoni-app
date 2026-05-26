import type { PublishedElection } from '@vocdoni/sdk'
import { mockUseElection, render } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Step0Base } from './Step0'
import { fireEvent, screen, waitFor } from '@testing-library/react'

const storeProcessCspIdentifier = vi.fn()

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: vi.fn(),
    setAuthData: vi.fn(),
    authFields: ['name'],
    twoFaFields: [],
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ authToken: 'token' }),
    isPending: false,
    isError: false,
  }),
}))

vi.mock('../authenticatedVoterLabel', () => ({
  storeProcessCspIdentifier: (...args: unknown[]) => storeProcessCspIdentifier(...args),
}))

describe('Step0Base', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          actions: {
            csp1: vi.fn(),
          },
        }),
    })
  })

  it('renders the authenticate button', () => {
    const election = {} as PublishedElection
    const { getByRole } = render(<Step0Base election={election} />)

    expect(getByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })

  it('stores the first CSP field label when there is no email or phone', async () => {
    const election = { id: '0xprocess-1' } as PublishedElection
    render(<Step0Base election={election} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Katleen' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate' }))

    await waitFor(() =>
      expect(storeProcessCspIdentifier).toHaveBeenCalledWith('0xprocess-1', undefined, 'Katleen', 'Name')
    )
  })
})
