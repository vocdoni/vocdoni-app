import type { Organization, VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice, { StaticLegalNotice } from '~components/Layout/LegalNotice'
import ArchiveProcessView from '~components/Process/Archive/View'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import { PrefetchedStaleTime } from '~constants'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import type { LegacyElection, LegacyOrganization } from '~src/legacy/vochain-archive'

type PublicProcessSummaryViewProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  /** Prefetched organization, seeded into the provider so it does not refetch on mount. */
  organization?: Organization
  /** When the server fetched `election` and `organization` (ms epoch). */
  fetchedAt?: number
  /** Archive-era (64-hex vochain id) election: rendered read-only, no providers needed. */
  legacyElection?: LegacyElection
  legacyOrganization?: LegacyOrganization
}

const PublicProcessSummaryView = ({
  id,
  election,
  organization,
  fetchedAt,
  legacyElection,
  legacyOrganization,
}: PublicProcessSummaryViewProps) => {
  const localize = useLocalizedText()

  if (legacyElection) {
    // No OrganizationProvider in the archive era: feed the legal notice directly. No address
    // fallback — a hex address in that sentence reads as a bug, so it renders no notice instead.
    const orgName = localize(legacyOrganization?.account?.name)

    return (
      <>
        <ArchiveProcessView election={legacyElection} />
        <StaticLegalNotice orgName={orgName} />
      </>
    )
  }

  return (
    <OrganizationProvider
      organization={organization}
      queryOptions={{ staleTime: PrefetchedStaleTime, initialDataUpdatedAt: fetchedAt }}
    >
      <ElectionProvider
        id={id}
        election={election}
        queryOptions={{ refetchInterval: 30_000, staleTime: PrefetchedStaleTime, initialDataUpdatedAt: fetchedAt }}
        resultsQueryOptions={{ refetchInterval: 30_000 }}
      >
        <ProcessSummaryComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessSummaryView
