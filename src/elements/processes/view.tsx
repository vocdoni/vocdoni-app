import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useLoaderData } from 'react-router-dom'
import { ensureAddressPrefix } from '~utils/address'
import PublicProcessPage from './PublicPage'

const Process = () => {
  const election = useLoaderData() as VotingProcessResponse

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
