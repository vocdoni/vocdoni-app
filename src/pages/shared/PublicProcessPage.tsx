import { PublishedElection } from '@vocdoni/sdk'
import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import PublicLayout from '~elements/PublicLayout'
import PublicProcessView from '~elements/processes/PublicPage'
import {
  getProcessAuthenticatedLabel,
  processAuthenticatedLabelChangeEvent,
  readProcessCspIdentifier,
  readProcessSpreadsheetIdentifier,
} from '~components/Process/authenticatedVoterLabel'
import { AppProviders } from '~src/Providers'
import { getPublicLanguageLinksFromMeta } from '~src/pages/shared/publicPageData'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'
import type { OrganizationData, PublicMeta } from '~src/ssr/public-pages'

type ProcessPageData = {
  id: string
  election: PublishedElection
  organization: OrganizationData
  meta: PublicMeta
}

let authenticatedLabelCacheKey: string | undefined
let authenticatedLabelCacheValue: ReturnType<typeof getProcessAuthenticatedLabel> | undefined

const getAuthenticatedLabelSnapshot = (election: PublishedElection) => {
  const cspIdentifier = readProcessCspIdentifier(election.id)
  const spreadsheetIdentifier = readProcessSpreadsheetIdentifier(election.id)
  const nextKey = JSON.stringify([
    election.id,
    election.census?.type,
    election.meta?.census?.type,
    cspIdentifier,
    spreadsheetIdentifier,
  ])

  if (authenticatedLabelCacheKey === nextKey) {
    return authenticatedLabelCacheValue
  }

  authenticatedLabelCacheKey = nextKey
  authenticatedLabelCacheValue = getProcessAuthenticatedLabel({
    connected: Boolean(cspIdentifier || spreadsheetIdentifier),
    censusType: election.census?.type,
    censusMetaType: election.meta?.census?.type,
    spreadsheetIdentifier,
    cspIdentifier,
  })

  return authenticatedLabelCacheValue
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
      <PublicProcessLayout
        election={data.election}
        pathname={pathname}
        publicLanguageLinks={getPublicLanguageLinksFromMeta(data.meta)}
      >
        <PublicProcessView election={data.election} organization={data.organization} />
      </PublicProcessLayout>
    </AppProviders>
  )
}

const PublicProcessLayout = ({
  election,
  pathname,
  publicLanguageLinks,
  children,
}: {
  election: PublishedElection
  pathname: string
  publicLanguageLinks?: Record<string, string>
  children: ReactNode
}) => {
  const authenticatedLabel = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(processAuthenticatedLabelChangeEvent, onStoreChange)
      window.addEventListener('storage', onStoreChange)

      return () => {
        window.removeEventListener(processAuthenticatedLabelChangeEvent, onStoreChange)
        window.removeEventListener('storage', onStoreChange)
      }
    },
    () => getAuthenticatedLabelSnapshot(election),
    () => undefined
  )

  return (
    <PublicLayout
      pathname={pathname}
      publicLanguageLinks={publicLanguageLinks}
      hideAuthButton
      enableChat={false}
      authenticatedLabel={authenticatedLabel}
    >
      {children}
    </PublicLayout>
  )
}
