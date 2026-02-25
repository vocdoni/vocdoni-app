import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ElectionProvider, OrganizationProvider, useOrganization } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import { useEffect } from 'react'
import { generatePath, useLoaderData, useNavigate } from 'react-router-dom'
import { ProcessView } from '~components/Process/Dashboard/ProcessView'
import { Routes } from '~src/router/routes'

const DashboardProcessViewElement = () => {
  const { organization } = useOrganization()
  const election = useLoaderData() as PublishedElection
  const navigate = useNavigate()

  // redirect to public view if not an owner (may need changes when org roles are in effect)
  useEffect(() => {
    if (!organization || !election) return
    if (organization.address !== election.organizationId) {
      return navigate(generatePath(Routes.processes.view, { id: election.id }))
    }
  }, [organization, election, navigate])

  return (
    <OrganizationProvider id={election.organizationId}>
      <ElectionProvider
        election={election}
        ConnectButton={ConnectButton}
        fetchCensus
        autoUpdate
        autoUpdateInterval={15000}
      >
        <ProcessView />
      </ElectionProvider>
    </OrganizationProvider>
  )
}

export default DashboardProcessViewElement
