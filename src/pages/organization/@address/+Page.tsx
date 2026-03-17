import { useData } from 'vike-react/useData'
import PublicOrganizationPage from '~elements/organization/PublicPage'
import PublicLayout from '~elements/PublicLayout'
import { AppProviders } from '~src/Providers'
import type { ElectionsPageData, OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type OrganizationPageData = {
  organization: OrganizationData
  electionsPage: ElectionsPageData
  meta: PublicMeta
}

export default function Page() {
  const data = useData<OrganizationPageData>()

  return (
    <AppProviders>
      <PublicLayout pathname={`/organization/${data.organization.address}`}>
        <PublicOrganizationPage organization={data.organization} initialElectionsPage={data.electionsPage} />
      </PublicLayout>
    </AppProviders>
  )
}
