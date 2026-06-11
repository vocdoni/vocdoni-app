import { PublishedElection } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import PublicProcessPage from './PublicPage'

const Process = () => {
  const election = useLoaderData() as PublishedElection

  // From a react-router loader the election is a live PublishedElection instance,
  // so its `id` getter works here (unlike the Vike SSR-serialized path).
  return <PublicProcessPage id={election.id} election={election} />
}

export default Process
