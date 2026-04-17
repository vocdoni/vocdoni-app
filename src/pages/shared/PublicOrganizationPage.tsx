import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicOrganizationView from '~elements/organization/PublicPage'
import PublicLayout from '~elements/PublicLayout'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import { AppProviders } from '~src/Providers'
import { type ElectionsPageData, type OrganizationData, type PublicMeta } from '~src/ssr/public-pages'

type OrganizationPageData = {
  address: string
  organization: OrganizationData
  electionsPage: ElectionsPageData
  meta: PublicMeta
}

export default function PublicOrganizationPage() {
  const data = useData<OrganizationPageData>()
  const pageContext = usePageContext()
  const pathname = pageContext.urlPathname

  usePreferredPublicLanguageRedirect({
    pathname,
  })

  return (
    <AppProviders language={data.meta.language}>
      <PublicLayout
        pathname={pathname}
        publicLanguageLinks={getPublicLanguageLinksFromMeta(data.meta)}
        enableChat={false}
      >
        <PublicOrganizationView organization={data.organization} initialElectionsPage={data.electionsPage} />
      </PublicLayout>
    </AppProviders>
  )
}
