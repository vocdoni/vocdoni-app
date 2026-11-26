import { CspAuth, useElection } from '@vocdoni/react-components'
import { CertAuthConnect, VoterTerms } from './CertAuth/CertAuth'

/**
 * The identify button of a vote that is not canceled, for the shared-census home (Home/SharedCensus). The public
 * voting page has its own identify screen (components/Process/voter).
 */
export const CensusConnectButton = () => {
  const { election, status, connected } = useElection()

  if (!election || status === 'CANCELED' || connected) {
    return null
  }

  // A certificate census is not handled by the packaged CspAuth: the app sends those voters
  // through the certificate gateway (CertAuth/), with the same terms to accept first.
  if (election.census?.certAuth) return <CertAuthConnect />

  // Every v2 census is member/CSP-backed (see CensusSpec's doc comment in
  // @vocdoni/api-types), so identifying against the process CSP (auth0/auth1)
  // is the only way into a voting session. Voters must accept the terms first.
  return <CspAuth requireTerms terms={<VoterTerms />} />
}
