import type { PublishedElection } from '@vocdoni/sdk'
import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Step0Base } from './Step0'

const cspState = vi.hoisted(() => ({
  setCurrentStep: vi.fn(),
  setAuthData: vi.fn(),
  setMemberNumber: vi.fn(),
  authFields: [] as Array<'memberNumber'>,
  twoFaFields: [] as string[],
  mutateAsync: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    setMemberNumber: cspState.setMemberNumber,
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: cspState.setCurrentStep,
    setAuthData: cspState.setAuthData,
    authFields: cspState.authFields,
    twoFaFields: cspState.twoFaFields,
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync: cspState.mutateAsync,
    isPending: false,
    isError: false,
  }),
}))

describe('Step0Base', () => {
  beforeEach(() => {
    cspState.setCurrentStep.mockClear()
    cspState.setAuthData.mockClear()
    cspState.setMemberNumber.mockClear()
    cspState.authFields = []
    cspState.twoFaFields = []
    cspState.mutateAsync.mockReset()
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

  it('stores the member number after a successful authentication', async () => {
    cspState.authFields = ['memberNumber']
    cspState.mutateAsync.mockResolvedValue({ authToken: 'token' })
    const user = userEvent.setup()
    const election = {} as PublishedElection

    render(<Step0Base election={election} />)

    await user.type(screen.getByLabelText('Member Number'), '12345')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(cspState.setMemberNumber).toHaveBeenCalledWith('12345')
  })
})
