import { OrganizationProvider } from '@vocdoni/react-components'
import type { ElectionsPageData, OrganizationData } from '~src/ssr/public-pages'
import OrganizationViewComponent from '~components/Organization/View'

type PublicOrganizationPageProps = {
  organization: OrganizationData
  initialElectionsPage?: ElectionsPageData
}

const PublicOrganizationPage = ({ organization, initialElectionsPage }: PublicOrganizationPageProps) => {
  return (
    <OrganizationProvider organization={organization as any}>
      <OrganizationViewComponent initialElectionsPage={initialElectionsPage} />
    </OrganizationProvider>
  )
}

export default PublicOrganizationPage
