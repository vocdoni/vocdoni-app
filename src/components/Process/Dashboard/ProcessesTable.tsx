import {
  Box,
  Icon,
  IconButton,
  Link,
  MenuItem,
  MenuContent,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  TagLabel,
  TagRoot,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRoot,
  TableRow,
  TableScrollArea,
} from '@chakra-ui/react'
import { ElectionStatusBadge, QuestionsTypeBadge } from '~components/vocdoni-ui'
import { ElectionProvider, useElection } from '@vocdoni/react-providers'
import { ElectionStatus, ensure0x, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { Trans, useTranslation } from 'react-i18next'
import { LuCopy, LuEllipsisVertical, LuExternalLink, LuInfo, LuSearch } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router-dom'
import { useDateFns } from '~i18n/use-date-fns'
import RoutedPaginatedTableFooter from '~shared/Pagination/PaginatedTableFooter'
import { Routes } from '~src/router/routes'
import { useCloneAsDraft } from './use-clone-as-draft'

type Election = PublishedElection | InvalidElection

type ProcessesListProps = {
  processes?: Election[]
}

const ProcessesTable = ({ processes }: ProcessesListProps) => {
  const { t } = useTranslation()

  return (
    <Box border='1px solid' borderColor='table.border' borderRadius='sm' w='full'>
      <TableScrollArea>
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableColumnHeader>{t('process_list.title', { defaultValue: 'Title' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.start_date', { defaultValue: 'Start date' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.end_date', { defaultValue: 'End date' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.type', { defaultValue: 'Type' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.status', { defaultValue: 'Status' })}</TableColumnHeader>
              <TableColumnHeader textAlign='end'>
                {t('process_list.recount', { defaultValue: 'Recount' })}
              </TableColumnHeader>
              <TableColumnHeader>{t('process_list.results', { defaultValue: 'Results' })}</TableColumnHeader>
              <TableColumnHeader>&nbsp;</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes &&
              !!processes.length &&
              processes?.map((election) => (
                <ElectionProvider election={election} id={election.id} key={election.id}>
                  <ProcessRow />
                </ElectionProvider>
              ))}
          </TableBody>
        </TableRoot>
      </TableScrollArea>
      <Box p={4}>
        <RoutedPaginatedTableFooter />
      </Box>
    </Box>
  )
}

const ProcessRow = () => {
  const { election } = useElection()
  const { format } = useDateFns()
  const { t } = useTranslation()

  if (!election || election instanceof InvalidElection) return null

  return (
    <TableRow position='relative'>
      <TableCell>
        <Link asChild _hover={{ textDecoration: 'underline' }} fontWeight='medium'>
          <RouterLink to={generatePath(Routes.dashboard.process, { id: ensure0x(election.id) })}>
            {election.title.default}
          </RouterLink>
        </Link>
      </TableCell>
      <TableCell>{format(election.startDate, t('organization.date_format'))}</TableCell>
      <TableCell>{format(election.endDate, t('organization.date_format'))}</TableCell>
      <TableCell>
        <QuestionsTypeBadge css={{ '& label': { fontWeight: 'normal' } }} />
      </TableCell>
      <TableCell>
        <ElectionStatusBadge size='sm' />
      </TableCell>
      <TableCell textAlign='end'>{election.voteCount}</TableCell>
      <TableCell>
        {ElectionStatus.RESULTS === election.status ||
        ([ElectionStatus.ENDED, ElectionStatus.ONGOING].includes(election.status) &&
          !election.electionType.secretUntilTheEnd) ? (
          <TagRoot colorPalette='brand' variant='solid' size='sm'>
            <TagLabel>
              <Trans i18nKey='process_list.results_live'>Live</Trans>
            </TagLabel>
          </TagRoot>
        ) : (
          <TagRoot colorPalette='gray' size='sm'>
            <TagLabel>
              <Trans i18nKey='process_list.not_yet'>Not yet</Trans>
            </TagLabel>
          </TagRoot>
        )}
      </TableCell>
      <TableCell textAlign='end'>
        <ProcessContextMenu />
      </TableCell>
    </TableRow>
  )
}

const ProcessContextMenu = () => {
  const { election, client } = useElection()
  const { cloneAsDraft } = useCloneAsDraft()

  if (!election || election instanceof InvalidElection) return null

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant='ghost' size='sm' aria-label='Open actions'>
          <LuEllipsisVertical />
        </IconButton>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent>
          <MenuItem value='more-info' asChild>
            <RouterLink to={generatePath(Routes.dashboard.process, { id: ensure0x(election.id) })}>
              <Icon as={LuInfo} boxSize={4} />
              <Trans i18nKey='process_context.more_info'>More info</Trans>
            </RouterLink>
          </MenuItem>
          <MenuItem value='public-voting-page' asChild>
            <RouterLink to={generatePath(Routes.processes.view, { id: ensure0x(election.id) })} target='_blank'>
              <Icon as={LuExternalLink} boxSize={4} />
              <Trans i18nKey='process_context.public_voting_page'>Public voting page</Trans>
            </RouterLink>
          </MenuItem>
          <MenuItem value='explorer' asChild>
            <a href={`${client.explorerUrl}/process/${election.id}`} target='_blank' rel='noopener noreferrer'>
              <Icon as={LuSearch} boxSize={4} />
              <Trans i18nKey='process_context.explorer'>Explorer</Trans>
            </a>
          </MenuItem>
          <MenuItem value='clone-draft' onClick={cloneAsDraft}>
            <Icon as={LuCopy} boxSize={4} />
            <Trans i18nKey='process_context.clone_as_draft'>Clone as draft</Trans>
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  )
}

export default ProcessesTable
