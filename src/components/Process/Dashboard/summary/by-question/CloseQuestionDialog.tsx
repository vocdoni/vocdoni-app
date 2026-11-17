import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'

export type ClosingQuestion = { question: VotingProcessQuestion; number: number }

type CloseQuestionDialogProps = {
  closing: ClosingQuestion | null
  /** Every other question is over: closing this one closes the vote too (R30). */
  last: boolean
  onConfirm: () => void
  onCancel: () => void
  /** The close is under way: the dialog stays, its confirm shows progress and it cannot be dismissed. */
  loading: boolean
  busy: boolean
}

/** The board's "Vols tancar la pregunta 3?": closing is final, so it asks first; the action is the primary. */
export const CloseQuestionDialog = ({
  closing,
  last,
  onConfirm,
  onCancel,
  loading,
  busy,
}: CloseQuestionDialogProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  // While the dialog animates out `closing` is already null: it keeps saying the question it closed.
  const lastShown = useRef<ClosingQuestion | null>(closing)
  if (closing) lastShown.current = closing
  const shown = closing ?? lastShown.current
  const number = shown?.number
  const votes = shown?.question.results?.voteCount ?? 0
  return (
    <ConfirmDialog
      open={!!closing}
      onOpenChange={({ open }) => !open && !busy && onCancel()}
      tone='primary'
      title={t('votes.manage.close_title', { defaultValue: 'Close question {{number}}?', number })}
      description={
        shown
          ? t('votes.manage.close_body', {
              defaultValue_one:
                '“{{title}}” will close with the {{votes}} vote it has now, and the result will be final. A closed question cannot be reopened.',
              defaultValue_other:
                '“{{title}}” will close with the {{votes}} votes it has now, and the result will be final. A closed question cannot be reopened.',
              title: text(shown.question.title),
              count: votes,
              votes: quantity(votes),
            })
          : undefined
      }
      warning={
        last
          ? t('votes.manage.close_last_warning', {
              defaultValue: 'This is the last question: closing it closes the vote too.',
            })
          : undefined
      }
      cancelText={t('votes.manage.close_cancel', { defaultValue: 'No, leave it open' })}
      confirmText={t('votes.manage.close_confirm', { defaultValue: 'Close question {{number}}', number })}
      onConfirm={onConfirm}
      onCancel={onCancel}
      cancelDisabled={busy}
      loading={loading}
    />
  )
}
