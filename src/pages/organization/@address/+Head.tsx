import { useData } from 'vike-react/useData'
import type { ElectionsPageData, OrganizationData, PublicMeta } from '~src/ssr/public-pages'
import PageMetaHead from '~src/pages/shared/PageMetaHead'

type OrganizationPageData = {
  organization: OrganizationData
  electionsPage: ElectionsPageData
  meta: PublicMeta
}

export default function Head() {
  const data = useData<OrganizationPageData>()

  return <PageMetaHead meta={data.meta} />
}
