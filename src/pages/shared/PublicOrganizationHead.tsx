import { useData } from 'vike-react/useData'
import PageMetaHead from '~src/pages/shared/PageMetaHead'
import { buildOrganizationStructuredData } from '~src/pages/shared/publicPageSchema'
import type { ElectionsPageData, OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type OrganizationPageData = {
  address: string
  organization: OrganizationData
  electionsPage: ElectionsPageData
  meta: PublicMeta
}

export default function PublicOrganizationHead() {
  const data = useData<OrganizationPageData>()

  return <PageMetaHead meta={data.meta} structuredData={buildOrganizationStructuredData(data)} />
}
