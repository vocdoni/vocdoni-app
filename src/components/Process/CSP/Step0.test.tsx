import type { PublishedElection } from '@vocdoni/sdk'
import { render } from '~src/test-utils'
import { Step0Base } from './Step0'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    actions: {
      csp1: vi.fn(),
    },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: vi.fn(),
    setAuthData: vi.fn(),
    authFields: [],
    twoFaFields: [],
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

describe('Step0Base', () => {
  it('renders the authenticate button', () => {
    const election = {} as PublishedElection
    const { getByRole } = render(<Step0Base election={election} />)

    expect(getByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })
})
