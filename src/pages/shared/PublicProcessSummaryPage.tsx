import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessSummaryView from '~elements/processes/PublicSummary'
import { AppProviders } from '~src/Providers'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import type { PublicProcessPageData } from '~src/ssr/public-pages'

export default function PublicProcessSummaryPage() {
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
          <PublicProcessSummaryView
            id={data.id}
            legacyElection={data.legacyElection}
            legacyOrganization={data.legacyOrganization}
          />
        ) : (
          <PublicProcessSummaryView
            id={data.id}
            election={data.election}
            organizationAddress={data.organization?.address}
          />
        )}
      </PublicLayout>
    </AppProviders>
  )
}
