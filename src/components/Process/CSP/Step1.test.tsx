import type { PublishedElection } from '@vocdoni/sdk'
import { render } from '~src/test-utils'
import { Step1Base } from './Step1'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    actions: {
      csp1: vi.fn(),
    },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    authData: {
      authToken: 'token',
    },
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

describe('Step1Base', () => {
  it('renders the authenticate button', async () => {
    const election = {} as PublishedElection
    const { findByRole } = render(<Step1Base election={election} />)

    expect(await findByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })
})
