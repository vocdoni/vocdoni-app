import { PublishedElection } from '@vocdoni/sdk'
import { useLoaderData, useLocation } from 'react-router-dom'
import PublicProcessPage from './PublicPage'

const Process = () => {
  const election = useLoaderData() as PublishedElection
  const { pathname } = useLocation()

  return <PublicProcessPage election={election} pathname={pathname} />
}

export default Process
