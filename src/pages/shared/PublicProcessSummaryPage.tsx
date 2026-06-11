import { PublishedElection } from '@vocdoni/sdk'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessSummaryView from '~elements/processes/PublicSummary'
import { AppProviders } from '~src/Providers'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type ProcessPageData = {
  id: string
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

export default function PublicProcessSummaryPage() {
  const data = useData<ProcessPageData>()
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
        <PublicProcessSummaryView id={data.id} election={data.election} organization={data.organization} />
      </PublicLayout>
    </AppProviders>
  )
}
