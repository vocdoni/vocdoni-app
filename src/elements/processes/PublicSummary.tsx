import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'

type PublicProcessSummaryViewProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  organizationAddress?: string
}

const PublicProcessSummaryView = ({ id, election, organizationAddress }: PublicProcessSummaryViewProps) => {
  return (
    <OrganizationProvider address={organizationAddress}>
      <ElectionProvider id={id} election={election}>
        <ProcessSummaryComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessSummaryView
