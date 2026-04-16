import { PublishedElection } from '@vocdoni/sdk'
import { useData } from 'vike-react/useData'
import PageMetaHead from '~src/pages/shared/PageMetaHead'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type ProcessPageData = {
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

export default function PublicProcessHead() {
  const data = useData<ProcessPageData>()

  return <PageMetaHead meta={data.meta} />
}
