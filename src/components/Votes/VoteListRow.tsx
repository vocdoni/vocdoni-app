import { Card, Grid, GridItem, Icon, IconButton, Link, Text } from '@chakra-ui/react'
import type { VotingProcessResultsResponse } from '@vocdoni/api-types'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { useCloneAsDraft } from '~components/Process/Dashboard/use-clone-as-draft'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { ResponsiveMenu, type ResponsiveMenuItem } from '~components/ui/ResponsiveMenu'
import { useVoteText } from '~i18n/use-vote-text'
import { useDeleteDraft } from '~queries/votes'
import { Routes } from '~routes'
import { isLegacyProcess } from '~src/types/voting-process'
import { ChevronRightIcon, CopyIcon, DeleteIcon, MoreIcon } from '~theme/icons'
import { canceledAt, closedAt, type VoteRow, type VoteState } from '~utils/vote-state'
import { VoteRowMeta } from './VoteRowMeta'

export type VoteListRowProps = {
  row: VoteRow
  results?: VotingProcessResultsResponse | null
  canManage: boolean
  now: Date
}

type RowAction = { key: 'continue' | 'manage' | 'follow' | 'result' | 'view'; to: string }

const rowAction = ({ process, state }: VoteRow): RowAction => {
  const id = process.id
  // The results are read on Resum (R31), and a question-by-question vote is run from there (R32).
  const open = generatePath(Routes.dashboard.process, { id })
  if (isLegacyProcess(process)) return { key: 'result', to: open }
  switch (state) {
    case 'draft':
      return {
        key: 'continue',
        to: `${generatePath(Routes.processes.create)}?${createSearchParams({ draftId: id }).toString()}`,
      }
    case 'ready':
      return { key: 'manage', to: open }
    case 'live':
    case 'paused':
      return { key: 'follow', to: open }
    case 'closed':
      return { key: 'result', to: open }
    case 'canceled':
      return { key: 'view', to: open }
  }
}

const useActionLabel = () => {
  const { t } = useTranslation()
  return (key: RowAction['key']) => {
    switch (key) {
      case 'continue':
        return t('votes.list.action.continue', { defaultValue: 'Edit' })
      case 'manage':
        return t('votes.list.action.manage', { defaultValue: 'Manage vote' })
      case 'follow':
        return t('votes.list.action.follow', { defaultValue: 'Follow' })
      case 'result':
        return t('votes.list.action.result', { defaultValue: 'Result' })
      case 'view':
        return t('votes.list.action.view', { defaultValue: 'View' })
    }
  }
}

const DeleteDraftDialog = ({ draftId, open, onClose }: { draftId: string; open: boolean; onClose: () => void }) => {
  const { t } = useTranslation()
  const mutation = useDeleteDraft()
  return (
    // The guide's decision dialog; the default `danger` tone is the outline with danger text, never a filled red.
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => !next && onClose()}
      lazyMount
      unmountOnExit
      title={t('votes.list.delete_title', { defaultValue: 'Delete this draft?' })}
      description={t('votes.list.delete_body', { defaultValue: 'It cannot be undone.' })}
      confirmText={t('votes.list.delete_confirm', { defaultValue: 'Delete draft' })}
      loading={mutation.isPending}
      // Closes on success only: after a failure (told by a toast) the draft is still there to try again.
      onConfirm={() => mutation.mutate({ draftId }, { onSuccess: onClose })}
    />
  )
}

// A phone stacks the row under its state line, with "More" beside the state; from md the desktop grid returns:
// state, content, action, More.
const GRID_AREAS = {
  base: '"status more" "title title" "meta meta" "action action"',
  md: '"status title action more" "status meta action more"',
}

export const VoteListRow = ({ row, results, canManage, now }: VoteListRowProps) => {
  const { t } = useTranslation()
  const { text, shortDate } = useVoteText()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const actionLabel = useActionLabel()
  const titleId = useId()
  const { process, state } = row
  const action = useMemo(() => rowAction(row), [row])

  const isDraft = state === 'draft'
  // A draft with no question yet has nothing to copy.
  const canDuplicate = canManage && !isLegacyProcess(process) && (process.questions?.length ?? 0) > 0
  const canDelete = canManage && isDraft
  const title =
    text(process.title) || (isDraft ? t('drafts.not_defined', { defaultValue: 'Not defined yet' }) : process.id)
  // A canceled vote shows when it was canceled, never its schedule (it may have been canceled before it began).
  const closedOn =
    state === 'canceled' ? shortDate(canceledAt(process)) : state === 'closed' ? shortDate(closedAt(process)) : ''

  // Every row keeps its secondary actions in one "More" menu at every width: duplicate, and delete
  // last for a draft.
  const items: ResponsiveMenuItem[] = [
    ...(canDuplicate
      ? [
          {
            value: 'duplicate',
            label: t('votes.list.duplicate_short', { defaultValue: 'Duplicate' }),
            icon: CopyIcon,
            disabled: isCloning,
            onSelect: () => void cloneAsDraft(process),
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            value: 'delete',
            label: t('votes.list.delete', { defaultValue: 'Delete' }),
            icon: DeleteIcon,
            danger: true,
            onSelect: () => setConfirmingDelete(true),
          },
        ]
      : []),
  ]

  const more = t('votes.list.more', { defaultValue: 'More actions' })
  // Every row has the same action words: the accessible names add the vote they act on.
  const named = (action: string) =>
    t('votes.list.action_label', { defaultValue: '{{action}}: {{title}}', action, title })
  // The text columns keep clear of the phone row's tight end padding, which only the 44px "More" button uses.
  const textEnd = { base: '2.5', md: '0' } as const

  return (
    <Card.Body
      as='article'
      aria-labelledby={titleId}
      // The 44px "More" button sets the phone row's top edge, so the row pads less there and at the end.
      pt={{ base: '1.5', md: '3.5' }}
      pb='3.5'
      ps={{ base: '4', md: '5', lg: 'card' }}
      pe={{ base: '1.5', md: '2.5', lg: 'card' }}
    >
      <Grid
        templateColumns={{
          base: 'minmax(0, 1fr) auto',
          md: '[{sizes.list.label.tablet} minmax(0, 1fr) auto auto]',
          lg: '[{sizes.list.label} minmax(0, 1fr) auto auto]',
        }}
        templateAreas={GRID_AREAS}
        columnGap={{ base: '0', md: '3', lg: '4' }}
        alignItems={{ base: 'center', md: 'start' }}
      >
        <GridItem area='status' minW='0'>
          <ProcessStatus
            state={state}
            detail={closedOn ? t('votes.list.closed_on', { defaultValue: 'on {{date}}', date: closedOn }) : undefined}
          />
        </GridItem>

        <GridItem area='title' minW='0' pe={textEnd}>
          {/* The title opens the vote too, as the row's action does. */}
          <Text as='h2' id={titleId} textStyle='item-title' lineClamp={2}>
            <Link asChild variant='title'>
              <RouterLink to={action.to}>{title}</RouterLink>
            </Link>
          </Text>
        </GridItem>

        <GridItem area='meta' minW='0' mt='0.5' pe={textEnd}>
          <VoteRowMeta row={row} results={results} now={now} />
        </GridItem>

        <GridItem area='action' mt={{ base: '1', md: '0' }} pe={textEnd} alignSelf={{ base: 'auto', md: 'center' }}>
          {/* The phone's 44px hit area overhangs the row's bottom padding instead of growing the row. */}
          <Link asChild variant='row-action' mb={{ base: '-3', md: '0' }}>
            <RouterLink to={action.to} aria-label={named(actionLabel(action.key))}>
              {actionLabel(action.key)}
              <Icon as={ChevronRightIcon} />
            </RouterLink>
          </Link>
        </GridItem>

        {/* From `lg` the board puts its row icon 14px after the action, 2px closer than the grid's gap. */}
        <GridItem area='more' justifySelf='end' alignSelf='center' ms={{ lg: '-0.5' }}>
          {items.length > 0 && (
            <ResponsiveMenu
              label={more}
              title={title}
              trigger={
                <IconButton variant='ghost' size='sm' aria-label={named(more)}>
                  <MoreIcon />
                </IconButton>
              }
              items={items}
            />
          )}
        </GridItem>
      </Grid>
      {canDelete && (
        <DeleteDraftDialog draftId={process.id} open={confirmingDelete} onClose={() => setConfirmingDelete(false)} />
      )}
    </Card.Body>
  )
}
