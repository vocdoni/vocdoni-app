import type { PublishedElection } from '@vocdoni/sdk'
import { mockUseElection, render } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Step1Base } from './Step1'

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

  it('renders the authenticate button', async () => {
    const election = {} as PublishedElection
    const { findByRole } = render(<Step1Base election={election} />)

    expect(await findByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })
})
