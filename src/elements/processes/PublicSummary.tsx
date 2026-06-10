import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import type { OrganizationData } from '~src/ssr/public-pages'

type PublicProcessSummaryViewProps = {
  election: PublishedElection
  organization?: OrganizationData
}

const PublicProcessSummaryView = ({ election, organization }: PublicProcessSummaryViewProps) => {
  const organizationProviderProps = organization
    ? { organization: organization as any }
    : { id: election.organizationId }

  return (
    <OrganizationProvider {...organizationProviderProps}>
      <ElectionProvider
        election={election}
        queryOptions={{
          refetchInterval: 30_000,
        }}
      >
        <ProcessSummaryComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessSummaryView
