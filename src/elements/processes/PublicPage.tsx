import type { Organization, VotingProcessResponse } from '@vocdoni/api-types'
import { OrganizationProvider } from '@vocdoni/react-components'
import { StaticLegalNotice } from '~components/Layout/LegalNotice'
import ArchiveProcessView from '~components/Process/Archive/View'
import { VoterPage } from '~components/Process/voter/VoterPage'
import { PrefetchedStaleTime } from '~constants'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import type { LegacyElection, LegacyOrganization } from '~src/legacy/vochain-archive'
import type { ProcessBrand } from '~utils/process-brand'

type PublicProcessPageProps = {
  id: string
  /** Prefetched process (SSR/route loader) — rendered immediately, still refetchable. */
  election?: VotingProcessResponse
  /** Prefetched organization, seeded into the provider so it does not refetch on mount. */
  organization?: Organization
  /** How the vote is branded (resolved on the server): the voter page's top bar. */
  brand?: ProcessBrand
  /** The page's URL in each language, for the voter's language tag. */
  publicLanguageLinks?: Record<string, string>
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
  brand,
  publicLanguageLinks,
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
      {/* The voter page (spec D4): its own shell, the SDK's ElectionProvider and the live reads. */}
      <VoterPage
        id={id}
        election={election}
        fetchedAt={fetchedAt}
        brand={brand ?? { branded: false, name: localize(organization?.name) ?? '' }}
        publicLanguageLinks={publicLanguageLinks}
      />
    </OrganizationProvider>
  )
}

export default PublicProcessPage
