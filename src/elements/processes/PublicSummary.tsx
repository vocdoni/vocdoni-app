import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice from '~components/Layout/LegalNotice'
import ArchiveProcessView from '~components/Process/Archive/View'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import type { LegacyElection } from '~src/legacy/vochain-archive'

type PublicProcessSummaryViewProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  organizationAddress?: string
  /** Archive-era (64-hex vochain id) election: rendered read-only, no providers needed. */
  legacyElection?: LegacyElection
}

const PublicProcessSummaryView = ({
  id,
  election,
  organizationAddress,
  legacyElection,
}: PublicProcessSummaryViewProps) => {
  if (legacyElection) {
    return (
      <>
        <ArchiveProcessView election={legacyElection} />
        <LegalNotice />
      </>
    )
  }

  return (
    <OrganizationProvider id={organizationAddress}>
      <ElectionProvider
        id={id}
        election={election}
        queryOptions={{ refetchInterval: 30_000 }}
        resultsQueryOptions={{ refetchInterval: 30_000 }}
      >
        <ProcessSummaryComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessSummaryView
