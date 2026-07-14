import { ElectionProvider, OrganizationProvider, useOrganization } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import { useEffect } from 'react'
import { generatePath, useLoaderData, useNavigate } from 'react-router-dom'
import { ProcessView } from '~components/Process/Dashboard/ProcessView'
import { Routes } from '~src/router/routes'

const DashboardProcessViewElement = () => {
  const { organization } = useOrganization()
  const election = useLoaderData() as PublishedElection
  const navigate = useNavigate()

  // Redirect to processes list when current organization does not own this process
  useEffect(() => {
    if (!organization || !election) return
    if (organization.address !== election.organizationId) {
      return navigate(generatePath(Routes.dashboard.processes.all, { page: 1 }), { replace: true })
    }
  }, [organization, election, navigate])

  return (
    <OrganizationProvider id={election.organizationId}>
      {/*
        The election is pre-fetched from the SAAS API by the route loader and adapted to a
        PublishedElection. Freeze the provider's own query (staleTime Infinity + no polling) so it
        serves that adapted data and never re-fetches through the legacy Vochain client, which would
        both hit the chain and clobber the adapter's synthesized status/results.
      */}
      <ElectionProvider
        election={election}
        id={election.id}
        fetchCensus
        queryOptions={{
          staleTime: Infinity,
          refetchInterval: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
        }}
      >
        <ProcessView />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default DashboardProcessViewElement
