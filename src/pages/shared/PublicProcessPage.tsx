import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessView from '~elements/processes/PublicPage'
import { AppProviders } from '~src/Providers'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import type { PublicProcessPageData } from '~src/ssr/public-pages'

export default function PublicProcessPage() {
  const data = useData<PublicProcessPageData>()
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
        showDashboardButton={false}
      >
        {data.era === 'archive' ? (
          <PublicProcessView id={data.id} legacyElection={data.legacyElection} />
        ) : (
          <PublicProcessView id={data.id} election={data.election} organizationAddress={data.organization?.address} />
        )}
      </PublicLayout>
    </AppProviders>
  )
}
