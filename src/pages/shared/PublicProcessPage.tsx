import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicLayout from '~elements/PublicLayout'
import { VoterServerNow } from '~components/Process/voter/VoterFlowProvider'
import PublicProcessView from '~elements/processes/PublicPage'
import { AppProviders } from '~src/AppProviders'
import { headerLogoFromBrand } from '~src/pages/shared/headerOrganizationLogo'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import type { PublicProcessPageData } from '~src/ssr/public-pages'

export default function PublicProcessPage() {
  const data = useData<PublicProcessPageData>()
  const pageContext = usePageContext()
  const pathname = pageContext.urlPathname
  const publicLanguageLinks = getPublicLanguageLinksFromMeta(data.meta)

  usePreferredPublicLanguageRedirect({
    pathname,
  })

  return (
    <AppProviders language={data.meta.language} followSystem primaryColor={data.brand?.color}>
      {data.era === 'archive' ? (
        <PublicLayout
          pathname={pathname}
          publicLanguageLinks={publicLanguageLinks}
          enableChat={false}
          showDashboardButton={false}
          organizationLogo={headerLogoFromBrand(data.brand)}
        >
          <PublicProcessView
            id={data.id}
            legacyElection={data.legacyElection}
            legacyOrganization={data.legacyOrganization}
          />
        </PublicLayout>
      ) : (
        // The voter page brings its own shell (top bar, credit) and follows the system's colour mode itself; the
        // SaaS vote no longer uses PublicLayout. The server's clock reading travels with it, so the voter's first
        // render in the browser picks the screen the server's HTML shows.
        <VoterServerNow.Provider value={data.now}>
          <PublicProcessView
            id={data.id}
            election={data.election}
            organization={data.organization}
            brand={data.brand}
            publicLanguageLinks={publicLanguageLinks}
            fetchedAt={data.fetchedAt}
          />
        </VoterServerNow.Provider>
      )}
    </AppProviders>
  )
}
