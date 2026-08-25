import { Flex, Progress } from '@chakra-ui/react'
import { RoutedPaginationProvider, useOrganization } from '@vocdoni/react-components'
import type { VotingProcessListResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { NoResultsFiltering } from '~components/Layout/NoResultsFiltering'
import { usePaginatedElections } from '~queries/organization'
import ProcessesTable from '../../Process/Dashboard/ProcessesTable'
import NoElections from '../NoElections'

type VotingsListProps = {
  data?: VotingProcessListResponse
  status?: string
  error?: unknown
}

type VotingsProps = {
  path: string
}

const EMPTY_PAGINATION = {
  totalItems: 0,
  currentPage: 0,
  lastPage: 0,
  previousPage: null,
  nextPage: null,
}

const Votings = ({ path }: VotingsProps) => {
  const { organization } = useOrganization()
  const { status } = useParams<{ status?: string }>()
  const { data, isLoading, error } = usePaginatedElections()

  // The table and the empty states read the organization from its provider, so keep them
  // unmounted until it resolves — but show progress rather than a blank page while it (or
  // the first page of results) is still loading.
  if (!organization || isLoading) {
    return (
      <Progress.Root size='xs' value={null} colorPalette='gray'>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  return (
    <RoutedPaginationProvider path={path} pagination={data?.pagination ?? EMPTY_PAGINATION}>
      <VotingsList data={data} status={status} error={error} />
    </RoutedPaginationProvider>
  )
}

const VotingsList = ({ data, status, error }: VotingsListProps) => {
  const { t } = useTranslation()
  const processes = data?.processes
  const hasError = !!error
  const showAlert = hasError || !processes?.length

  const alertTitle = hasError
    ? t('processes.load_error', { defaultValue: 'Unable to load voting processes' })
    : status
      ? t('processes.no_results', { defaultValue: 'No results for this filter' })
      : t('processes.empty', { defaultValue: 'No voting processes found' })
  const alertDescription = hasError
    ? error instanceof Error
      ? error.message
      : t('processes.load_error_description', { defaultValue: 'Please try again.' })
    : status
      ? t('processes.no_results_description', { defaultValue: 'Try adjusting your filters.' })
      : t('processes.empty_description', { defaultValue: 'Create a voting process to get started.' })

  return (
    <Flex flexDirection='column' flexGrow={1} gap={5} height='full'>
      {showAlert && (
        <ListStateAlert show status={hasError ? 'error' : 'info'} title={alertTitle} description={alertDescription} />
      )}
      {!!processes?.length ? (
        <ProcessesTable processes={processes} />
      ) : hasError ? null : !!status ? (
        <NoResultsFiltering />
      ) : (
        <NoElections />
      )}
    </Flex>
  )
}

export default Votings
