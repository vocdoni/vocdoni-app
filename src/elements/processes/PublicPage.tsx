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
  // The v2 OrganizationProvider only takes { children, address } and fetches the
  // organization itself — it no longer accepts a pre-fetched `organization` object
  // (that was the legacy provider's prop), so fall back to the legacy SSR election's
  // organizationId only when SSR didn't already resolve the organization.
  const organizationAddress = organization?.address ?? election.organizationId

  return (
    <OrganizationProvider address={organizationAddress}>
      {/*
        The v2 ElectionProvider only takes { children, id } and fetches the process
        itself via `client.elections.get(id)`, keyed off the SaaS Mongo ObjectID — it
        no longer accepts a pre-fetched `election`, `fetchCensus`, or `queryOptions`
        (those were legacy @vocdoni/sdk provider props that don't exist on the v2 API).
        `id` here is the route param this page was given (see +data.ts). Newly-generated
        voting links already carry the v2 process id (the dashboard builds them from
        the v2 `election.id`), so this resolves correctly for those. Older links minted
        before the v2 migration (or any other 64-hex vochain id reaching this route)
        will still 404 against the SaaS API: this page's own SSR data loader
        (`loadProcessPageData` in ~src/ssr/public-pages.ts) still fetches via the legacy
        vochain-oriented @vocdoni/sdk client, which can't be swapped for the v2 SaaS
        client without a wider SSR/data-loading migration — see the fix summary.
      */}
      <ElectionProvider id={id}>
        <ProcessViewComponent />
        <LegalNotice />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default PublicProcessPage
