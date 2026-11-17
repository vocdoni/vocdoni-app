import { processVoteCount } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { useVoteText } from '~i18n/use-vote-text'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { useActions } from './ActionsContext'
import type { VoteDialogProps } from './EndVoteDialog'
import { trackProcessAction } from './track'
import { groupQuestions, useNumberList } from './vote-questions'

/** What cancelling discards, as the boards word it. No sentence about notifying the voters: nothing is sent. */
const useCancelCopy = () => {
  const { t } = useTranslation()
  const { election, results } = useElection()
  const { votePause, now, state } = useActions()
  const list = useNumberList()
  if (!election) return null

  const noVotes = t('votes.cancel.body_none', { defaultValue: 'No vote has been cast yet.' })
  let discarded: string
  let warning: string | undefined

  if (isQuestionByQuestion(election)) {
    const voted = election.questions.map((question) => question.results?.voteCount ?? 0)
    const cast = voted.reduce((sum, votes) => sum + votes, 0)
    discarded = cast
      ? t('votes.cancel.body_by_question', {
          defaultValue_one:
            'The {{count}} vote cast in {{questions}} will be discarded and no result will take effect.',
          defaultValue_other:
            'The {{count}} votes cast in {{questions}} will be discarded and no result will take effect.',
          count: cast,
          questions: t('votes.cancel.questions', {
            defaultValue_one: '{{count}} question',
            defaultValue_other: '{{count}} questions',
            count: voted.filter(Boolean).length,
          }),
        })
      : noVotes
    const { active } = groupQuestions(election, votePause.heldQuestionIds, now)
    warning = active.length
      ? t('votes.cancel.open_now', {
          defaultValue_one: 'Question {{numbers}} is open right now.',
          defaultValue_other: 'Questions {{numbers}} are open right now.',
          count: active.length,
          numbers: list(active),
        })
      : undefined
  } else {
    const count = processVoteCount(results)
    discarded =
      state === 'ready'
        ? t('votes.cancel.body_not_open', { defaultValue: 'It has not opened yet and there are no votes.' })
        : !results
          ? // No figure until the results are read, not even "no vote yet".
            t('votes.cancel.body_all_unknown', {
              defaultValue: 'The votes cast will be discarded and there will be no results.',
            })
          : count
            ? t('votes.cancel.body_all', {
                defaultValue_one: 'The {{count}} vote cast will be discarded and there will be no results.',
                defaultValue_other: 'The {{count}} votes cast will be discarded and there will be no results.',
                count,
              })
            : noVotes
  }

  return {
    description: `${discarded} ${t('votes.cancel.body_final', { defaultValue: 'It cannot be undone.' })}`,
    warning,
  }
}

/** "Cancel the vote", from the vote's "More" menu: the boards' confirm, with the danger outline. */
export const CancelVoteDialog = ({ open, onClose }: VoteDialogProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const { election } = useElection()
  const {
    cancel,
    loading: { cancel: loading },
  } = useActions()
  const copy = useCancelCopy()
  if (!election || !copy) return null

  const confirm = async () => {
    trackProcessAction('cancel', election)
    await cancel()
    onClose()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={({ open }) => !open && !loading && onClose()}
      title={t('votes.cancel.title', { defaultValue: 'Cancel “{{title}}”?', title: text(election.title) })}
      description={copy.description}
      warning={copy.warning}
      tone='danger'
      cancelText={t('votes.cancel.keep', { defaultValue: 'No, continue the vote' })}
      confirmText={t('votes.page.cancel_vote', { defaultValue: 'Cancel the vote' })}
      onCancel={onClose}
      onConfirm={() => void confirm()}
      cancelDisabled={loading}
      loading={loading}
    />
  )
}
