import { OrganizationProvider } from '@vocdoni/react-components'
import type { ElectionsPageData } from '~src/ssr/public-pages'
import OrganizationViewComponent from '~components/Organization/View'
import { PrefetchedStaleTime } from '~constants'

type PublicOrganizationPageProps = {
  // Both the SSR OrganizationData and the v2 Organization satisfy this shape.
  organization: { address: string }
  initialElectionsPage?: ElectionsPageData
  /** When the server fetched `organization` (ms epoch). */
  fetchedAt?: number
}

const PublicOrganizationPage = ({ organization, initialElectionsPage, fetchedAt }: PublicOrganizationPageProps) => {
  return (
    // The SSR organization seeds the query, so the page renders at once. staleTime counts from the server fetch,
    // so HTML from the SSR cache older than that still refetches.
    <OrganizationProvider
      organization={organization}
      queryOptions={{ staleTime: PrefetchedStaleTime, initialDataUpdatedAt: fetchedAt }}
    >
      <OrganizationViewComponent initialElectionsPage={initialElectionsPage} />
    </OrganizationProvider>
  )
}

export default PublicOrganizationPage
