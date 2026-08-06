import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice from '~components/Layout/LegalNotice'
import ArchiveProcessView from '~components/Process/Archive/View'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import type { LegacyElection, LegacyOrganization } from '~src/legacy/vochain-archive'

type PublicProcessSummaryViewProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  organizationAddress?: string
  /** Archive-era (64-hex vochain id) election: rendered read-only, no providers needed. */
  legacyElection?: LegacyElection
  legacyOrganization?: LegacyOrganization
}

const PublicProcessSummaryView = ({
  id,
  election,
  organizationAddress,
  legacyElection,
  legacyOrganization,
}: PublicProcessSummaryViewProps) => {
  const localize = useLocalizedText()

  if (legacyElection) {
    // No OrganizationProvider in the archive era: feed the legal notice directly.
    const orgName =
      localize(legacyOrganization?.account?.name) || legacyOrganization?.address || legacyElection.organizationId

    return (
      <>
        <ArchiveProcessView election={legacyElection} />
        <LegalNotice orgName={orgName} />
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
