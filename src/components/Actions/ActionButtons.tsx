import { Button, type ButtonProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { useActions } from './ActionsContext'
import { EndVoteDialog } from './EndVoteDialog'
import { trackProcessAction } from './track'

// The vote header decides which of these a state shows (the boards' action matrix); each one only acts. A
// question-by-question vote pauses and resumes as a whole: every open question, then the ones that pause held.

export const ActionContinue = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { election } = useElection()
  const { resume, disabled, canManage, loading, votePause } = useActions()
  const { t } = useTranslation()

  if (!election || !canManage) return null
  const byQuestion = isQuestionByQuestion(election)

  return (
    <Button
      ref={ref}
      loading={byQuestion ? votePause.isPending : loading.continue}
      onClick={() => {
        trackProcessAction(byQuestion ? 'resume_vote' : 'resume', election)
        return byQuestion ? votePause.resume() : resume()
      }}
      disabled={disabled}
      variant='solid'
      {...props}
    >
      {children ?? t('actions.continue')}
    </Button>
  )
})
ActionContinue.displayName = 'ActionContinue'

export const ActionPause = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { election } = useElection()
  const { pause, disabled, canManage, loading, votePause } = useActions()
  const { t } = useTranslation()

  if (!election || !canManage) return null
  const byQuestion = isQuestionByQuestion(election)

  return (
    <Button
      ref={ref}
      loading={byQuestion ? votePause.isPending : loading.pause}
      onClick={() => {
        trackProcessAction(byQuestion ? 'pause_vote' : 'pause', election)
        return byQuestion ? votePause.pause() : pause()
      }}
      disabled={disabled}
      variant='outline'
      {...props}
    >
      {children ?? t('actions.pause')}
    </Button>
  )
})
ActionPause.displayName = 'ActionPause'

export const ActionEnd = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { election } = useElection()
  const {
    disabled,
    targets,
    canManage,
    loading: { end: loading },
  } = useActions()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (!election || !canManage) return null

  return (
    <>
      <Button
        ref={ref}
        loading={loading}
        onClick={() => setOpen(true)}
        disabled={disabled || !targets.length}
        variant='outline'
        {...props}
      >
        {children ?? t('actions.end')}
      </Button>
      <EndVoteDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
})
ActionEnd.displayName = 'ActionEnd'
