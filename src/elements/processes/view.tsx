import { ElectionProvider, OrganizationProvider, useElection } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessView as ProcessViewComponent } from '~components/Process/View'
import { useDocumentTitle } from '~src/use-document-title'

const ProcessView = () => {
  const { election } = useElection()
  let title = ''
  if (election instanceof PublishedElection) {
    title = election?.title.default
  }
  useDocumentTitle(title)
  return <ProcessViewComponent />
}

const Process = () => {
  const election = useLoaderData() as PublishedElection

  return (
    <OrganizationProvider id={election.organizationId}>
      <ElectionProvider
        election={election}
        fetchCensus
        queryOptions={{
          refetchInterval: 15_000,
        }}
      >
        <ProcessView />
      </ElectionProvider>
      <LegalNotice />
    </OrganizationProvider>
  )
}

export default Process
