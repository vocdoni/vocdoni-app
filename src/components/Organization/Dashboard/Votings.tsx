import { Flex } from '@chakra-ui/react'
import { RoutedPaginationProvider, useOrganization } from '@vocdoni/react-providers'
import { ElectionListWithPagination } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { ListStateAlert } from '~components/shared/Feedback/ListStateAlert'
import { NoResultsFiltering } from '~shared/Layout/NoResultsFiltering'
import ProcessesTable from '../../Process/Dashboard/ProcessesTable'
import NoElections from '../NoElections'

type VotingsListProps = {
  data: ElectionListWithPagination
  status?: string
}

type VotingsProps = {
  path: string
} & VotingsListProps

const Votings = ({ path, data, status }: VotingsProps) => {
  const { organization } = useOrganization()

  if (!organization) return null

  return (
    <RoutedPaginationProvider path={path} pagination={data.pagination}>
      <VotingsList data={data} status={status} />
    </RoutedPaginationProvider>
  )
}

const VotingsList = ({ data, status }: VotingsListProps) => {
  if (!data) return null

  const { t } = useTranslation()
  const { elections } = data
  const showAlert = !elections?.length
  const alertTitle = status
    ? t('processes.no_results', { defaultValue: 'No results for this filter' })
    : t('processes.empty', { defaultValue: 'No voting processes found' })
  const alertDescription = status
    ? t('processes.no_results_description', { defaultValue: 'Try adjusting your filters.' })
    : t('processes.empty_description', { defaultValue: 'Create a voting process to get started.' })

  return (
    <Flex flexDirection='column' flexGrow={1} gap={5} height='full'>
      {showAlert && <ListStateAlert show status='info' title={alertTitle} description={alertDescription} />}
      {!!elections?.length ? (
        <ProcessesTable processes={elections} />
      ) : !!status ? (
        <NoResultsFiltering />
      ) : (
        <NoElections />
      )}
    </Flex>
  )
}

export default Votings
