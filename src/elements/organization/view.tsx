import { AccountData } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import PublicOrganizationPage from './PublicPage'

const Organization = () => {
  const organization = useLoaderData() as AccountData

  return <PublicOrganizationPage organization={organization as any} />
}

export default Organization
