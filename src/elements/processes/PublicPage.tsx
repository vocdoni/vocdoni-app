import type { Organization, VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import LegalNotice, { StaticLegalNotice } from '~components/Layout/LegalNotice'
import ArchiveProcessView from '~components/Process/Archive/View'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'
import { PrefetchedStaleTime } from '~constants'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import type { LegacyElection, LegacyOrganization } from '~src/legacy/vochain-archive'

type PublicProcessPageProps = {
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

const PublicProcessPage = ({
  id,
  election,
  organization,
  fetchedAt,
  legacyElection,
  legacyOrganization,
}: PublicProcessPageProps) => {
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
      {/* The ElectionProvider hosts the election data, results and the voter's
          CSP auth session; poll both reads so an open tab tracks status changes
          and live tallies. */}
      <ElectionProvider
        id={id}
        election={election}
        queryOptions={{ refetchInterval: 30_000, staleTime: PrefetchedStaleTime, initialDataUpdatedAt: fetchedAt }}
        resultsQueryOptions={{ refetchInterval: 30_000 }}
      >
        <ProcessViewComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
