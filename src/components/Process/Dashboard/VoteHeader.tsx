import { Button, Flex, Grid, Icon, IconButton, Link, Text } from '@chakra-ui/react'
import { questionsEndedAt, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { isSameDay } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { ActionContinue, ActionEnd, ActionPause, CancelVoteDialog } from '~components/Actions'
import { useActions } from '~components/Actions/ActionsContext'
import { PageTitle } from '~components/ui/PageTitle'
import { ProcessStatus, useProcessStateLabel } from '~components/ui/ProcessStatus'
import { ResponsiveMenu, type ResponsiveMenuItem } from '~components/ui/ResponsiveMenu'
import { useIsDesktop } from '~components/ui/useIsMobile'
import { useVoteText } from '~i18n/use-vote-text'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { Routes } from '~src/router/routes'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { isQuestionByQuestion } from '~src/types/voting-process'
import {
  CancelIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CopyIcon,
  DownloadFileIcon,
  ExternalLinkIcon,
  MoreIcon,
  ViewIcon,
} from '~theme/icons'
import { ucfirst } from '~utils/strings'
import { useNow } from '~utils/use-now'
import { deriveVoteState, isTerminalQuestion, type VoteState } from '~utils/vote-state'
import { useVotingReportPdfDownload } from '../VotingReportPdf/VotingReportPdfButton'
import { useCloneAsDraft } from './use-clone-as-draft'

type HeaderPartProps = { election: VotingProcessResponse; state: VoteState; now: Date }

const parseDate = (value: string | undefined) => {
  const date = value ? new Date(value) : undefined
  return date && !isNaN(date.getTime()) ? date : undefined
}

/** The line beside the state, per state and mode, in the boards' words. */
const useStatusLine = ({ election, state, now }: HeaderPartProps): string => {
  const { t, i18n } = useTranslation()
  const isDesktop = useIsDesktop()
  const { dateAt, day, time, shortDate, timeLeft, ago, duration } = useVoteText()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const byQuestion = isQuestionByQuestion(election)
  const start = new Date(election.startDate)
  const end = resolveEndDate(election)
  const upper = (value: string) => ucfirst(value, i18n.language)

  switch (state) {
    case 'ready':
      return byQuestion
        ? t('votes.header.line.by_question_ready', {
            defaultValue: '{{date}}. Question by question.',
            date: upper(dateAt(start)),
          })
        : t('votes.header.line.opens', {
            defaultValue: 'Opens {{start}} and closes {{end}}.',
            start: dateAt(start),
            end: dateAt(end),
          })
    case 'live': {
      const closes = t('votes.header.line.closes', { defaultValue: 'Closes {{date}}.', date: dateAt(end) })
      if (!byQuestion) {
        const left = timeLeft(end, now)
        return left
          ? t('votes.header.line.closes_left', {
              defaultValue: 'Closes {{date}}. {{left}}.',
              date: dateAt(end),
              left: upper(left),
            })
          : closes
      }
      // The phone board says when it closes; the desktop board when it started.
      if (!isDesktop) return closes
      return isSameDay(start, now)
        ? t('votes.header.line.by_question_live_today', {
            defaultValue: '{{day}}, question by question. Started at {{time}}, {{ago}}.',
            day: upper(day(start)),
            time: time(start),
            ago: ago(start, now),
          })
        : t('votes.header.line.by_question_live', {
            defaultValue: 'Question by question. Started {{date}}, {{ago}}.',
            date: dateAt(start),
            ago: ago(start, now),
          })
    }
    case 'paused':
      if (!byQuestion) {
        return t('votes.header.line.closes_paused', {
          defaultValue: 'Closes {{date}}. The deadline does not stop.',
          date: dateAt(end),
        })
      }
      return isSameDay(start, now)
        ? t('votes.header.line.by_question_paused_today', {
            defaultValue: 'Question by question. Started at {{time}}.',
            time: time(start),
          })
        : t('votes.header.line.by_question_paused', {
            defaultValue: 'Question by question. Started {{date}}.',
            date: dateAt(start),
          })
    case 'closed': {
      const endedAt = earlyEndDate ?? end
      if (!endedAt) return ''
      if (byQuestion) {
        return t('votes.header.line.by_question_ended', {
          defaultValue: 'On {{day}} at {{time}}, after {{duration}}.',
          day: shortDate(endedAt),
          time: time(endedAt),
          duration: duration(start, endedAt),
        })
      }
      return isSameDay(endedAt, now)
        ? t('votes.header.line.ended_today', {
            defaultValue: 'Ended today, {{day}}, at {{time}}.',
            day: day(endedAt),
            time: time(endedAt),
          })
        : t('votes.header.line.ended', { defaultValue: 'Ended {{date}}.', date: dateAt(endedAt) })
    }
    case 'canceled': {
      const canceledAt = parseDate(election.endedAt) ?? questionsEndedAt(election.questions)
      if (!canceledAt) return t('votes.header.line.canceled', { defaultValue: 'The votes were discarded.' })
      if (byQuestion) {
        return t('votes.header.line.by_question_canceled', {
          defaultValue: 'On {{day}} at {{time}}. The votes were discarded.',
          day: shortDate(canceledAt),
          time: time(canceledAt),
        })
      }
      return isSameDay(canceledAt, now)
        ? t('votes.header.line.canceled_today', {
            defaultValue: 'Today, {{day}}, at {{time}}. The votes were discarded.',
            day: day(canceledAt),
            time: time(canceledAt),
          })
        : t('votes.header.line.canceled_on', {
            defaultValue: '{{date}}. The votes were discarded.',
            date: upper(dateAt(canceledAt)),
          })
    }
    default:
      return ''
  }
}

const StatusLine = (props: HeaderPartProps) => {
  const line = useStatusLine(props)
  return (
    <Flex
      gridArea='line'
      wrap='wrap'
      align='center'
      columnGap='2.5'
      rowGap={{ base: '0.5', lg: '1.5' }}
      mt={{ base: '2', lg: '2.5' }}
    >
      <ProcessStatus state={props.state} />
      <Text fontSize={{ base: 'md', lg: 'control' }} color='fg.muted'>
        {line}
      </Text>
    </Flex>
  )
}

/** The boards' action matrix: which buttons each state shows, in order, and which one is primary. */
const VoteActions = ({ election, state }: HeaderPartProps) => {
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()
  // Equal parts on phones (the row spans the page); natural width from md.
  const fill = { base: '1', md: 'none' } as const

  if (!isQuestionByQuestion(election)) {
    return (
      <>
        {state === 'live' && <ActionPause flex={fill}>{t('votes.page.pause', { defaultValue: 'Pause' })}</ActionPause>}
        {state === 'paused' && (
          <ActionContinue flex={fill}>{t('votes.page.resume', { defaultValue: 'Resume' })}</ActionContinue>
        )}
        {(state === 'live' || state === 'paused') && (
          <ActionEnd flex={fill}>{t('votes.page.end_now', { defaultValue: 'End now' })}</ActionEnd>
        )}
      </>
    )
  }

  const endVote = t('votes.page.end_vote', { defaultValue: 'End the vote' })
  switch (state) {
    case 'live': {
      // Pausing needs an open question to hold; the phone board has no "Pause the vote". A vote whose questions are
      // all closed is closed (R22), so ending is never the only step left here.
      const canPause = isDesktop && election.questions.some((question) => question.status === 'ONGOING')
      return (
        <>
          {canPause && <ActionPause>{t('votes.page.pause_vote', { defaultValue: 'Pause the vote' })}</ActionPause>}
          <ActionEnd variant='outline' flex={fill}>
            {endVote}
          </ActionEnd>
        </>
      )
    }
    case 'paused':
      return (
        <>
          <ActionContinue flex={fill}>
            {t('votes.page.resume_vote', { defaultValue: 'Resume the vote' })}
          </ActionContinue>
          <ActionEnd flex={fill}>{endVote}</ActionEnd>
        </>
      )
    case 'closed':
      return (
        <Button asChild variant='solid' flex={fill}>
          <RouterLink to={generatePath(Routes.dashboard.processResults, { id: election.id })}>
            {t('votes.page.show_results', { defaultValue: 'Show the results' })}
          </RouterLink>
        </Button>
      )
    default:
      return null
  }
}

/** "More": a labelled dropdown on the desktop, the "…" button and a sheet on touch screens. */
const VoteMenu = ({ election, state }: HeaderPartProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const { canManage } = useActions()
  const isDesktop = useIsDesktop()
  const { cloneAsDraft } = useCloneAsDraft()
  const publicLanguage = usePublicLanguage()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const pdf = useVotingReportPdfDownload(election)
  const stateLabel = useProcessStateLabel()
  const [cancelling, setCancelling] = useState(false)

  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const explorerProcessId = election.questions[0]?.upstreamId
  // Once a question is closed with a result the backend can only end the vote, not void it (audit F1).
  const hasClosedQuestion = election.questions.some((question) => isTerminalQuestion(question))
  const canCancel = canManage && !hasClosedQuestion && state !== 'closed' && state !== 'canceled'
  const moreActions = t('votes.page.more_actions', { defaultValue: 'More actions' })

  const items: ResponsiveMenuItem[] = [
    {
      value: 'show-as-voter',
      label: t('votes.page.show_as_voter', { defaultValue: 'Show as voter' }),
      icon: ViewIcon,
      href: getPublicProcessPath({ id: election.id, language: publicLanguage }),
    },
    ...(canManage
      ? [
          {
            value: 'duplicate',
            // "Duplicate the vote" in the desktop menu, "Duplicate" in the phone sheet.
            label: isDesktop
              ? t('votes.page.duplicate_vote', { defaultValue: 'Duplicate the vote' })
              : t('votes.page.duplicate', { defaultValue: 'Duplicate' }),
            icon: CopyIcon,
            onSelect: () => void cloneAsDraft(election),
          },
        ]
      : []),
    ...(pdf.report || pdf.isPendingResults
      ? [
          {
            value: 'download-pdf',
            label: t('process_pdf.download', { defaultValue: 'Election report (PDF)' }),
            icon: DownloadFileIcon,
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
            icon: ExternalLinkIcon,
            href: `${explorerUrl}/process/${explorerProcessId}`,
          },
        ]
      : []),
    ...(canCancel
      ? [
          {
            value: 'cancel',
            label: t('votes.page.cancel_vote', { defaultValue: 'Cancel the vote' }),
            icon: CancelIcon,
            onSelect: () => setCancelling(true),
            danger: true,
          },
        ]
      : []),
  ]

  return (
    <>
      <ResponsiveMenu
        label={moreActions}
        title={text(election.title)}
        subtitle={stateLabel(state)}
        trigger={
          isDesktop ? (
            <Button variant='dropdown'>
              {t('votes.page.more', { defaultValue: 'More' })}
              <Icon as={ChevronDownIcon} />
            </Button>
          ) : (
            <IconButton variant='ghost' aria-label={moreActions}>
              <MoreIcon />
            </IconButton>
          )
        }
        items={items}
      />
      {canCancel && <CancelVoteDialog open={cancelling} onClose={() => setCancelling(false)} />}
    </>
  )
}

/** Back link, title, state and the actions of one vote. The actions go under the title on phones. */
export const VoteHeader = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { votePause } = useActions()
  const now = useNow()
  const { text } = useVoteText()

  if (!election) return null

  // A question-by-question vote paused as a whole has no state of its own in the API: the pause memory gives it.
  const state = votePause.isHeld ? 'paused' : deriveVoteState(election, now)
  const part: HeaderPartProps = { election, state, now }

  return (
    // Phone: everything stacked, the actions on a row of their own. Tablet: the actions beside the title and its
    // state line. Desktop: the actions beside the title, the state line under both.
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' }}
      templateAreas={{
        base: '"back" "title" "line" "actions"',
        md: '"back back" "title actions" "line actions"',
        lg: '"back back" "title actions" "line line"',
      }}
      columnGap='4'
      alignItems='end'
    >
      {/* A 44px hit area below lg, pulled into the page's top padding as the phone board does. */}
      <Link
        asChild
        variant='back'
        gridArea='back'
        justifySelf='start'
        mt={{ base: '-3', lg: '0' }}
        ms={{ base: '-1', lg: '0' }}
        mb={{ base: '0.5', lg: '1.5' }}
      >
        <RouterLink to={Routes.dashboard.processes.base}>
          <Icon as={ChevronLeftIcon} display={{ lg: 'none' }} />
          {t('votes.page.back', { defaultValue: 'Votes' })}
        </RouterLink>
      </Link>
      <PageTitle textStyle='vote-title' gridArea='title' minW='0'>
        {text(election.title)}
      </PageTitle>
      <StatusLine {...part} />
      <Flex gridArea='actions' gap='2' mt={{ base: '4', md: '0' }} alignItems='center'>
        <VoteActions {...part} />
        <VoteMenu {...part} />
      </Flex>
    </Grid>
  )
}
