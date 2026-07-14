import type { PaginatedElections } from '@vocdoni/api-types'
import { useLoaderData, useParams } from 'react-router-dom'
import Votings from '~components/Organization/Dashboard/Votings'
import { Routes } from '~routes'

const AllProcesses = () => {
  const data = useLoaderData() as PaginatedElections
  const { status } = useParams<{ status?: string }>()

  return <Votings path={Routes.dashboard.processes.all} data={data} status={status} />
}

export default AllProcesses
