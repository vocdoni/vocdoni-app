import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import type { OrganizationData } from '~src/ssr/public-pages'

type PublicProcessSummaryViewProps = {
  id: string
  election: PublishedElection
  organization?: OrganizationData
}

const PublicProcessSummaryView = ({ id, election, organization }: PublicProcessSummaryViewProps) => {
  const organizationProviderProps = organization
    ? { organization: organization as any }
    : { id: election.organizationId }

  return (
    <OrganizationProvider {...organizationProviderProps}>
      <ElectionProvider
        election={election}
        // The election comes from Vike SSR serialization, which drops the SDK's
        // `id` getter (only `_id` survives), so `election.id` is undefined here.
        // Use the route-param id so the provider query is enabled and refetches.
        id={id}
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
