import { Box, Card, VisuallyHidden } from '@chakra-ui/react'
import { isBeforeStart } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionContinue } from '~components/Actions'
import { useActions } from '~components/Actions/ActionsContext'
import { useProcessStateLabel } from '~components/ui/ProcessStatus'
import { useIsMobile } from '~components/ui/useIsMobile'
import { useVoteText } from '~i18n/use-vote-text'
import { useQuestionStatusAction } from '~queries/question-status'
import { useRemembered } from '~queries/vote-pause'
import { hasEndedBySchedule, isLastQuestionLeft, openQuestionBlock, questionElectorate } from '~utils/vote-state'
import { ActiveQuestionRow } from './ActiveQuestionRow'
import { ClosedQuestionRow } from './ClosedQuestionRow'
import { CloseQuestionDialog } from './CloseQuestionDialog'
import { ActiveButtons, OpenButton, type QuestionControls } from './QuestionButtons'
import { QuestionDock } from './QuestionDock'
import { QuestionsHeader } from './QuestionsHeader'
import { countRows, deriveRowState, isActiveRow, isStepFor, nextManageStep, type RowState } from './row-state'
import { useManageText } from './use-manage-text'
import { WaitingQuestionRow } from './WaitingQuestionRow'

// The board drops the next step when it and the counts would not fit the header's one line.
const HEADER_CHARS = 72

/**
 * Resum's questions card for a question-by-question vote (V4VoteOne, M4VoteOne): every question with its state and
 * result, the open one with its turnout and buttons, and on a phone a bottom bar with the active question's buttons.
 * Opening, pausing and closing run through the shared status runner; one question is open at a time (R29).
 */
export type ByQuestionCardProps = {
  /** The questions as Resum shows them (the served tally merged in), in the process read's order. */
  questions: VotingProcessQuestion[]
  /** A line under the header ("The results are being counted"). */
  notice?: ReactNode
  desktop: boolean
}

export const ByQuestionCard = ({ questions, notice, desktop }: ByQuestionCardProps) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { dateAt, text } = useVoteText()
  const manageText = useManageText()
  const stateLabel = useProcessStateLabel()
  const phone = useIsMobile({ ssr: false })
  const { change, pending, isBusy } = useQuestionStatusAction(election?.id)
  const { votePause, canManage, state: voteState, now } = useActions()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  // Only the question's id: the dialog reads the live question, so votes arriving while it is open count.
  const [closingId, setClosingId] = useState<string | null>(null)
  const remembered = useRemembered(election?.id)
  const headingId = useId()
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

  const started = !isBeforeStart(election.startDate, now)
  const ended = hasEndedBySchedule(election, now)
  const canceled = voteState === 'canceled'
  const underWay = started && !ended && !canceled
  const isHeld = votePause.isHeld
  const step = underWay ? nextManageStep(states, isHeld) : null
  const canAct = canManage && underWay && !isHeld
  const weighted = !!election.census?.weighted

  // The board counts states only once the vote has started; the touch boards name the two cases with none.
  let cardCounts = ''
  if (canceled) cardCounts = desktop ? '' : t('votes.summary.no_results', { defaultValue: 'no results' })
  else if (!started) cardCounts = desktop ? '' : t('votes.summary.none_open', { defaultValue: 'none open' })
  else cardCounts = manageText.counts(counts, desktop)

  let next: string | null = null
  if (canManage && step) next = manageText.next(step)
  // There is no "start now": before the start the hint says when it begins.
  else if (canManage && !started && !canceled)
    next = t('votes.manage.starts', { defaultValue: 'The vote starts {{date}}.', date: dateAt(election.startDate) })
  if (next && cardCounts.length + next.length > HEADER_CHARS) next = null

  const numberOf = (questionId: string) => election.questions.findIndex(({ id }) => id === questionId) + 1
  const titleOf = (questionId: string) => text(election.questions.find(({ id }) => id === questionId)?.title)
  const controls: QuestionControls = {
    // Every status change of this vote (header, whole-vote pause, any row) shares one busy flag.
    busy: isBusy,
    isLoading: (questionId, status) => pending?.questionId === questionId && pending.status === status,
    run: (questionId, status) => void change({ questionId, status }),
    askClose: (questionId) => setClosingId(questionId),
    name: (questionId, action) =>
      t('votes.manage.action_label', {
        defaultValue: '{{action}}: question {{number}}, {{title}}',
        action,
        number: numberOf(questionId),
        title: titleOf(questionId),
      }),
  }

  const closingIndex = closingId ? election.questions.findIndex(({ id }) => id === closingId) : -1
  const closing = closingIndex >= 0 ? { question: election.questions[closingIndex], number: closingIndex + 1 } : null

  const confirmClose = async () => {
    if (!closing) return
    await change({ questionId: closing.question.id, status: 'ended' })
    setClosingId(null)
  }

  const toggle = (id: string) => () => setExpanded((current) => ({ ...current, [id]: !current[id] }))
  // One question open at a time (R29): Open (or Resume) is the `off` button on the others, and says why.
  const offs = election.questions.map((question) => {
    const block = openQuestionBlock(election, question, now, remembered)
    return block === 'otherActive' || block === 'beforeStart'
  })
  const openable = (state: RowState) => state === 'toOpen' && canManage && !canceled && !ended
  // Before the start and while the vote is paused the desktop board leaves Open out; the touch boards show it off.
  const touchOnly = !started || isHeld

  const activeButtons = (question: VotingProcessQuestion, index: number, state: RowState) => (
    <ActiveButtons
      questionId={question.id}
      controls={controls}
      paused={state === 'paused'}
      resumePrimary={isStepFor(step, 'resume', index + 1)}
      resumeOff={offs[index]}
      reasonId={reasonId}
    />
  )
  const openButton = (question: VotingProcessQuestion, index: number, size?: 'md') => (
    <OpenButton
      questionId={question.id}
      controls={controls}
      primary={isStepFor(step, 'open', index + 1)}
      touchOnly={touchOnly}
      off={offs[index]}
      reasonId={reasonId}
      size={size}
    />
  )

  // The phone's bottom bar: the vote's pause, else the active question, else the next one to open. None before the
  // start (the API has no "start now"), once it is over, or for someone who cannot change it.
  let dock: { title: string; note?: string; buttons: ReactNode } | null = null
  if (phone && canManage && underWay) {
    const activeIndex = states.findIndex((state) => state === 'open' || state === 'paused')
    const dockTitle = (index: number) =>
      t('votes.summary.dock.title', {
        defaultValue: '{{number}}. {{title}}',
        number: index + 1,
        title: text(election.questions[index].title),
      })
    if (isHeld) {
      dock = {
        title: t('votes.summary.dock.vote_paused', { defaultValue: 'Vote paused' }),
        buttons: (
          <ActionContinue flex='1'>{t('votes.page.resume_vote', { defaultValue: 'Resume the vote' })}</ActionContinue>
        ),
      }
    } else if (activeIndex >= 0) {
      const state = states[activeIndex]
      const question = questions[activeIndex]
      dock = {
        title: dockTitle(activeIndex),
        note:
          state === 'open'
            ? t('votes.summary.dock.state_votes', {
                defaultValue: '{{state}}, {{votes}}',
                state: stateLabel('open', 'question'),
                votes: t('votes.summary.question_votes', {
                  defaultValue_one: '{{count, number}} vote',
                  defaultValue_other: '{{count, number}} votes',
                  count: question.results?.voteCount ?? 0,
                }),
              })
            : stateLabel('paused', 'question'),
        buttons: activeButtons(question, activeIndex, state),
      }
    } else if (step?.action === 'open') {
      const index = step.numbers[0] - 1
      dock = {
        title: dockTitle(index),
        note: stateLabel('toOpen', 'question'),
        buttons: openButton(questions[index], index, 'md'),
      }
    }
  }

  return (
    <>
      <Card.Root variant='frame' as='section' aria-labelledby={headingId}>
        <QuestionsHeader
          headingId={headingId}
          total={election.questions.length}
          counts={cardCounts}
          next={next}
          desktop={desktop}
        />
        {notice}
        <Box as='ol'>
          {questions.map((question, index) => {
            const state = states[index]
            const common = { question, number: index + 1, desktop }
            if (state === 'closed') {
              return (
                <ClosedQuestionRow
                  key={question.id}
                  {...common}
                  electorate={questionElectorate(question, election, canManage)}
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
                  electorate={questionElectorate(question, election, canManage)}
                  weighted={weighted}
                  buttons={canAct && activeButtons(question, index, state)}
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
                action={openable(state) && openButton(question, index)}
              />
            )
          })}
        </Box>
      </Card.Root>
      {/* What an `off` Open or Resume describes itself with; the boards draw it nowhere. */}
      <VisuallyHidden id={reasonId}>
        {t('votes.manage.one_open_note', {
          defaultValue:
            'Only one question can be open at a time: while one is, “Open” is disabled on the others. Before the start time, too.',
        })}
      </VisuallyHidden>
      {dock && (
        <QuestionDock title={dock.title} note={dock.note}>
          {dock.buttons}
        </QuestionDock>
      )}
      <CloseQuestionDialog
        closing={closing}
        last={!!closing && isLastQuestionLeft(election, closing.question.id)}
        onConfirm={confirmClose}
        onCancel={() => setClosingId(null)}
        loading={!!closing && controls.isLoading(closing.question.id, 'ended')}
        busy={isBusy}
      />
    </>
  )
}
