import { Box, Card, Stack, Text } from '@chakra-ui/react'
import { isBeforeStart, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Navigate } from 'react-router'
import { useActions } from '~components/Actions/ActionsContext'
import { useVoteText } from '~i18n/use-vote-text'
import { useQuestionStatusAction } from '~queries/question-status'
import { useRemembered } from '~queries/vote-pause'
import { Routes } from '~routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { hasEndedBySchedule, isLastQuestionLeft, openQuestionBlock, questionElectorate } from '~utils/vote-state'
import { ActiveQuestionRow } from './manage/ActiveQuestionRow'
import { ClosedQuestionRow } from './manage/ClosedQuestionRow'
import { CloseQuestionDialog } from './manage/CloseQuestionDialog'
import { ManageStrip } from './manage/ManageStrip'
import { ActiveButtons, OpenButton, type QuestionControls } from './manage/QuestionButtons'
import { QuestionsHeader } from './manage/QuestionsHeader'
import { countRows, deriveRowState, isActiveRow, isStepFor, nextManageStep, type RowState } from './manage/row-state'
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
  const { change, pending, isBusy } = useQuestionStatusAction(election?.id)
  const { votePause, canManage, state: voteState, now } = useActions()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  // Only the question's id: the dialog reads the live question, so votes arriving while it is open count.
  const [closingId, setClosingId] = useState<string | null>(null)
  const remembered = useRemembered(election?.id)
  const reasonId = useId()

  // Questions held by a whole-vote pause read "Paused" with their own note, and no question can change meanwhile.
  const { heldQuestionIds } = votePause
  const states = useMemo(() => {
    if (!election) return []
    const held = new Set(heldQuestionIds)
    return election.questions.map((question) => deriveRowState(question, election, now, held))
  }, [election, now, heldQuestionIds])
  const counts = useMemo(() => countRows(states), [states])

  if (!election) return null
  if (!isQuestionByQuestion(election)) {
    return <Navigate to={generatePath(Routes.dashboard.process, { id: election.id })} replace />
  }

  const started = !isBeforeStart(election.startDate, now)
  const ended = hasEndedBySchedule(election, now)
  const canceled = voteState === 'canceled'
  const underWay = started && !ended && !canceled
  const isHeld = votePause.isHeld
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
    // Every status change of this vote (header, whole-vote pause, any row) shares one busy flag.
    busy: isBusy,
    isLoading: (questionId, status) => pending?.questionId === questionId && pending.status === status,
    run: (questionId, status) => void change({ questionId, status }),
    askClose: (questionId) => setClosingId(questionId),
  }

  const closingIndex = closingId ? election.questions.findIndex(({ id }) => id === closingId) : -1
  const closing = closingIndex >= 0 ? { question: election.questions[closingIndex], number: closingIndex + 1 } : null

  const confirmClose = async () => {
    if (!closing) return
    await change({ questionId: closing.question.id, status: 'ended' })
    setClosingId(null)
  }

  const toggle = (id: string) => () => setExpanded((current) => ({ ...current, [id]: !current[id] }))
  // One question open at a time (R29): Open (or Resume) is the `off` button on the others, and a note says why.
  const offs = election.questions.map((question) => {
    const block = openQuestionBlock(election, question, now, remembered)
    return block === 'otherActive' || block === 'beforeStart'
  })
  const openable = (state: RowState) => state === 'toOpen' && canManage && !canceled && !ended && !isHeld
  const showsOff = states.some((state, index) => offs[index] && (openable(state) || (state === 'paused' && canAct)))

  return (
    <Stack gap={{ base: '3', md: '4', lg: '8' }}>
      <ManageStrip
        state={voteState ?? 'ready'}
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
                        resumeOff={offs[index]}
                        reasonId={reasonId}
                      />
                    )
                  }
                />
              )
            }
            return (
              <WaitingQuestionRow
                key={question.id}
                {...common}
                state={state}
                expanded={!!expanded[question.id]}
                onToggle={toggle(question.id)}
                action={
                  openable(state) && (
                    <OpenButton
                      questionId={question.id}
                      controls={controls}
                      primary={isStepFor(step, 'open', number)}
                      beforeStart={!started}
                      off={offs[index]}
                      reasonId={reasonId}
                    />
                  )
                }
              />
            )
          })}
        </Box>
      </Card.Root>
      {showsOff && (
        // The phone and tablet boards say it under the list; from `lg` it is only the off buttons' description.
        <Text id={reasonId} textStyle='note' color='fg.subtle' display={{ lg: 'none' }}>
          {t('votes.manage.one_open_note', {
            defaultValue:
              'Only one question can be open at a time: while one is, “Open” is disabled on the others. Before the start time, too.',
          })}
        </Text>
      )}

      <CloseQuestionDialog
        closing={closing}
        last={!!closing && isLastQuestionLeft(election, closing.question.id)}
        onConfirm={confirmClose}
        onCancel={() => setClosingId(null)}
        loading={!!closing && controls.isLoading(closing.question.id, 'ended')}
        busy={isBusy}
      />
    </Stack>
  )
}
