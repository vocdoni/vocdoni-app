import { Button, Card, Flex, Grid, HStack, Icon, IconButton, Link, Progress, Stack, Text } from '@chakra-ui/react'
import { isBeforeStart, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, Navigate } from 'react-router'
import { useActions } from '~components/Actions/ActionsContext'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { SectionHeader } from '~components/ui/SectionHeader'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { useCanManageVotes } from '~queries/votes'
import { useQuestionStatusAction } from '~queries/question-status'
import { Routes } from '~routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { ChevronDownIcon, LockIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { useNow } from '~utils/use-now'
import { questionOutcome } from '~utils/vote-outcome'
import {
  countQuestionStates,
  deriveQuestionState,
  deriveVoteState,
  hasEndedBySchedule,
  nextQuestionStep,
  percentOf,
  questionElectorate,
  type QuestionState,
} from '~utils/vote-state'
import { QuestionResultBars } from './QuestionResultBars'

const HEADING_ID = 'vote-manage-questions'

type Closing = { question: VotingProcessQuestion; number: number }

/** The Gestió tab of a question-by-question vote: open, pause and close each question and follow it. */
export const VoteManage = () => {
  const { t, i18n } = useTranslation()
  const { election, results } = useElection()
  const { text, longDate, outcome } = useVoteText()
  const now = useNow()
  const { change, pending, isBusy } = useQuestionStatusAction(election?.id)
  const { disabled: headerBusy } = useActions()
  const canManage = useCanManageVotes()
  const [shown, setShown] = useState<Record<string, boolean>>({})
  const [closing, setClosing] = useState<Closing | null>(null)

  const states = useMemo(
    () => (election ? election.questions.map((question) => deriveQuestionState(question, election, now)) : []),
    [election, now]
  )

  if (!election) return null
  if (!isQuestionByQuestion(election)) {
    return <Navigate to={generatePath(Routes.dashboard.process, { id: election.id })} replace />
  }

  const busy = isBusy || headerBusy
  const started = !isBeforeStart(election.startDate, now)
  const ended = hasEndedBySchedule(election, now)
  const weighted = !!election.census?.weighted
  const total = election.census?.size
  const voted = processVoteCount(results)
  const percent = percentOf(voted, total)
  const end = resolveEndDate(election)
  const counts = countQuestionStates(states)
  const step = ended ? null : nextQuestionStep(states)
  const list = (numbers: number[]) =>
    new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(numbers.map(String))

  const countParts = [
    counts.closed > 0 &&
      t('votes.manage.count.closed', {
        defaultValue_one: '{{count}} closed',
        defaultValue_other: '{{count}} closed',
        count: counts.closed,
      }),
    counts.open > 0 &&
      t('votes.manage.count.open', {
        defaultValue_one: '{{count}} open',
        defaultValue_other: '{{count}} open',
        count: counts.open,
      }),
    counts.paused > 0 &&
      t('votes.manage.count.paused', {
        defaultValue_one: '{{count}} paused',
        defaultValue_other: '{{count}} paused',
        count: counts.paused,
      }),
    counts.toOpen > 0 &&
      t('votes.manage.count.to_open', {
        defaultValue_one: '{{count}} to open',
        defaultValue_other: '{{count}} to open',
        count: counts.toOpen,
      }),
  ].filter(Boolean)

  let next: string | null = null
  if (step) {
    const numbers = list(step.numbers)
    const count = step.numbers.length
    next =
      step.action === 'close'
        ? t('votes.manage.next.close', {
            defaultValue_one: 'Next: close question {{numbers}}',
            defaultValue_other: 'Next: close questions {{numbers}}',
            count,
            numbers,
          })
        : step.action === 'open'
          ? t('votes.manage.next.open', { defaultValue: 'Next: open question {{numbers}}', numbers })
          : t('votes.manage.next.resume', { defaultValue: 'Next: resume question {{numbers}}', numbers })
  }
  const description = countParts.join(' · ')

  const confirmClose = async () => {
    if (!closing) return
    await change({ questionId: closing.question.id, status: 'ended' })
    setClosing(null)
  }

  const isLoading = (question: VotingProcessQuestion, status: 'ready' | 'paused' | 'ended') =>
    pending?.questionId === question.id && pending.status === status

  const renderButtons = (question: VotingProcessQuestion, number: number, state: QuestionState) => {
    if (!canManage || ended || state === 'closed' || state === 'canceled') return null
    const run = (status: 'ready' | 'paused') => () => void change({ questionId: question.id, status })
    const close = (
      <Button
        size='sm'
        flex={{ base: '1', md: 'none' }}
        loading={isLoading(question, 'ended')}
        disabled={busy}
        onClick={() => setClosing({ question, number })}
      >
        {t('votes.manage.close', { defaultValue: 'Close' })}
      </Button>
    )
    if (state === 'toOpen') {
      return (
        <Button
          variant='outline'
          size='sm'
          flexShrink={0}
          loading={isLoading(question, 'ready')}
          disabled={busy || !started}
          onClick={run('ready')}
        >
          {t('votes.manage.open', { defaultValue: 'Open' })}
        </Button>
      )
    }
    const isOpen = state === 'open'
    return (
      <HStack gap='2' w={{ base: 'full', md: 'auto' }} flexShrink={0}>
        <Button
          variant='outline'
          size='sm'
          flex={{ base: '1', md: 'none' }}
          loading={isLoading(question, isOpen ? 'paused' : 'ready')}
          disabled={busy}
          onClick={run(isOpen ? 'paused' : 'ready')}
        >
          {isOpen
            ? t('votes.manage.pause', { defaultValue: 'Pause' })
            : t('votes.manage.resume', { defaultValue: 'Resume' })}
        </Button>
        {close}
      </HStack>
    )
  }

  const renderClosed = (question: VotingProcessQuestion, number: number, state: QuestionState) => {
    const questionResults = question.results
    const count = questionResults?.voteCount ?? 0
    const turnout = percentOf(count, questionElectorate(question, election))
    const toggleId = `vote-manage-result-${question.id}`
    const open = !!shown[question.id]
    const summary = [
      outcome(questionOutcome(question, questionResults, { weighted })),
      turnout !== undefined
        ? t('votes.manage.turnout', { defaultValue: '{{percent}}% turnout', percent: turnout })
        : null,
    ]
      .filter(Boolean)
      .join(' · ')
    return (
      <Stack gap='3' minW='0'>
        {/* One line from lg: title, result, state and the disclosure; below lg the result drops under the title. */}
        <Flex align='center' gap='3'>
          <Stack gap='0.5' flex='1' minW='0'>
            <Text textStyle='item-title' lineClamp={{ base: 2, lg: 1 }}>
              {text(question.title)}
            </Text>
            <Text textStyle='meta' color='fg.subtle' display={{ lg: 'none' }}>
              {summary}
            </Text>
          </Stack>
          <Text textStyle='meta' color='fg.subtle' display={{ base: 'none', lg: 'block' }} whiteSpace='nowrap'>
            {summary}
          </Text>
          <ProcessStatus kind='question' state={state} display={{ base: 'none', md: 'inline-flex' }} />
          <IconButton
            variant='disclosure'
            size='sm'
            aria-expanded={open}
            aria-controls={toggleId}
            aria-label={t('votes.manage.toggle_result', {
              defaultValue: 'Show the result of question {{number}}',
              number,
            })}
            onClick={() => setShown((current) => ({ ...current, [question.id]: !open }))}
          >
            <Icon as={ChevronDownIcon} />
          </IconButton>
        </Flex>
        <div id={toggleId} hidden={!open}>
          {open && <QuestionResultBars question={question} results={questionResults} />}
        </div>
      </Stack>
    )
  }

  const renderWaiting = (question: VotingProcessQuestion, number: number, state: QuestionState) => (
    <Stack gap='2' minW='0'>
      <Flex align='center' gap='3'>
        <Text textStyle='item-title' color='fg.muted' flex='1' minW='0' lineClamp={{ base: 2, lg: 1 }}>
          {text(question.title)}
        </Text>
        <ProcessStatus kind='question' state={state} />
        {renderButtons(question, number, state)}
      </Flex>
      {state === 'toOpen' && !started && canManage && !ended && (
        <Text textStyle='meta' color='fg.subtle'>
          {t('votes.manage.starts', { defaultValue: 'The vote starts {{date}}.', date: longDate(election.startDate) })}
        </Text>
      )}
    </Stack>
  )

  const renderActive = (question: VotingProcessQuestion, number: number, state: QuestionState) => {
    const electorate = questionElectorate(question, election)
    const count = question.results?.voteCount ?? 0
    const share = percentOf(count, electorate)
    const buttons = renderButtons(question, number, state)
    return (
      <Stack gap='3' minW='0'>
        <Stack gap='0.5'>
          <Flex align='baseline' justify='space-between' gap='3'>
            <Text as='h3' textStyle='item-title'>
              {text(question.title)}
            </Text>
            <ProcessStatus kind='question' state={state} />
          </Flex>
          {question.description && (
            <Text textStyle='meta' color='fg.subtle' lineClamp={3}>
              {text(question.description)}
            </Text>
          )}
        </Stack>
        <TurnoutBar
          caption={t('votes.manage.question_voted', {
            defaultValue: '{{voted}} of {{total}} voted',
            voted: quantity(count),
            total: electorate ? quantity(electorate) : '?',
          })}
          share={
            share !== undefined ? t('votes.list.percent', { defaultValue: '{{percent}}%', percent: share }) : undefined
          }
          value={count}
          max={electorate}
          label={t('votes.manage.question_ruler', {
            defaultValue: 'Question {{number}}: {{voted}} of {{total}} voted',
            number,
            voted: quantity(count),
            total: electorate ? quantity(electorate) : '?',
          })}
        />
        {(question.secretUntilTheEnd || buttons) && (
          // The note on the left and the buttons on the right; on a phone the buttons take the row, in equal parts.
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} gap='3'>
            <HStack gap='2' color='fg.subtle' flex='1' minW='0'>
              {question.secretUntilTheEnd && (
                <>
                  <Icon as={LockIcon} />
                  <Text textStyle='meta'>
                    {t('votes.manage.locked', { defaultValue: 'Results show when the question closes.' })}
                  </Text>
                </>
              )}
            </HStack>
            {buttons}
          </Flex>
        )}
      </Stack>
    )
  }

  return (
    <Stack gap={{ base: '4', md: '6' }}>
      <Stack gap='2'>
        <Card.Root variant='frame'>
          <Card.Body>
            <Flex wrap='wrap' align='center' columnGap={{ base: '3', lg: '5' }} rowGap='2'>
              <ProcessStatus state={deriveVoteState(election, now)} />
              <Text textStyle='control' fontWeight='medium-plus'>
                {t('votes.manage.voted_any', {
                  defaultValue: 'At least {{voted}} of {{total}} voted on a question',
                  voted: quantity(voted),
                  total: total ? quantity(total) : '?',
                })}
              </Text>
              {/* A plain bar: the strip only says how far the vote has got; the Summary tab has the scale. */}
              <Progress.Root
                variant='turnout'
                value={total ? Math.min(percent ?? 0, 100) : 0}
                flex='1'
                minW='20'
                translations={{
                  value: () =>
                    t('votes.manage.ruler_label', {
                      defaultValue: '{{voted}} of {{total}} voted on at least one question',
                      voted: quantity(voted),
                      total: total ? quantity(total) : '?',
                    }),
                }}
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              {percent !== undefined && (
                <Text textStyle='figure' color='fg.subtle'>
                  {t('votes.list.percent', { defaultValue: '{{percent}}%', percent })}
                </Text>
              )}
              <Link asChild>
                <RouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
                  {t('votes.manage.summary_link', { defaultValue: 'Summary' })}
                </RouterLink>
              </Link>
            </Flex>
          </Card.Body>
        </Card.Root>
        {end && (
          <Text textStyle='meta' color='fg.subtle'>
            {ended
              ? t('votes.manage.closed', { defaultValue: 'The vote closed on {{date}}.', date: longDate(end) })
              : t('votes.manage.closes', {
                  defaultValue: 'The vote closes {{date}}. Questions you have not closed will close then.',
                  date: longDate(end),
                })}
          </Text>
        )}
      </Stack>

      <Card.Root variant='frame' as='section' aria-labelledby={HEADING_ID}>
        <Card.Header>
          <SectionHeader
            title={
              <>
                <span id={HEADING_ID}>{t('process.questions', { defaultValue: 'Questions' })}</span>{' '}
                <Text as='span' textStyle='figure' fontWeight='normal' color='fg.subtle'>
                  {quantity(election.questions.length)}
                </Text>
              </>
            }
            description={description || undefined}
            actions={
              next ? (
                <Text textStyle='meta' color='fg.subtle'>
                  {next}
                </Text>
              ) : undefined
            }
          />
        </Card.Header>
        {election.questions.map((question, index) => {
          const state = states[index]
          const number = index + 1
          const active = state === 'open' || state === 'paused'
          return (
            <Card.Body key={question.id} data-current={active ? '' : undefined}>
              <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]' columnGap='2'>
                <Text textStyle='figure' color={active ? 'accent.fg' : 'fg.subtle'} mt='0.5'>
                  {number}
                </Text>
                {state === 'closed' || state === 'canceled'
                  ? renderClosed(question, number, state)
                  : active
                    ? renderActive(question, number, state)
                    : renderWaiting(question, number, state)}
              </Grid>
            </Card.Body>
          )
        })}
      </Card.Root>

      <ConfirmDialog
        open={!!closing}
        onOpenChange={({ open }) => !open && !isBusy && setClosing(null)}
        title={t('votes.manage.close_title', { defaultValue: 'Close question {{number}}?', number: closing?.number })}
        description={
          closing
            ? t('votes.manage.close_body', {
                defaultValue_one:
                  '“{{title}}” will close with the {{count}} vote it has now and its result becomes final. A closed question cannot be reopened.',
                defaultValue_other:
                  '“{{title}}” will close with the {{count}} votes it has now and its result becomes final. A closed question cannot be reopened.',
                title: text(closing.question.title),
                count: closing.question.results?.voteCount ?? 0,
              })
            : undefined
        }
        confirmText={t('votes.manage.close_confirm', {
          defaultValue: 'Close question {{number}}',
          number: closing?.number,
        })}
        cancelText={t('votes.manage.close_cancel', { defaultValue: 'Keep it open' })}
        onConfirm={confirmClose}
        onCancel={() => setClosing(null)}
        cancelDisabled={isBusy}
        loading={!!closing && isLoading(closing.question, 'ended')}
      />
    </Stack>
  )
}
