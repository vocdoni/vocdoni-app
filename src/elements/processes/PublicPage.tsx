import { ElectionProvider, OrganizationProvider } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'
import type { OrganizationData } from '~src/ssr/public-pages'

type PublicProcessPageProps = {
  election: PublishedElection
  organization?: OrganizationData
}

const PublicProcessPage = ({ election, organization }: PublicProcessPageProps) => {
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
        <ProcessViewComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
