import { Button, type ButtonProps } from '@chakra-ui/react'
import { useConfirm, useElection } from '@vocdoni/react-components'
import { isUpcoming } from '@vocdoni/api-client'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { deriveQuestionState, isTerminalQuestion } from '~utils/vote-state'
import { useActions } from './ActionsContext'
import { ConfirmActionModal } from './ConfirmActionModal'

const trackProcessAction = (action: string, election: { id?: string } | null | undefined) =>
  trackAnalyticsEvent({
    name: AnalyticsEvents.ProcessAction,
    props: { action, election_id: election?.id ?? 'unknown' },
  })

export const ActionContinue = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { election, status } = useElection()
  const {
    resume,
    disabled,
    targets,
    canManage,
    loading: { continue: loading },
  } = useActions()
  const { t } = useTranslation()

  // A question-by-question vote is opened and paused question by question, in Gestió (audit F1).
  if (!election || !canManage || isQuestionByQuestion(election)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={() => {
        trackProcessAction('resume', election)
        return resume()
      }}
      disabled={disabled || !targets.length || status !== 'PAUSED'}
      variant='outline'
      {...props}
    >
      {children ?? t('actions.continue')}
    </Button>
  )
})
ActionContinue.displayName = 'ActionContinue'

export const ActionPause = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { election, status } = useElection()
  const {
    pause,
    disabled,
    targets,
    canManage,
    loading: { pause: loading },
  } = useActions()
  const { t } = useTranslation()

  // A question-by-question vote is opened and paused question by question, in Gestió (audit F1).
  if (!election || !canManage || isQuestionByQuestion(election)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={() => {
        trackProcessAction('pause', election)
        return pause()
      }}
      disabled={disabled || !targets.length || status !== 'ONGOING'}
      variant='outline'
      {...props}
    >
      {children ?? t('actions.pause')}
    </Button>
  )
})
ActionPause.displayName = 'ActionPause'

export const ActionEnd = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { confirm } = useConfirm()
  const { election } = useElection()
  const {
    end,
    disabled,
    targets,
    canManage,
    loading: { end: loading },
  } = useActions()
  const { t } = useTranslation()

  // A question-by-question vote ends every question still open or never opened: say how many of each.
  const endDescription = () => {
    if (!election || !isQuestionByQuestion(election)) return t('actions.end_description', { election })
    const now = new Date()
    const unopened = election.questions.filter(
      (question) => targets.includes(question.id) && deriveQuestionState(question, election, now) === 'toOpen'
    ).length
    const closing = t('votes.actions.end_questions', {
      defaultValue_one: '{{count}} question will close and its result becomes final.',
      defaultValue_other: '{{count}} questions will close and their results become final.',
      count: targets.length,
    })
    if (!unopened) return closing
    const never = t('votes.actions.end_questions_unopened', {
      defaultValue_one: '{{count}} of them was never opened and stays without votes.',
      defaultValue_other: '{{count}} of them were never opened and stay without votes.',
      count: unopened,
    })
    return `${closing} ${never}`
  }

  const handle = async () => {
    if (
      await confirm(
        <ConfirmActionModal
          title={t('confirm.end_process_title')}
          description={endDescription()}
          confirm={t('confirm.end_process_button')}
          cancel={t('confirm.cancel_button')}
        />
      )
    ) {
      trackProcessAction('end', election)
      await end()
    }
  }

  if (!election || !canManage) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={disabled || !targets.length || isUpcoming(election)}
      variant='outline'
      {...props}
    >
      {children ?? t('actions.end')}
    </Button>
  )
})
ActionEnd.displayName = 'ActionEnd'

export const ActionCancel = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { confirm } = useConfirm()
  const { election } = useElection()
  const {
    cancel,
    disabled,
    targets,
    canManage,
    loading: { cancel: loading },
  } = useActions()
  const { t } = useTranslation()

  const handle = async () => {
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
      trackProcessAction('cancel', election)
      await cancel()
    }
  }

  if (!election || !canManage) {
    return null
  }

  // Once a question is closed with a result, the vote can only be ended, not voided (audit F1).
  const hasClosedQuestion = election.questions.some(
    (question) => isTerminalQuestion(question) && question.status !== 'CANCELED'
  )

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={disabled || !targets.length || hasClosedQuestion}
      variant='outline'
      {...props}
    >
      {children ?? t('actions.cancel')}
    </Button>
  )
})
ActionCancel.displayName = 'ActionCancel'
