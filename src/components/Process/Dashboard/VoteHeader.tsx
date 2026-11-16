import { Button, Flex, Icon, Link, Text } from '@chakra-ui/react'
import { isBeforeStart, resolveEndDate } from '@vocdoni/api-client'
import { useConfirm, useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { ActionContinue, ActionEnd, ActionPause } from '~components/Actions'
import { useActions } from '~components/Actions/ActionsContext'
import { ConfirmActionModal } from '~components/Actions/ConfirmActionModal'
import { PageTitle } from '~components/ui/PageTitle'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { ResponsiveMenu, type ResponsiveMenuItem } from '~components/ui/ResponsiveMenu'
import { useVoteText } from '~i18n/use-vote-text'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { Routes } from '~src/router/routes'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { ChevronDownIcon } from '~theme/icons'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { useNow } from '~utils/use-now'
import { deriveVoteState, isTerminalQuestion } from '~utils/vote-state'
import { useVotingReportPdfDownload } from '../VotingReportPdf/VotingReportPdfButton'
import { useCloneAsDraft } from './use-clone-as-draft'

/** Back link, title, state and the actions of one vote. The actions go under the title on phones. */
export const VoteHeader = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { canManage, cancel } = useActions()
  const { confirm } = useConfirm()
  const now = useNow()
  const { text, longDate, timeLeft } = useVoteText()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const { cloneAsDraft } = useCloneAsDraft()
  const publicLanguage = usePublicLanguage()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const pdf = useVotingReportPdfDownload(election ?? undefined)

  if (!election) return null

  const state = deriveVoteState(election, now)
  const byQuestion = isQuestionByQuestion(election)
  const publicPath = getPublicProcessPath({ id: election.id, language: publicLanguage })
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const explorerProcessId = election.questions[0]?.upstreamId
  const hasClosedQuestion = election.questions.some((question) => isTerminalQuestion(question))
  const canCancel = canManage && !hasClosedQuestion && state !== 'closed' && state !== 'canceled'

  const cancelWithConfirm = async () => {
    if (
      await confirm(
        <ConfirmActionModal
          title={t('confirm.cancel_process_title')}
          description={t('actions.cancel_description', { election })}
          confirm={t('confirm.cancel_process_button')}
          cancel={t('confirm.cancel_button')}
        />
      )
    ) {
      trackAnalyticsEvent({
        name: AnalyticsEvents.ProcessAction,
        props: { action: 'cancel', election_id: election.id },
      })
      await cancel()
    }
  }

  const pdfLabel = t('process_pdf.download', { defaultValue: 'Election report (PDF)' })
  const items: ResponsiveMenuItem[] = [
    {
      value: 'show-as-voter',
      label: t('votes.page.show_as_voter', { defaultValue: 'Show as voter' }),
      href: publicPath,
    },
    ...(canManage
      ? [
          {
            value: 'duplicate',
            label: t('votes.page.duplicate', { defaultValue: 'Duplicate' }),
            onSelect: () => void cloneAsDraft(election),
          },
        ]
      : []),
    ...(pdf.report || pdf.isPendingResults
      ? [
          {
            value: 'download-pdf',
            label: pdfLabel,
            onSelect: () => void pdf.download(),
            disabled: !pdf.report || pdf.isGenerating,
          },
        ]
      : []),
    ...(explorerProcessId
      ? [
          {
            value: 'explorer',
            label: t('view_in_explorer', { defaultValue: 'View in explorer' }),
            href: `${explorerUrl}/process/${explorerProcessId}`,
          },
        ]
      : []),
    ...(canCancel
      ? [
          {
            value: 'cancel',
            label: t('cancel_vote', { defaultValue: 'Cancel vote' }),
            onSelect: () => void cancelWithConfirm(),
            danger: true,
          },
        ]
      : []),
  ]

  const end = resolveEndDate(election)
  const closesAt = longDate(earlyEndDate ?? end)
  const startsAt = longDate(election.startDate)
  const noneOpen = !election.questions.some((question) => question.status === 'ONGOING')

  let line = ''
  switch (state) {
    case 'ready':
      if (!byQuestion) {
        line = t('votes.page.line.starts', { defaultValue: 'Starts {{date}}.', date: startsAt })
      } else if (isBeforeStart(election.startDate, now)) {
        line = t('votes.page.line.starts_by_question', {
          defaultValue: 'Starts {{date}}. Question by question.',
          date: startsAt,
        })
      } else {
        line = t('votes.page.line.by_question_none_open', {
          defaultValue: 'Question by question. No question open yet.',
        })
      }
      break
    case 'live':
      if (byQuestion) {
        line = t('votes.page.line.by_question_closes', {
          defaultValue: 'Question by question. Closes {{date}}.',
          date: closesAt,
        })
        if (noneOpen) line += ` ${t('votes.page.line.none_open', { defaultValue: 'No question open.' })}`
      } else {
        line = t('votes.page.line.closes', {
          defaultValue: 'Closes {{date}}. {{left}}',
          date: closesAt,
          left: timeLeft(end, now) ?? '',
        }).trim()
      }
      break
    case 'paused':
      line = t('votes.page.line.closes_paused', { defaultValue: 'Closes {{date}}.', date: closesAt })
      break
    case 'closed':
      line = t('votes.page.line.closed', { defaultValue: 'Closed on {{date}}.', date: closesAt })
      break
    case 'canceled':
      line = t('votes.page.line.canceled', { defaultValue: 'The votes were discarded.' })
      break
  }

  // Equal parts on phones (the row spans the page); natural width from md.
  const fill = { base: '1', md: 'none' } as const

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify='space-between'
      align={{ base: 'stretch', md: 'flex-start' }}
      gap='4'
    >
      <Flex direction='column' gap='2' minW='0'>
        <Link asChild textStyle='caption' color='fg.subtle' alignSelf='flex-start'>
          <RouterLink to={Routes.dashboard.processes.base}>
            {t('votes.page.back', { defaultValue: 'Votes' })}
          </RouterLink>
        </Link>
        <PageTitle>{text(election.title)}</PageTitle>
        <Flex wrap='wrap' align='center' gap='2.5'>
          <ProcessStatus state={state} />
          <Text textStyle='control' color='fg.muted'>
            {line}
          </Text>
        </Flex>
      </Flex>
      <Flex gap='2' flexShrink={0} alignItems='flex-start'>
        {!byQuestion && state === 'live' && (
          <ActionPause variant='outline' flex={fill}>
            {t('votes.page.pause', { defaultValue: 'Pause' })}
          </ActionPause>
        )}
        {!byQuestion && state === 'paused' && (
          <ActionContinue variant='outline' flex={fill}>
            {t('votes.page.resume', { defaultValue: 'Resume' })}
          </ActionContinue>
        )}
        {!byQuestion && (state === 'live' || state === 'paused' || state === 'ready') && (
          <ActionEnd variant='outline' flex={fill}>
            {t('votes.page.end_now', { defaultValue: 'End now' })}
          </ActionEnd>
        )}
        {byQuestion && (state === 'ready' || state === 'live') && (
          <ActionEnd variant='outline' flex={fill}>
            {t('votes.page.end_vote', { defaultValue: 'End vote' })}
          </ActionEnd>
        )}
        <ResponsiveMenu
          label={t('votes.page.more', { defaultValue: 'More' })}
          trigger={
            <Button variant='outline' flex={fill}>
              {t('votes.page.more', { defaultValue: 'More' })}
              <Icon as={ChevronDownIcon} />
            </Button>
          }
          items={items}
        />
      </Flex>
    </Flex>
  )
}
