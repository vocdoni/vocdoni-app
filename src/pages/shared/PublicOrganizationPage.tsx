import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import ArchiveOrganizationView from '~components/Organization/Archive/View'
import PublicOrganizationView from '~elements/organization/PublicPage'
import PublicLayout from '~elements/PublicLayout'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import { AppProviders } from '~src/Providers'
import type { PublicOrganizationPageData } from '~src/ssr/public-pages'

export default function PublicOrganizationPage() {
  const data = useData<PublicOrganizationPageData>()
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
        {data.era === 'archive' ? (
          <ArchiveOrganizationView
            organization={data.legacyOrganization}
            initialElectionsPage={data.legacyElectionsPage}
          />
        ) : (
          <PublicOrganizationView organization={data.organization} initialElectionsPage={data.electionsPage} />
        )}
      </PublicLayout>
    </AppProviders>
  )
}
