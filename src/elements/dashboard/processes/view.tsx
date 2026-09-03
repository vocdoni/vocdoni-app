import { ElectionProvider, useOrganization } from '@vocdoni/react-components'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useEffect } from 'react'
import { generatePath, useLoaderData, useNavigate } from 'react-router'
import { ProcessView } from '~components/Process/Dashboard/ProcessView'
import { Routes } from '~src/router/routes'
import { sameAddress } from '~utils/address'

const DashboardProcessViewElement = () => {
  const { organization } = useOrganization()
  const election = useLoaderData() as VotingProcessResponse
  const navigate = useNavigate()

  // Redirect to processes list when current organization does not own this process
  useEffect(() => {
    if (!organization || !election) return
    if (!sameAddress(organization.address, election.orgAddress)) {
      navigate(generatePath(Routes.dashboard.processes.all, { page: '1' }), { replace: true })
    }
  }, [organization, election, navigate])

  // The route loader pre-seeds the ['election', id] query, so the provider renders
  // straight from cache instead of re-fetching the process.
  return (
    <ElectionProvider id={election.id}>
      <ProcessView />
    </ElectionProvider>
  )
}

export default DashboardProcessViewElement
