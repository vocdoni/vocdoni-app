import type { SetElectionStatusRequest } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { useIsStatusJobRunning, useStatusJob } from './status-job'

/** The transitions an organiser makes on one question (`canceled` is a whole-vote action). */
export type QuestionStatusChange = Extract<SetElectionStatusRequest['status'], 'ready' | 'paused' | 'ended'>

export type QuestionStatusVariables = { questionId: string; status: QuestionStatusChange }

/**
 * Opens (`ready`), pauses or closes (`ended`) one question of a vote through the shared status-job runner. `isBusy` is
 * true while any status change of this vote runs, so every other status button on the page can disable itself.
 * Closing a question is confirmed by the caller (ConfirmDialog), not here.
 */
export const useQuestionStatusAction = (processId: string | undefined) => {
  const { t } = useTranslation()
  const { run, pending } = useStatusJob(processId)
  const isBusy = useIsStatusJobRunning(processId)

  return {
    change: ({ questionId, status }: QuestionStatusVariables) =>
      run({
        questionId,
        status,
        tag: 'question',
        errorTitle: t('votes.manage.error.title', { defaultValue: 'The question could not change' }),
      }),
    /** The change this hook instance started, while it runs: the clicked button shows progress. */
    pending:
      pending && 'questionId' in pending
        ? { questionId: pending.questionId, status: pending.status as QuestionStatusChange }
        : undefined,
    isBusy,
  }
}
