import { useData } from 'vike-react/useData'
import PublicOrganizationPage from '~elements/organization/PublicPage'
import PublicLayout from '~elements/PublicLayout'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
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
    <AppProviders language={data.meta.language}>
      <PublicLayout
        pathname={
          data.meta.language === 'en'
            ? `/organization/${data.organization.address}`
            : `/${data.meta.language}/organization/${data.organization.address}`
        }
        publicLanguageLinks={getPublicLanguageLinksFromMeta(data.meta)}
      >
        <PublicOrganizationPage organization={data.organization} initialElectionsPage={data.electionsPage} />
      </PublicLayout>
    </AppProviders>
  )
}
