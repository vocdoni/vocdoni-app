import { ElectionProvider, OrganizationProvider, useElection } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import { useLoaderData } from 'react-router-dom'
import LegalNotice from '~components/Layout/LegalNotice'
import { ProcessSummary as ProcessSummaryComponent } from '~components/Process/Summary'
import { useDocumentTitle } from '~src/use-document-title'

const Summary = () => {
  const { election } = useElection()
  let title = ''
  if (election instanceof PublishedElection) {
    title = election?.title.default
  }
  useDocumentTitle(title)
  return <ProcessSummaryComponent />
}

const ProcessSummary = () => {
  const election = useLoaderData() as PublishedElection

  return (
    <OrganizationProvider id={election.organizationId}>
      <ElectionProvider
        id={election.id}
        election={election}
        queryOptions={{
          refetchInterval: 30_000,
        }}
      >
        <Summary />
      </ElectionProvider>
      <LegalNotice />
    </OrganizationProvider>
  )
}

export default ProcessSummary
