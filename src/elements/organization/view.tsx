import type { Organization } from '@vocdoni/api-types'
import { useLoaderData } from 'react-router-dom'
import PublicOrganizationPage from './PublicPage'

const OrganizationView = () => {
  const organization = useLoaderData() as Organization

  return <PublicOrganizationPage organization={organization} />
}

export default OrganizationView
