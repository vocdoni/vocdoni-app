import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useLoaderData } from 'react-router-dom'
import type { LegacyElection, LegacyOrganization } from '~src/legacy/vochain-archive'
import { ensureAddressPrefix } from '~utils/address'
import PublicProcessPage from './PublicPage'

type ProcessRouteData =
  | { era: 'saas'; election: VotingProcessResponse }
  | { era: 'archive'; legacyElection: LegacyElection; legacyOrganization?: LegacyOrganization }

const Process = () => {
  const data = useLoaderData() as ProcessRouteData

  if (data.era === 'archive') {
    return (
      <PublicProcessPage
        id={data.legacyElection.id}
        legacyElection={data.legacyElection}
        legacyOrganization={data.legacyOrganization}
      />
    )
  }

  const { election } = data

  // The process read returns orgAddress unprefixed; the organization endpoints
  // expect the 0x-prefixed form.
  return (
    <PublicProcessPage
      id={election.id}
      election={election}
      organizationAddress={election.orgAddress ? ensureAddressPrefix(election.orgAddress) : undefined}
    />
  )
}

export default Process
