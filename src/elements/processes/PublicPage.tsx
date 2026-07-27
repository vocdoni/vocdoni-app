import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'

type PublicProcessPageProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  organizationAddress?: string
}

const PublicProcessPage = ({ id, election, organizationAddress }: PublicProcessPageProps) => {
  return (
    <OrganizationProvider id={organizationAddress}>
      {/* The ElectionProvider hosts the election data, results and the voter's
          CSP auth session; poll both reads so an open tab tracks status changes
          and live tallies. */}
      <ElectionProvider
        id={id}
        election={election}
        queryOptions={{ refetchInterval: 30_000 }}
        resultsQueryOptions={{ refetchInterval: 30_000 }}
      >
        <ProcessViewComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
