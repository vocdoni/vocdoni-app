import { useData } from 'vike-react/useData'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessPage from '~elements/processes/PublicPage'
import { AppProviders } from '~src/Providers'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'
import { PublishedElection } from '@vocdoni/sdk'

type ProcessPageData = {
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

export default function Page() {
  const data = useData<ProcessPageData>()

  return (
    <AppProviders>
      <PublicLayout pathname={`/processes/${data.election.id}`}>
        <PublicProcessPage election={data.election} organization={data.organization} />
      </PublicLayout>
    </AppProviders>
  )
}
