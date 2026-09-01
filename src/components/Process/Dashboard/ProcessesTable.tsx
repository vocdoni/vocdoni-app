import {
  Box,
  Card,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuPositioner,
  Portal,
  Stack,
  Table,
  Tag,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  ElectionProvider,
  ElectionStatusBadge,
  getElectionTitle,
  QuestionsTypeBadge,
  useElection,
} from '@vocdoni/react-components'
import { hasResults, isSecretUntilTheEnd, processVoteCount } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { Trans, useTranslation } from 'react-i18next'
import { LuCopy, LuEllipsisVertical, LuExternalLink, LuInfo, LuSearch } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { useDateFns } from '~i18n/use-date-fns'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { Routes } from '~routes'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { VotingReportPdfMenuItem } from '../VotingReportPdf/VotingReportPdfMenuItem'
import { useCloneAsDraft } from './use-clone-as-draft'

type ProcessesListProps = {
  processes?: VotingProcessResponse[]
}

const ProcessesTable = ({ processes }: ProcessesListProps) => {
  const { t } = useTranslation()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const rows =
    processes &&
    !!processes.length &&
    processes?.map((election) => (
      <ElectionProvider id={election.id} key={election.id}>
        {isMobile ? <ProcessCard /> : <ProcessRow />}
      </ElectionProvider>
    ))

  if (isMobile) {
    return (
      <Stack gap={3} w='full'>
        {rows}
        <RoutedPaginatedTableFooter />
      </Stack>
    )
  }

  return (
    <Box border='1px solid' borderColor='table.border' borderRadius='sm' w='full'>
      <Table.ScrollArea>
        <Table.Root variant='outline'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t('process_list.title', { defaultValue: 'Title' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('process_list.start_date', { defaultValue: 'Start date' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('process_list.end_date', { defaultValue: 'End date' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('process_list.type', { defaultValue: 'Type' })}</Table.ColumnHeader>
              <Table.ColumnHeader>{t('process_list.status', { defaultValue: 'Status' })}</Table.ColumnHeader>
              <Table.ColumnHeader textAlign='end'>
                {t('process_list.recount', { defaultValue: 'Recount' })}
              </Table.ColumnHeader>
              <Table.ColumnHeader>{t('process_list.results', { defaultValue: 'Results' })}</Table.ColumnHeader>
              <Table.ColumnHeader>&nbsp;</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>{rows}</Table.Body>
          <Table.Caption>
            <RoutedPaginatedTableFooter />
          </Table.Caption>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}

const ProcessResultsTag = () => {
  const { election, status } = useElection()

  if (!election) return null

  // Live results are visible while the vote runs (or right after it ends) unless the
  // process hides tallies until the end; final results show once they're computed.
  const resultsVisible =
    hasResults(election) || ((status === 'ENDED' || status === 'ONGOING') && !isSecretUntilTheEnd(election))

  return resultsVisible ? (
    <Tag.Root colorPalette='gray' variant='solid' size='sm'>
      <Tag.Label>
        <Trans i18nKey='process_list.results_live'>Live</Trans>
      </Tag.Label>
    </Tag.Root>
  ) : (
    <Tag.Root colorPalette='gray' variant='surface' size='sm'>
      <Tag.Label>
        <Trans i18nKey='process_list.not_yet'>Not yet</Trans>
      </Tag.Label>
    </Tag.Root>
  )
}

const ProcessCard = () => {
  const { election, results } = useElection()
  const { format } = useDateFns()
  const { t } = useTranslation()

  if (!election) return null

  const title = getElectionTitle(election) || election.id

  return (
    <Card.Root variant='data-list-item'>
      <Card.Header>
        <Link asChild title={title}>
          <RouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
            <Text fontWeight='medium' lineClamp={2}>
              {title}
            </Text>
          </RouterLink>
        </Link>
        <ProcessContextMenu />
      </Card.Header>
      <Card.Body>
        <HStack flexWrap='wrap' gap={2}>
          <QuestionsTypeBadge css={{ '& label': { fontWeight: 'normal' } }} />
          <ElectionStatusBadge size='sm' />
          <ProcessResultsTag />
        </HStack>
        <Text>
          {t('process_list.start_date', { defaultValue: 'Start date' })}:{' '}
          {format(election.startDate, t('organization.date_format'))}
        </Text>
        <Text>
          {t('process_list.end_date', { defaultValue: 'End date' })}:{' '}
          {format(election.endDate, t('organization.date_format'))}
        </Text>
        <Text>
          {t('process_list.recount', { defaultValue: 'Recount' })}: {processVoteCount(results)}
        </Text>
      </Card.Body>
    </Card.Root>
  )
}

const ProcessRow = () => {
  const { election, results } = useElection()
  const { format } = useDateFns()
  const { t } = useTranslation()

  if (!election) return null

  const title = getElectionTitle(election) || election.id

  return (
    <Table.Row position='relative'>
      <Table.Cell>
        <Link asChild title={title}>
          <RouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
            <Text w='full' maxW='500px' size='sm' truncate>
              {title}
            </Text>
          </RouterLink>
        </Link>
      </Table.Cell>
      <Table.Cell>{format(election.startDate, t('organization.date_format'))}</Table.Cell>
      <Table.Cell>{format(election.endDate, t('organization.date_format'))}</Table.Cell>
      <Table.Cell>
        <QuestionsTypeBadge css={{ '& label': { fontWeight: 'normal' } }} />
      </Table.Cell>
      <Table.Cell>
        <ElectionStatusBadge size='sm' />
      </Table.Cell>
      <Table.Cell textAlign='end'>{processVoteCount(results)}</Table.Cell>
      <Table.Cell>
        <ProcessResultsTag />
      </Table.Cell>
      <Table.Cell textAlign='end'>
        <ProcessContextMenu />
      </Table.Cell>
    </Table.Row>
  )
}

const ProcessContextMenu = () => {
  const { election } = useElection()
  const { cloneAsDraft } = useCloneAsDraft()
  const publicLanguage = usePublicLanguage()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'

  if (!election) return null

  const publicProcessPath = getPublicProcessPath({
    id: election.id,
    language: publicLanguage,
  })

  // The explorer knows on-chain (Vochain) process ids; each question is its own
  // on-chain election, so link the first question's upstream id.
  const explorerProcessId = election.questions[0]?.upstreamId

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant='ghost' size='sm' aria-label='Open actions'>
          <LuEllipsisVertical />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <MenuPositioner>
          <Menu.Content>
            <Menu.Item value='more-info' asChild>
              <RouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
                <Icon as={LuInfo} boxSize={4} />
                <Trans i18nKey='process_context.more_info'>More info</Trans>
              </RouterLink>
            </Menu.Item>
            <Menu.Item value='public-voting-page' asChild>
              <a href={publicProcessPath} target='_blank' rel='noopener noreferrer'>
                <Icon as={LuExternalLink} boxSize={4} />
                <Trans i18nKey='process_context.public_voting_page'>Public voting page</Trans>
              </a>
            </Menu.Item>
            {explorerProcessId && (
              <Menu.Item value='explorer' asChild>
                <a href={`${explorerUrl}/process/${explorerProcessId}`} target='_blank' rel='noopener noreferrer'>
                  <Icon as={LuSearch} boxSize={4} />
                  <Trans i18nKey='process_context.explorer'>Explorer</Trans>
                </a>
              </Menu.Item>
            )}
            <VotingReportPdfMenuItem election={election} />
            <Menu.Item value='clone-draft' onClick={cloneAsDraft}>
              <Icon as={LuCopy} boxSize={4} />
              <Trans i18nKey='process_context.clone_as_draft'>Clone as draft</Trans>
            </Menu.Item>
          </Menu.Content>
        </MenuPositioner>
      </Portal>
    </Menu.Root>
  )
}

export default ProcessesTable
