import { useData } from 'vike-react/useData'
import PageMetaHead from '~src/pages/shared/PageMetaHead'
import { buildProcessStructuredData } from '~src/pages/shared/publicPageSchema'
import { legacyOrganizationToMetaSource, type PublicProcessPageData } from '~src/ssr/public-pages'

export default function PublicProcessHead() {
  const data = useData<PublicProcessPageData>()

  const structuredData =
    data.era === 'archive'
      ? buildProcessStructuredData({
          election: data.legacyElection,
          organization: legacyOrganizationToMetaSource(data.legacyOrganization),
          meta: data.meta,
        })
      : buildProcessStructuredData(data)

  return <PageMetaHead meta={data.meta} structuredData={structuredData} />
}
