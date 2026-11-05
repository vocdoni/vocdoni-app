import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { isCertificateCensus } from '~queries/certificateAuth/census'
import { certificateAuthMode } from '~queries/certificateAuth/mode'
import { CERT_RETURN_CSS, CERT_RETURN_SCRIPT } from '~queries/certificateAuth/returnScript'
import { resolveAppEnv } from '~src/app-env'
import PageMetaHead from '~src/pages/shared/PageMetaHead'
import { buildProcessStructuredData } from '~src/pages/shared/publicPageSchema'
import { legacyOrganizationToMetaSource, type PublicProcessPageData } from '~src/ssr/public-pages'

export default function PublicProcessHead() {
  const data = useData<PublicProcessPageData>()
  const { globalContext } = usePageContext()
  const certificateReturn = isCertificateCensus(
    data.era === 'archive' ? undefined : data.election?.census,
    certificateAuthMode(resolveAppEnv(globalContext?.appEnv))
  )

  const structuredData =
    data.era === 'archive'
      ? buildProcessStructuredData({
          election: data.legacyElection,
          organization: legacyOrganizationToMetaSource(data.legacyOrganization),
          meta: data.meta,
        })
      : buildProcessStructuredData(data)

  return (
    <>
      <PageMetaHead meta={data.meta} structuredData={structuredData} />
      {certificateReturn ? (
        <>
          {/* Before any app code: moves a certificate return (#code) out of the URL; see returnScript.ts. */}
          <script dangerouslySetInnerHTML={{ __html: CERT_RETURN_SCRIPT }} />
          <style dangerouslySetInnerHTML={{ __html: CERT_RETURN_CSS }} />
        </>
      ) : null}
    </>
  )
}
