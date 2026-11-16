import { Button, Card, Flex, Grid, GridItem, HStack, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import { processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { CensusRuler } from '~components/ui/CensusRuler'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { ResponsiveMenu, type ResponsiveMenuItem } from '~components/ui/ResponsiveMenu'
import { useVoteText } from '~i18n/use-vote-text'
import { useDeleteDraft } from '~queries/votes'
import { Routes } from '~routes'
import { isLegacyProcess, isQuestionByQuestion } from '~src/types/voting-process'
import { ChevronRightIcon, CopyIcon, MoreIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { questionOutcome } from '~utils/vote-outcome'
import { draftWarning, percentOf, type VoteRow } from '~utils/vote-state'
import { useCloneAsDraft } from '~components/Process/Dashboard/use-clone-as-draft'
import { useIsDesktop } from './useListShortcuts'

export type VoteListRowProps = {
  row: VoteRow
  results?: VotingProcessResultsResponse | null
  /** The one live vote shown larger at the top of the list, with its turnout. */
  promoted?: boolean
  canManage: boolean
  now: Date
}

type RowAction = { key: 'continue' | 'manage' | 'follow' | 'result' | 'view'; to: string }

const rowAction = ({ process, state }: VoteRow): RowAction => {
  const id = process.id
  if (isLegacyProcess(process)) return { key: 'result', to: generatePath(Routes.dashboard.processResults, { id }) }
  const byQuestion = isQuestionByQuestion(process)
  const open = byQuestion ? Routes.dashboard.processManage : Routes.dashboard.process
  switch (state) {
    case 'draft':
      return {
        key: 'continue',
        to: `${generatePath(Routes.processes.create)}?${createSearchParams({ draftId: id }).toString()}`,
      }
    case 'ready':
      return { key: 'manage', to: generatePath(open, { id }) }
    case 'live':
    case 'paused':
      return { key: 'follow', to: generatePath(open, { id }) }
    case 'closed':
      return { key: 'result', to: generatePath(Routes.dashboard.processResults, { id }) }
    case 'canceled':
      return { key: 'view', to: generatePath(Routes.dashboard.process, { id }) }
  }
}

const useActionLabel = () => {
  const { t } = useTranslation()
  return (key: RowAction['key']) => {
    switch (key) {
      case 'continue':
        return t('votes.list.action.continue', { defaultValue: 'Continue' })
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
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => !next && onClose()}
      lazyMount
      unmountOnExit
      layout='inline'
      title={t('votes.list.delete_title', { defaultValue: 'Delete this draft?' })}
      description={t('votes.list.delete_body', { defaultValue: 'It cannot be undone.' })}
      confirmText={t('drafts.delete', { defaultValue: 'Delete draft' })}
      loading={mutation.isPending}
      onConfirm={() => mutation.mutate({ draftId }, { onSettled: onClose })}
    />
  )
}

/** Sentences under a vote's title, joined by a space. */
const useMeta = (row: VoteRow, results: VotingProcessResultsResponse | null | undefined, now: Date) => {
  const { t } = useTranslation()
  const { longDate, outcome } = useVoteText()
  const { process, state } = row
  const size = process.census?.size
  const count = process.questions.length

  const questions = t('votes.list.meta_questions', {
    count,
    defaultValue_one: '{{count}} question',
    defaultValue_other: '{{count}} questions',
  })
  const parts: string[] = [
    size === undefined
      ? t('votes.list.meta_no_voters', { defaultValue: '{{questions}}.', questions })
      : t('votes.list.meta', {
          defaultValue: '{{questions}}, {{voters}}.',
          questions,
          voters: t('votes.list.meta_voters', {
            count: size,
            defaultValue_one: '{{count}} voter',
            defaultValue_other: '{{count}} voters',
          }),
        }),
  ]
  const end = resolveEndDate(process)
  if (state === 'live' || state === 'paused') {
    if (end) parts.push(t('votes.list.closes', { defaultValue: 'Closes {{date}}.', date: longDate(end) }))
  } else if (state === 'ready') {
    parts.push(t('votes.list.starts', { defaultValue: 'Starts {{date}}.', date: longDate(process.startDate) }))
    if (isQuestionByQuestion(process))
      parts.push(t('votes.list.by_question', { defaultValue: 'Question by question.' }))
  }

  let result: string | null = null
  let turnout: string | null = null
  if (state === 'closed') {
    const [question] = process.questions
    if (process.questions.length === 1 && question) {
      const entry = results?.questions.find((candidate) => candidate.questionId === question.id)
      result = outcome(questionOutcome(question, entry, { weighted: !!process.census?.weighted }))
    }
    const percent = results ? percentOf(processVoteCount(results), size) : undefined
    if (percent !== undefined) turnout = t('votes.list.turnout', { defaultValue: '{{percent}}% turnout.', percent })
  }

  const warning = state === 'draft' ? draftWarning(process, now) : null
  const warningText =
    warning === 'missingEndDate'
      ? t('votes.list.warning.missing_end', { defaultValue: 'No closing date yet.' })
      : warning === 'endDatePassed'
        ? t('votes.list.warning.end_passed', { defaultValue: 'The closing date has passed.' })
        : null

  return { text: parts.join(' '), result, turnout, warning: warningText }
}

const titleOf = (process: VotingProcessResponse, text: ReturnType<typeof useVoteText>['text'], fallback: string) =>
  text(process.title) || fallback

const GRID_AREAS = {
  base: '"status more" "title title" "meta meta" "bar bar" "action action"',
  md: '"status title action more" "status meta action more" "status bar action more"',
}

const VoteListRowBase = ({ row, results, promoted = false, canManage, now }: VoteListRowProps) => {
  const { t } = useTranslation()
  const { text, shortDate } = useVoteText()
  const isDesktop = useIsDesktop()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const actionLabel = useActionLabel()
  const { process, state } = row
  const meta = useMeta(row, results, now)
  const action = useMemo(() => rowAction(row), [row])

  const legacy = isLegacyProcess(process)
  const isDraft = state === 'draft'
  const canDuplicate = canManage && !legacy
  const canDelete = canManage && isDraft
  const title = titleOf(
    process,
    text,
    isDraft ? t('drafts.not_defined', { defaultValue: 'Not defined yet' }) : process.id
  )
  const closedOn = state === 'closed' || state === 'canceled' ? shortDate(resolveEndDate(process)) : ''

  const total = process.census?.size
  const voted = results ? processVoteCount(results) : 0
  const percent = percentOf(voted, total)

  // Duplicate is an icon button from `lg` and an item of the menu below it.
  const items: ResponsiveMenuItem[] = [
    ...(canDuplicate && !isDesktop
      ? [
          {
            value: 'duplicate',
            label: t('votes.list.duplicate', { defaultValue: 'Duplicate this vote' }),
            disabled: isCloning,
            onSelect: () => void cloneAsDraft(process),
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            value: 'delete',
            label: t('drafts.delete', { defaultValue: 'Delete draft' }),
            danger: true,
            onSelect: () => setConfirmingDelete(true),
          },
        ]
      : []),
  ]

  const actionText = actionLabel(action.key)

  return (
    <Card.Body as='article' py={promoted ? '5' : undefined}>
      <Grid
        templateColumns={{ base: '1fr auto', md: '[{sizes.list.label} minmax(0, 1fr) auto {sizes.10}]' }}
        templateAreas={GRID_AREAS}
        columnGap='4'
        alignItems='start'
      >
        <GridItem area='status' minW='0'>
          <Stack gap='0.5'>
            <ProcessStatus state={state} />
            {closedOn && (
              <Text textStyle='caption' color='fg.subtle' ps='3.5'>
                {t('votes.list.closed_on', { defaultValue: 'on {{date}}', date: closedOn })}
              </Text>
            )}
          </Stack>
        </GridItem>

        <GridItem area='title' minW='0' mt={{ base: '2', md: '0' }}>
          <Text as='h2' textStyle={promoted ? 'feature-title' : 'item-title'} lineClamp={2}>
            {title}
          </Text>
        </GridItem>

        <GridItem area='meta' minW='0' mt='0.5'>
          <Text textStyle='body-sm' color='fg.subtle'>
            {meta.text}
            {meta.result && (
              <Text as='span' fontWeight='medium-plus' color='fg'>
                {' '}
                {meta.result}
              </Text>
            )}
            {meta.turnout && <> {meta.turnout}</>}
            {meta.warning && (
              <Text as='span' fontWeight='medium-plus' color='status.warning.fg'>
                {' '}
                {meta.warning}
              </Text>
            )}
          </Text>
        </GridItem>

        {promoted && (
          <GridItem area='bar' minW='0' mt='4' maxW={{ md: 'md' }}>
            <Stack gap='2'>
              <Flex justify='space-between' gap='4'>
                <Text textStyle='control' fontWeight='medium-plus'>
                  {t('votes.list.voted_of', {
                    defaultValue: '{{voted}} of {{total}} voted',
                    voted: quantity(voted),
                    total: total === undefined ? '?' : quantity(total),
                  })}
                </Text>
                {percent !== undefined && (
                  <Text textStyle='figure' color='fg.subtle'>
                    {t('votes.list.percent', { defaultValue: '{{percent}}%', percent })}
                  </Text>
                )}
              </Flex>
              <CensusRuler
                value={voted}
                max={total}
                label={t('votes.list.ruler_label', {
                  defaultValue: '{{voted}} of {{total}} people voted, {{percent}}%',
                  voted: quantity(voted),
                  total: total === undefined ? '?' : quantity(total),
                  percent: percent ?? 0,
                })}
              />
            </Stack>
          </GridItem>
        )}

        <GridItem area='action' mt={{ base: '3', md: '0' }} justifySelf={{ base: 'stretch', md: 'end' }}>
          <HStack gap='3.5' justify={{ base: 'flex-start', md: 'flex-end' }}>
            {promoted ? (
              <Button asChild w={{ base: 'full', md: 'auto' }}>
                <RouterLink to={action.to}>{actionText}</RouterLink>
              </Button>
            ) : (
              <Link asChild textStyle='control' fontWeight='medium-plus'>
                <RouterLink to={action.to}>
                  {actionText}
                  <Icon as={ChevronRightIcon} />
                </RouterLink>
              </Link>
            )}
            {canDuplicate && isDesktop && (
              <IconButton
                variant='ghost'
                size='sm'
                aria-label={t('votes.list.duplicate', { defaultValue: 'Duplicate this vote' })}
                title={t('votes.list.duplicate_short', { defaultValue: 'Duplicate' })}
                loading={isCloning}
                onClick={() => void cloneAsDraft(process)}
              >
                <CopyIcon />
              </IconButton>
            )}
          </HStack>
        </GridItem>

        <GridItem area='more' justifySelf='end'>
          {items.length > 0 && (
            <ResponsiveMenu
              label={t('votes.list.more', { defaultValue: 'More actions' })}
              trigger={
                <IconButton
                  variant='ghost'
                  size='sm'
                  aria-label={
                    isDraft
                      ? t('drafts.actions', { defaultValue: 'Draft actions' })
                      : t('votes.list.more', { defaultValue: 'More actions' })
                  }
                >
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

export const VoteListRow = memo(VoteListRowBase)
