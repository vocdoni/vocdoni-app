import { OrganizationProvider } from '@vocdoni/react-components'
import type { ElectionsPageData } from '~src/ssr/public-pages'
import OrganizationViewComponent from '~components/Organization/View'

type PublicOrganizationPageProps = {
  // Both the SSR OrganizationData and the v2 Organization satisfy this shape.
  organization: { address: string }
  initialElectionsPage?: ElectionsPageData
}

const PublicOrganizationPage = ({ organization, initialElectionsPage }: PublicOrganizationPageProps) => {
  return (
    // The loader/SSR-provided organization seeds the provider's query as
    // initialData (id derived from organization.address), so the page renders
    // instantly and the provider still refetches.
    <OrganizationProvider organization={organization}>
      <OrganizationViewComponent initialElectionsPage={initialElectionsPage} />
    </OrganizationProvider>
  )
}

export default PublicOrganizationPage
