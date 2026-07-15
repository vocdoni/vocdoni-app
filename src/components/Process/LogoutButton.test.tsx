import { CensusType } from '@vocdoni/sdk'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import LogoutButton from './LogoutButton'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: {
            census: { type: CensusType.CSP },
            meta: {},
          },
          connected: true,
          clearClient: vi.fn(),
        }),
    })
  })

  it('renders logout button when connected', () => {
    render(<LogoutButton />)
    expect(screen.getByText('logout')).toBeInTheDocument()
  })
})
