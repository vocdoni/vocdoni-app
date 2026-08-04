import type { Organization } from '@vocdoni/api-types'
import { useLoaderData } from 'react-router-dom'
import ArchiveOrganizationView from '~components/Organization/Archive/View'
import type { LegacyElectionsPage, LegacyOrganization } from '~src/legacy/vochain-archive'
import PublicOrganizationPage from './PublicPage'

type OrganizationRouteData =
  | { era: 'saas'; organization: Organization }
  | { era: 'archive'; legacyOrganization: LegacyOrganization; legacyElectionsPage: LegacyElectionsPage }

const OrganizationView = () => {
  const data = useLoaderData() as OrganizationRouteData

  if (data.era === 'archive') {
    return (
      <ArchiveOrganizationView organization={data.legacyOrganization} initialElectionsPage={data.legacyElectionsPage} />
    )
  }

  return <PublicOrganizationPage organization={data.organization} />
}

export default OrganizationView
