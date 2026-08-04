import { Flex } from '@chakra-ui/react'
import { RoutedPaginationProvider, useOrganization } from '@vocdoni/react-components'
import type { VotingProcessListResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { NoResultsFiltering } from '~components/Layout/NoResultsFiltering'
import ProcessesTable from '../../Process/Dashboard/ProcessesTable'
import NoElections from '../NoElections'

type VotingsListProps = {
  data: VotingProcessListResponse
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
  const { processes } = data
  const showAlert = !processes?.length
  const alertTitle = status
    ? t('processes.no_results', { defaultValue: 'No results for this filter' })
    : t('processes.empty', { defaultValue: 'No voting processes found' })
  const alertDescription = status
    ? t('processes.no_results_description', { defaultValue: 'Try adjusting your filters.' })
    : t('processes.empty_description', { defaultValue: 'Create a voting process to get started.' })

  return (
    <Flex flexDirection='column' flexGrow={1} gap={5} height='full'>
      {showAlert && <ListStateAlert show status='info' title={alertTitle} description={alertDescription} />}
      {!!processes?.length ? (
        <ProcessesTable processes={processes} />
      ) : !!status ? (
        <NoResultsFiltering />
      ) : (
        <NoElections />
      )}
    </Flex>
  )
}

export default Votings
