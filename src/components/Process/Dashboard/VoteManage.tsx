import { Box, Card, Stack, Text } from '@chakra-ui/react'
import { isBeforeStart, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Navigate } from 'react-router'
import { useActions } from '~components/Actions/ActionsContext'
import { useVoteText } from '~i18n/use-vote-text'
import { useQuestionStatusAction } from '~queries/question-status'
import { useVotePause } from '~queries/vote-pause'
import { useCanManageVotes } from '~queries/votes'
import { Routes } from '~routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { useNow } from '~utils/use-now'
import { deriveVoteState, hasEndedBySchedule, questionElectorate } from '~utils/vote-state'
import { ActiveQuestionRow } from './manage/ActiveQuestionRow'
import { ClosedQuestionRow } from './manage/ClosedQuestionRow'
import { CloseQuestionDialog, type ClosingQuestion } from './manage/CloseQuestionDialog'
import { ManageStrip } from './manage/ManageStrip'
import { ActiveButtons, OpenButton, type QuestionControls } from './manage/QuestionButtons'
import { QuestionsHeader } from './manage/QuestionsHeader'
import { countRows, deriveRowState, isActiveRow, isStepFor, nextManageStep } from './manage/row-state'
import { useManageText } from './manage/use-manage-text'
import { WaitingQuestionRow } from './manage/WaitingQuestionRow'

const HEADING_ID = 'vote-manage-questions'
// The board drops the next step when it and the counts would not fit the header's one line.
const HEADER_CHARS = 72

/** The Gestió tab of a question-by-question vote: open, pause and close each question and follow it. */
export const VoteManage = () => {
  const { t } = useTranslation()
  const { election, results } = useElection()
  const { dateAt } = useVoteText()
  const manageText = useManageText()
  const now = useNow()
  const { change, pending, isBusy } = useQuestionStatusAction(election?.id)
  const { disabled: headerBusy } = useActions()
  const votePause = useVotePause(election)
  const canManage = useCanManageVotes()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [closing, setClosing] = useState<ClosingQuestion | null>(null)

  // Questions held by a whole-vote pause read "Paused" with their own note, and no question can change meanwhile.
  const heldKey = votePause.isHeld ? votePause.heldQuestionIds.join() : ''
  const states = useMemo(() => {
    if (!election) return []
    const held = new Set(heldKey ? heldKey.split(',') : [])
    return election.questions.map((question) => deriveRowState(question, election, now, held))
  }, [election, now, heldKey])
  const counts = useMemo(() => countRows(states), [states])

  if (!election) return null
  if (!isQuestionByQuestion(election)) {
    return <Navigate to={generatePath(Routes.dashboard.process, { id: election.id })} replace />
  }

  const voteState = deriveVoteState(election, now)
  const started = !isBeforeStart(election.startDate, now)
  const ended = hasEndedBySchedule(election, now)
  const canceled = voteState === 'canceled'
  const underWay = started && !ended && !canceled
  const isHeld = votePause.isHeld && underWay
  const step = underWay ? nextManageStep(states, isHeld) : null
  const canAct = canManage && underWay && !isHeld
  const weighted = !!election.census?.weighted
  const voted = processVoteCount(results)
  const end = resolveEndDate(election)
  const showCounts = started && !canceled
  const cardCounts = showCounts ? manageText.counts(counts, 'card') : ''

  let next: string | null = null
  if (canManage && step) next = manageText.next(step)
  // There is no "start now": before the start the hint says when it begins.
  else if (canManage && !started && !canceled)
    next = t('votes.manage.starts', { defaultValue: 'The vote starts {{date}}.', date: dateAt(election.startDate) })
  if (next && cardCounts.length + next.length > HEADER_CHARS) next = null

  const controls: QuestionControls = {
    busy: isBusy || headerBusy || votePause.isPending,
    isLoading: (questionId, status) => pending?.questionId === questionId && pending.status === status,
    run: (questionId, status) => void change({ questionId, status }),
    askClose: (questionId) => {
      const index = election.questions.findIndex(({ id }) => id === questionId)
      if (index >= 0) setClosing({ question: election.questions[index], number: index + 1 })
    },
  }

  const confirmClose = async () => {
    if (!closing) return
    await change({ questionId: closing.question.id, status: 'ended' })
    setClosing(null)
  }

  const toggle = (id: string) => () => setExpanded((current) => ({ ...current, [id]: !current[id] }))

  return (
    <Stack gap={{ base: '3', md: '4', lg: '8' }}>
      <ManageStrip
        state={isHeld ? 'paused' : voteState}
        voted={voted}
        total={election.census?.size}
        counts={showCounts ? manageText.counts(counts, 'band') : ''}
        summaryHref={generatePath(Routes.dashboard.process, { id: election.id })}
      />
      {end && !canceled && (
        // The phone and tablet boards repeat the deadline under the band; the desktop header already says it.
        <Text textStyle='note' color='fg.subtle' display={{ lg: 'none' }}>
          {ended
            ? t('votes.manage.closed', { defaultValue: 'The vote closed on {{date}}.', date: dateAt(end) })
            : t('votes.manage.closes', {
                defaultValue: 'The vote closes {{date}}. Questions still open will close then.',
                date: dateAt(end),
              })}
        </Text>
      )}

      <Card.Root variant='frame' as='section' aria-labelledby={HEADING_ID}>
        <QuestionsHeader headingId={HEADING_ID} total={election.questions.length} counts={cardCounts} next={next} />
        <Box as='ol'>
          {election.questions.map((question, index) => {
            const state = states[index]
            const number = index + 1
            const common = { question, number }
            if (state === 'closed') {
              return (
                <ClosedQuestionRow
                  key={question.id}
                  {...common}
                  electorate={questionElectorate(question, election)}
                  weighted={weighted}
                  expanded={!!expanded[question.id]}
                  onToggle={toggle(question.id)}
                />
              )
            }
            if (isActiveRow(state)) {
              return (
                <ActiveQuestionRow
                  key={question.id}
                  {...common}
                  state={state}
                  electorate={questionElectorate(question, election)}
                  weighted={weighted}
                  buttons={
                    canAct && (
                      <ActiveButtons
                        questionId={question.id}
                        controls={controls}
                        paused={state === 'paused'}
                        resumePrimary={isStepFor(step, 'resume', number)}
                      />
                    )
                  }
                />
              )
            }
            const openable = state === 'toOpen' && canManage && !canceled && !ended && !isHeld
            return (
              <WaitingQuestionRow
                key={question.id}
                {...common}
                state={state}
                expanded={!!expanded[question.id]}
                onToggle={toggle(question.id)}
                action={
                  openable && (
                    <OpenButton
                      questionId={question.id}
                      controls={controls}
                      primary={isStepFor(step, 'open', number)}
                      beforeStart={!started}
                    />
                  )
                }
              />
            )
          })}
        </Box>
      </Card.Root>

      <CloseQuestionDialog
        closing={closing}
        onConfirm={confirmClose}
        onCancel={() => setClosing(null)}
        loading={!!closing && controls.isLoading(closing.question.id, 'ended')}
        busy={isBusy}
      />
    </Stack>
  )
}
