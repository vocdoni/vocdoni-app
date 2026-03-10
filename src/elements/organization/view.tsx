import { OrganizationProvider, useOrganization } from '@vocdoni/react-components'
import { AccountData } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import OrganizationViewComponent from '~components/Organization/View'
import { useDocumentTitle } from '~src/use-document-title'

const OrganizationView = () => {
  const { organization } = useOrganization()
  const orgTitle = organization?.account.name.default ?? organization?.address
  useDocumentTitle(orgTitle)
  return <OrganizationViewComponent />
}

const Organization = () => {
  const organization = useLoaderData() as AccountData

  return (
    <OrganizationProvider organization={organization}>
      <OrganizationView />
    </OrganizationProvider>
  )
}

export default Organization
