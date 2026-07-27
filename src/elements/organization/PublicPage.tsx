import { OrganizationProvider } from '@vocdoni/react-components'
import type { ElectionsPageData } from '~src/ssr/public-pages'
import OrganizationViewComponent from '~components/Organization/View'

type PublicOrganizationPageProps = {
  // Both the SSR OrganizationData and the v2 Organization satisfy this shape;
  // the v2 OrganizationProvider fetches the full organization by address.
  organization: { address: string }
  initialElectionsPage?: ElectionsPageData
}

const PublicOrganizationPage = ({ organization, initialElectionsPage }: PublicOrganizationPageProps) => {
  return (
    <OrganizationProvider address={organization.address}>
      <OrganizationViewComponent initialElectionsPage={initialElectionsPage} />
    </OrganizationProvider>
  )
}

export default PublicOrganizationPage
