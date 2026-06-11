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
      <ElectionProvider
        election={election}
        id={election.id}
        fetchCensus
        queryOptions={{
          refetchInterval: 15_000,
        }}
      >
        <ProcessView />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default DashboardProcessViewElement
