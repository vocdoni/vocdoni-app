import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'
import type { OrganizationData } from '~src/ssr/public-pages'

type PublicProcessPageProps = {
  id: string
  election: PublishedElection
  organization?: OrganizationData
}

const PublicProcessPage = ({ id, election, organization }: PublicProcessPageProps) => {
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
        fetchCensus
        queryOptions={{
          refetchInterval: 30_000,
        }}
      >
        <ProcessViewComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
