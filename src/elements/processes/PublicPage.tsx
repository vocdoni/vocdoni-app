import { ElectionProvider, OrganizationProvider, useElection } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import LegalNotice from '~components/Layout/LegalNotice'
import PublicLayout from '~elements/PublicLayout'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'
import {
  getProcessAuthenticatedLabel,
  readProcessCspIdentifier,
  readProcessSpreadsheetIdentifier,
} from '~components/Process/authenticatedVoterLabel'
import type { OrganizationData } from '~src/ssr/public-pages'
import type { ReactNode } from 'react'

type PublicProcessPageProps = {
  election: PublishedElection
  organization?: OrganizationData
  pathname: string
  publicLanguageLinks?: Record<string, string>
}

const PublicProcessPageContent = ({
  children,
  pathname,
  publicLanguageLinks,
}: {
  children: ReactNode
  pathname: string
  publicLanguageLinks?: Record<string, string>
}) => {
  const { connected, election, voter } = useElection()
  const processElection = election as PublishedElection | undefined
  const authenticatedLabel = getProcessAuthenticatedLabel({
    connected,
    censusType: processElection?.census?.type,
    censusMetaType: processElection?.meta?.census?.type,
    spreadsheetIdentifier: readProcessSpreadsheetIdentifier(processElection?.id),
    voter,
    cspIdentifier: readProcessCspIdentifier(processElection?.id),
  })

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

const PublicProcessPage = ({ election, organization, pathname, publicLanguageLinks }: PublicProcessPageProps) => {
  const organizationProviderProps = organization
    ? { organization: organization as any }
    : { id: election.organizationId }

  return (
    <OrganizationProvider {...organizationProviderProps}>
      <ElectionProvider
        election={election}
        fetchCensus
        queryOptions={{
          refetchInterval: 15_000,
        }}
      >
        <PublicProcessPageContent pathname={pathname} publicLanguageLinks={publicLanguageLinks}>
          <ProcessViewComponent />
          <LegalNotice />
        </PublicProcessPageContent>
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
