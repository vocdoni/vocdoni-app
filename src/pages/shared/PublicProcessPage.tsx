import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { PublishedElection } from '@vocdoni/sdk'
import PublicProcessView from '~elements/processes/PublicPage'
import { AppProviders } from '~src/Providers'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type ProcessPageData = {
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

export default function PublicProcessPage() {
  const data = useData<ProcessPageData>()
  const pageContext = usePageContext()
  const pathname = pageContext.urlPathname

  usePreferredPublicLanguageRedirect({
    pathname,
  })

  return (
    <AppProviders language={data.meta.language}>
      <PublicProcessView
        election={data.election}
        organization={data.organization}
        pathname={pathname}
        publicLanguageLinks={getPublicLanguageLinksFromMeta(data.meta)}
      />
    </AppProviders>
  )
}
