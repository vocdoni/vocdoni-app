import { PublishedElection } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import PublicProcessPage from './PublicPage'

const Process = () => {
  const election = useLoaderData() as PublishedElection

  return <PublicProcessPage election={election} />
}

export default Process
