import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider, ProcessProvider } from '@vocdoni/react-components'
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
    <OrganizationProvider address={organizationAddress}>
      {/* ProcessProvider holds the per-process CSP voter session (auth0/auth1/check/sign);
          the nested ElectionProvider reuses it for membership checks and voting. Same id →
          both resolve through a single react-query fetch, seeded with the prefetched
          election when the loader provided one. */}
      <ProcessProvider id={id}>
        <ElectionProvider id={id} election={election}>
          <ProcessViewComponent />
          <LegalNotice />
        </ElectionProvider>
      </ProcessProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
