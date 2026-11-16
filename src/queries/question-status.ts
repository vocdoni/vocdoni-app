import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { SetElectionStatusRequest } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

/** The transitions an organiser makes on one question (`canceled` is a whole-vote action). */
export type QuestionStatusChange = Extract<SetElectionStatusRequest['status'], 'ready' | 'paused' | 'ended'>

export type QuestionStatusVariables = { questionId: string; status: QuestionStatusChange }

// A status change is one transaction per question; the backend serialises them per organisation, so allow the chain
// some slack over the client's 60s default before calling it slow.
const STATUS_JOB_TIMEOUT_MS = 120_000

export type QuestionStatusErrorKind = 'busy' | 'stale' | 'timeout' | 'other'

/** Maps a failure to the message the organiser reads; never the backend's raw text (audit F7). */
export const questionStatusErrorKind = (error: unknown): QuestionStatusErrorKind => {
  // 503: another status change of this organisation holds the transaction lock, or the queue is full.
  if (error instanceof VocdoniApiError && error.status === 503) return 'busy'
  // 400: the question reached a terminal status meanwhile (a stale screen, or a second organiser).
  if (error instanceof VocdoniApiError && error.status === 400) return 'stale'
  // JobsClient.waitFor throws a plain Error on its deadline; the transaction may still land.
  if (
    !(error instanceof JobFailedError) &&
    error instanceof Error &&
    error.message.startsWith('Timed out waiting for job')
  )
    return 'timeout'
  return 'other'
}

/**
 * Opens (`ready`), pauses or closes (`ended`) one question of a vote: `setQuestionStatus`, then wait for its job.
 * Success, failure and timeout alike re-read the process into the query the ElectionProvider observes and refresh
 * the results and the votes list, so the screen always shows the real state. `isBusy` is true while any question of
 * this vote is changing, so every other status button on the page can disable itself. Closing a question is
 * confirmed by the caller (ConfirmDialog, ruling R13), not here.
 */
export const useQuestionStatusAction = (processId: string | undefined) => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const queryClient = useQueryClient()
  const toast = useToast()
  const mutationKey = QueryKeys.process.questionStatus(processId)

  const mutation = useMutation<void, unknown, QuestionStatusVariables>({
    mutationKey,
    mutationFn: async ({ questionId, status }) => {
      if (!processId) throw new Error('No process to change')
      const { jobId } = await client.elections.setQuestionStatus(processId, questionId, status)
      await client.jobs.waitFor(jobId, { timeoutMs: STATUS_JOB_TIMEOUT_MS })
    },
    onError: (error) => {
      const kind = questionStatusErrorKind(error)
      const description = {
        busy: t('votes.manage.error.busy', {
          defaultValue: 'Another change is under way. Try again in a few seconds.',
        }),
        stale: t('votes.manage.error.stale', { defaultValue: 'The question had already changed state.' }),
        timeout: t('votes.manage.error.timeout', {
          defaultValue: 'This is taking longer than expected. The state will update on its own.',
        }),
        other: error instanceof Error ? error.message : String(error),
      }[kind]
      toast({
        title: t('votes.manage.error.title', { defaultValue: 'The question could not change' }),
        description,
        type: kind === 'timeout' ? 'info' : 'error',
        duration: 7000,
        closable: true,
      })
    },
    onSettled: async () => {
      if (!processId) return
      try {
        const refreshed = await client.elections.get(processId)
        queryClient.setQueryData(QueryKeys.election.process(processId), refreshed)
      } catch {
        // The 30s poll catches up; a failed re-read must not hide the action's own outcome.
      }
      void queryClient.invalidateQueries({ queryKey: QueryKeys.election.results(processId) })
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })
    },
  })

  const running = useIsMutating({ mutationKey })

  return {
    change: (variables: QuestionStatusVariables) => mutation.mutateAsync(variables).catch(() => undefined),
    /** The change this hook instance started, while it runs: the clicked button shows progress. */
    pending: mutation.isPending ? mutation.variables : undefined,
    isBusy: running > 0,
  }
}
