import { PublishedElection } from '@vocdoni/sdk'
import { useData } from 'vike-react/useData'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessPage from '~elements/processes/PublicPage'
import { AppProviders } from '~src/Providers'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type ProcessPageData = {
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

export default function Page() {
  const data = useData<ProcessPageData>()

  return (
    <AppProviders language={data.meta.language}>
      <PublicLayout
        pathname={
          data.meta.language === 'en'
            ? `/processes/${data.election.id}`
            : `/${data.meta.language}/processes/${data.election.id}`
        }
        publicLanguageLinks={getPublicLanguageLinksFromMeta(data.meta)}
      >
        <PublicProcessPage election={data.election} organization={data.organization} />
      </PublicLayout>
    </AppProviders>
  )
}
