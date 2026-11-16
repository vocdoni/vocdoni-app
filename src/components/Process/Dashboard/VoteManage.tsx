import { Button, Card, Flex, Grid, HStack, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import { isBeforeStart, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, Navigate } from 'react-router'
import { useActions } from '~components/Actions/ActionsContext'
import { CensusRuler } from '~components/ui/CensusRuler'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { SectionHeader } from '~components/ui/SectionHeader'
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
  const description = [...countParts, next].filter(Boolean).join(' · ')

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
        <HStack gap='2' w={{ base: 'full', md: 'auto' }} justify='flex-end' wrap='wrap'>
          {!started && (
            <Text textStyle='caption' color='fg.subtle'>
              {t('votes.manage.starts', {
                defaultValue: 'The vote starts {{date}}.',
                date: longDate(election.startDate),
              })}
            </Text>
          )}
          <Button
            variant='outline'
            size='sm'
            w={{ base: 'full', md: 'auto' }}
            loading={isLoading(question, 'ready')}
            disabled={busy || !started}
            onClick={run('ready')}
          >
            {t('votes.manage.open', { defaultValue: 'Open' })}
          </Button>
        </HStack>
      )
    }
    const isOpen = state === 'open'
    return (
      <HStack gap='2' w={{ base: 'full', md: 'auto' }} justify='flex-end'>
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

  const renderDetails = (question: VotingProcessQuestion, number: number, state: QuestionState) => {
    const questionResults = question.results
    const electorate = questionElectorate(question, election)
    const count = questionResults?.voteCount ?? 0
    const toggleId = `vote-manage-result-${question.id}`
    if (state === 'closed') {
      const summary = outcome(questionOutcome(question, questionResults, { weighted }))
      const turnout = percentOf(count, electorate)
      const open = !!shown[question.id]
      return (
        <>
          <HStack gap='2'>
            <Text textStyle='body-sm' color='fg.subtle'>
              {[
                summary,
                turnout !== undefined
                  ? t('votes.manage.turnout', { defaultValue: '{{percent}}% turnout', percent: turnout })
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
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
          </HStack>
          <div id={toggleId} hidden={!open}>
            {open && <QuestionResultBars question={question} results={questionResults} />}
          </div>
        </>
      )
    }
    if (state !== 'open') return null
    return (
      <Stack gap='3'>
        {question.description && (
          <Text textStyle='body-sm' color='fg.muted' lineClamp={3}>
            {text(question.description)}
          </Text>
        )}
        <Stack gap='1' maxW={{ md: 'turnout.max' }}>
          <Text textStyle='caption' color='fg.subtle'>
            {t('votes.manage.question_voted', {
              defaultValue: '{{count}} of {{total}} voted',
              count: quantity(count),
              total: electorate ? quantity(electorate) : '?',
            })}
          </Text>
          <CensusRuler
            value={count}
            max={electorate}
            label={t('votes.manage.question_ruler', {
              defaultValue: 'Question {{number}}: {{count}} of {{total}} voted',
              number,
              count: quantity(count),
              total: electorate ? quantity(electorate) : '?',
            })}
          />
        </Stack>
        {question.secretUntilTheEnd && (
          <HStack gap='2' color='fg.subtle'>
            <Icon as={LockIcon} />
            <Text textStyle='body-sm'>
              {t('votes.manage.locked', { defaultValue: 'Results show when the question closes.' })}
            </Text>
          </HStack>
        )}
      </Stack>
    )
  }

  return (
    <Stack gap='6'>
      <Card.Root variant='frame'>
        <Card.Body>
          <Flex wrap='wrap' align='center' gap='4'>
            <ProcessStatus state={deriveVoteState(election, now)} />
            <Text textStyle='control'>
              {t('votes.manage.voted_any', {
                defaultValue: 'At least {{count}} of {{total}} voted on a question',
                count: quantity(voted),
                total: total ? quantity(total) : '?',
              })}
            </Text>
            <CensusRuler
              flex='1'
              minW='48'
              value={voted}
              max={total}
              label={t('votes.manage.ruler_label', {
                defaultValue: '{{count}} of {{total}} voted on at least one question',
                count: quantity(voted),
                total: total ? quantity(total) : '?',
              })}
            />
            {percent !== undefined && (
              <Text textStyle='figure' color='fg.subtle'>
                {percent}%
              </Text>
            )}
            <Link asChild>
              <RouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
                {t('votes.manage.summary_link', { defaultValue: 'Summary' })}
              </RouterLink>
            </Link>
          </Flex>
          {end && (
            <Text textStyle='body-sm' color='fg.subtle' mt='2'>
              {ended
                ? t('votes.manage.closed', { defaultValue: 'The vote closed on {{date}}.', date: longDate(end) })
                : t('votes.manage.closes', {
                    defaultValue: 'The vote closes {{date}}. Questions you have not closed will close then.',
                    date: longDate(end),
                  })}
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      <Card.Root variant='frame' as='section' aria-labelledby={HEADING_ID}>
        <Card.Header>
          <SectionHeader
            title={<span id={HEADING_ID}>{t('process.questions', { defaultValue: 'Questions' })}</span>}
            description={description || undefined}
          />
        </Card.Header>
        {election.questions.map((question, index) => {
          const state = states[index]
          const number = index + 1
          const active = state === 'open' || state === 'paused'
          return (
            <Card.Body key={question.id} data-current={active ? '' : undefined}>
              <Grid
                templateColumns={{
                  base: '[{sizes.6} minmax(0, 1fr)]',
                  md: '[{sizes.6} minmax(0, 1fr) auto]',
                }}
                columnGap='3'
                rowGap='2'
              >
                <Text textStyle='figure' color={active ? 'accent.fg' : 'fg.subtle'}>
                  {number}
                </Text>
                <Stack gap='2' minW='0'>
                  <Text textStyle='control' fontWeight={active ? 'medium-plus' : undefined}>
                    {text(question.title)}
                  </Text>
                  {renderDetails(question, number, state)}
                </Stack>
                <Stack gap='2' gridColumn={{ base: '2', md: 'auto' }} align={{ base: 'stretch', md: 'flex-end' }}>
                  <ProcessStatus kind='question' state={state} />
                  {renderButtons(question, number, state)}
                </Stack>
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
