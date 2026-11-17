import { useQueryClient } from '@tanstack/react-query'
import type { SetElectionStatusRequest, VotingProcessResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { canOpenQuestion } from '~utils/vote-state'
import { QueryKeys } from './keys'
import { useIsStatusJobRunning, useStatusJob, type StatusJobOutcome } from './status-job'
import { readRemembered } from './vote-pause'

/**
 * The transitions an organiser makes on one question: open or reopen it (`ready`) and close it (`ended`). Pausing is the
 * whole vote's (`useVotePause`) and canceling a whole-vote action.
 */
export type QuestionStatusChange = Extract<SetElectionStatusRequest['status'], 'ready' | 'ended'>

export type QuestionStatusVariables = { questionId: string; status: QuestionStatusChange }

/**
 * Opens (`ready`) or closes (`ended`) one question of a vote through the shared status-job runner. `isBusy` is
 * true while any status change of this vote runs, so every other status button on the page can disable itself.
 * Closing a question is confirmed by the caller (ConfirmDialog), not here.
 */
export const useQuestionStatusAction = (processId: string | undefined) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { run, pending } = useStatusJob(processId)
  const isBusy = useIsStatusJobRunning(processId)

  // One question open at a time (R29): the action refuses on its own, not only the button, reading the latest process.
  const refusesToOpen = (questionId: string) => {
    const process = processId
      ? queryClient.getQueryData<VotingProcessResponse>(QueryKeys.election.process(processId))
      : undefined
    const question = process?.questions.find(({ id }) => id === questionId)
    return !!process && !!question && !canOpenQuestion(process, question, new Date(), readRemembered(processId))
  }

  return {
    change: ({ questionId, status }: QuestionStatusVariables): Promise<StatusJobOutcome> => {
      if (status === 'ready' && refusesToOpen(questionId)) return Promise.resolve({ ok: false })
      return run({
        questionId,
        status,
        tag: 'question',
        errorTitle: t('votes.manage.error.title', { defaultValue: 'The question could not change' }),
      })
    },
    /** The change this hook instance started, while it runs: the clicked button shows progress. */
    pending:
      pending && 'questionId' in pending
        ? { questionId: pending.questionId, status: pending.status as QuestionStatusChange }
        : undefined,
    isBusy,
  }
}
