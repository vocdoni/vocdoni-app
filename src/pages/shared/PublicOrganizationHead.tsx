import { useData } from 'vike-react/useData'
import PageMetaHead from '~src/pages/shared/PageMetaHead'
import { buildOrganizationStructuredData } from '~src/pages/shared/publicPageSchema'
import { legacyOrganizationToMetaSource, type PublicOrganizationPageData } from '~src/ssr/public-pages'

export default function PublicOrganizationHead() {
  const data = useData<PublicOrganizationPageData>()

  const structuredData =
    data.era === 'archive'
      ? buildOrganizationStructuredData({
          organization: legacyOrganizationToMetaSource(data.legacyOrganization)!,
          meta: data.meta,
        })
      : buildOrganizationStructuredData(data)

  return <PageMetaHead meta={data.meta} structuredData={structuredData} />
}
