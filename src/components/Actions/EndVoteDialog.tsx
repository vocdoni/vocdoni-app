import { processVoteCount } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { useActions } from './ActionsContext'
import { trackProcessAction } from './track'
import { groupQuestions, useNumberList } from './vote-questions'

export type VoteDialogProps = {
  open: boolean
  onClose: () => void
  /** Where focus goes when it closes, when the control that opened it is gone (a menu item). */
  finalFocusEl?: () => HTMLElement | null
}

type DialogCopy = { title: string; description: string; warning?: string; confirm: string }

/** What ending says, as the boards word it: the votes it keeps, and who or what is left without a vote. */
const useEndCopy = (): DialogCopy | null => {
  const { t } = useTranslation()
  const { election, results } = useElection()
  const { votePause, now } = useActions()
  const list = useNumberList()
  if (!election) return null

  if (!isQuestionByQuestion(election)) {
    // No figure until the results are read: "0 votes" or "312 have not voted" would be stated as fact.
    const known = !!results
    const count = processVoteCount(results)
    const notVoted = known ? Math.max(0, (election.census?.size ?? 0) - count) : 0
    return {
      title: t('votes.end.title_now', { defaultValue: 'End the vote now?' }),
      description: !known
        ? t('votes.end.body_all_unknown', {
            defaultValue:
              'It will close before the deadline, with the votes cast. The results will be published and the voters will see them. It cannot be reopened.',
          })
        : t('votes.end.body_all', {
            defaultValue_one:
              'It will close before the deadline, with the {{count, number}} vote cast. The results will be published and the voters will see them. It cannot be reopened.',
            defaultValue_other:
              'It will close before the deadline, with the {{count, number}} votes cast. The results will be published and the voters will see them. It cannot be reopened.',
            count,
          }),
      warning: notVoted
        ? t('votes.end.not_voted', {
            defaultValue_one: '{{count, number}} person has not voted yet and will no longer be able to.',
            defaultValue_other: '{{count, number}} people have not voted yet and will no longer be able to.',
            count: notVoted,
          })
        : undefined,
      confirm: t('votes.page.end_now', { defaultValue: 'End now' }),
    }
  }

  const { active, unopened } = groupQuestions(election, votePause.heldQuestionIds, now)
  const [first] = active
  const closing =
    active.length === 1
      ? t('votes.end.body_question', {
          defaultValue_one: 'Question {{number}} will close with the {{count, number}} vote it has now.',
          defaultValue_other: 'Question {{number}} will close with the {{count, number}} votes it has now.',
          number: first.number,
          count: first.question.results?.voteCount ?? 0,
        })
      : active.length
        ? t('votes.end.body_questions', {
            defaultValue: 'Questions {{numbers}} will close with the votes they have now.',
            numbers: list(active),
          })
        : ''
  const final = t('votes.end.body_final', { defaultValue: 'The results will be final, and the voters will see them.' })
  return {
    title: t('votes.end.title', { defaultValue: 'End the vote?' }),
    description: closing ? `${closing} ${final}` : final,
    warning: unopened.length
      ? t('votes.end.unopened', {
          defaultValue_one: 'Question {{numbers}} has not been opened and will stay without votes.',
          defaultValue_other: 'Questions {{numbers}} have not been opened and will stay without votes.',
          count: unopened.length,
          numbers: list(unopened),
        })
      : undefined,
    confirm: t('votes.page.end_vote', { defaultValue: 'End the vote' }),
  }
}

/** "End now" (all at once) or "End the vote" (question by question): the boards' confirm, primary. */
export const EndVoteDialog = ({ open, onClose, finalFocusEl }: VoteDialogProps) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const {
    end,
    loading: { end: loading },
  } = useActions()
  const copy = useEndCopy()
  if (!copy) return null

  const confirm = async () => {
    trackProcessAction('end', election)
    const r = await end()
    if (r.ok || r.error === 'stale' || r.error === 'timeout') onClose()
  }

  return (
    <ConfirmDialog
      open={open}
      finalFocusEl={finalFocusEl}
      onOpenChange={({ open }) => !open && !loading && onClose()}
      title={copy.title}
      description={copy.description}
      warning={copy.warning}
      tone='primary'
      cancelText={t('votes.end.keep', { defaultValue: 'Continue the vote' })}
      confirmText={copy.confirm}
      onCancel={onClose}
      onConfirm={() => void confirm()}
      cancelDisabled={loading}
      loading={loading}
    />
  )
}
