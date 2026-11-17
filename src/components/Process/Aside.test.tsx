import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusConnectButton } from './Aside'

vi.mock('./CSP/CSPAuthModal', () => ({
  CspAuth: () => <div>CSP</div>,
}))

const election = { id: 'p1', census: { weighted: false }, questions: [] }

describe('CensusConnectButton', () => {
  it('offers the identify flow to a visitor of an open vote', () => {
    setReactProvidersMock({ useElection: () => mockUseElection({ election, status: 'ONGOING', connected: false }) })
    render(<CensusConnectButton />)
    expect(screen.getByText('CSP')).toBeInTheDocument()
  })

  it('renders nothing once connected, or on a canceled vote', () => {
    setReactProvidersMock({ useElection: () => mockUseElection({ election, status: 'ONGOING', connected: true }) })
    const { unmount } = render(<CensusConnectButton />)
    expect(screen.queryByText('CSP')).toBeNull()
    unmount()
    setReactProvidersMock({ useElection: () => mockUseElection({ election, status: 'CANCELED', connected: false }) })
    render(<CensusConnectButton />)
    expect(screen.queryByText('CSP')).toBeNull()
  })
})
