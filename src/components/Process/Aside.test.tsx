import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusConnectButton } from './Aside'

// The packaged CspAuth is stubbed: its flow is tested upstream, here only the props CensusConnectButton passes are checked.
const cspAuth = vi.hoisted(() => ({ props: undefined as Record<string, any> | undefined }))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    CspAuth: (props: Record<string, any>) => {
      cspAuth.props = props
      return <div>CSP</div>
    },
  }
})

// The certificate flow is tested in CertAuth/: here only which identify flow Aside picks.
vi.mock('./CertAuth/CertAuth', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  CertAuthConnect: () => <div>CERT</div>,
}))

const election = { id: 'p1', census: { weighted: false }, questions: [] }

describe('CensusConnectButton', () => {
  it('renders the certificate flow, not the CSP one, for a certificate census', () => {
    const certElection = { ...election, census: { weighted: false, certAuth: true } }
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: certElection, status: 'ONGOING', connected: false }),
    })
    render(<CensusConnectButton />)

    expect(screen.getByText('CERT')).toBeInTheDocument()
    expect(screen.queryByText('CSP')).not.toBeInTheDocument()
  })

  it('renders the CSP flow, not the certificate one, for a census without certificates', () => {
    setReactProvidersMock({ useElection: () => mockUseElection({ election, status: 'ONGOING', connected: false }) })
    render(<CensusConnectButton />)

    expect(screen.getByText('CSP')).toBeInTheDocument()
    expect(screen.queryByText('CERT')).not.toBeInTheDocument()
  })

  it('makes the voter accept the terms and link them to the terms and privacy policy', () => {
    setReactProvidersMock({ useElection: () => mockUseElection({ election, status: 'ONGOING', connected: false }) })
    const appEnv = { TERMS_OF_SERVICE_URL: 'https://terms.example', PRIVACY_POLICY_URL: 'https://privacy.example' }
    render(<CensusConnectButton />, { appEnv })

    expect(cspAuth.props?.requireTerms).toBe(true)
    // the terms read the URLs where they render (VoterTerms), as they do inside CspAuth's form
    render(<>{cspAuth.props?.terms}</>, { appEnv })
    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', 'https://terms.example')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', 'https://privacy.example')
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
