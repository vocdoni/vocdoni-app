import { OrganizationProvider } from '@vocdoni/react-components'
import type { ElectionsPageData } from '~src/ssr/public-pages'
import OrganizationViewComponent from '~components/Organization/View'

type PublicOrganizationPageProps = {
  // Both the SSR OrganizationData and the v2 Organization satisfy this shape.
  organization: { address: string }
  initialElectionsPage?: ElectionsPageData
  /** When the server fetched `organization` (ms epoch). */
  fetchedAt?: number
}

const PublicOrganizationPage = ({ organization, initialElectionsPage, fetchedAt }: PublicOrganizationPageProps) => {
  return (
    // The loader/SSR-provided organization seeds the provider's query as
    // initialData (id derived from organization.address), so the page renders
    // instantly; staleTime counted from the server fetch keeps hydration from refetching it, unless
    // the HTML came from the SSR cache and is older than that.
    <OrganizationProvider
      organization={organization}
      queryOptions={{ staleTime: 30_000, initialDataUpdatedAt: fetchedAt }}
    >
      <OrganizationViewComponent initialElectionsPage={initialElectionsPage} />
    </OrganizationProvider>
  )
}

export default PublicOrganizationPage
