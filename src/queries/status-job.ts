import { notifyManager, useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { JobStatusResponse, SetElectionStatusRequest, VotingProcessResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

export type StatusChange = SetElectionStatusRequest['status']

export type StatusJobErrorKind = 'busy' | 'stale' | 'timeout' | 'other'

/** Maps a failure to the message the organiser reads; never the backend's raw text. */
export const statusJobErrorKind = (error: unknown): StatusJobErrorKind => {
  // 503: another status change of this organisation holds the transaction lock, or the queue is full.
  if (error instanceof VocdoniApiError && error.status === 503) return 'busy'
  // 400: a targeted question reached a terminal status meanwhile (a stale screen, or a second organiser). The backend
  // answers its other 400s with the same code (40004), so only its "cannot change to" reason says it is this one.
  if (
    error instanceof VocdoniApiError &&
    error.status === 400 &&
    error.code === 40004 &&
    /and cannot change to /.test(error.message)
  ) {
    return 'stale'
  }
  // JobsClient.waitFor throws a plain Error on its deadline; the transaction may still land.
  if (
    !(error instanceof JobFailedError) &&
    error instanceof Error &&
    error.message.startsWith('Timed out waiting for job')
  )
    return 'timeout'
  return 'other'
}

// One transaction per question, serialised per organisation: past this the organiser hears it is slow.
const STATUS_JOB_SLOW_MS = 120_000
// The runner keeps waiting (buttons still guarded) until this, then leaves it to the page's own refresh.
const STATUS_JOB_GIVE_UP_MS = 600_000

export type StatusJobRequest =
  | { questionId: string; status: StatusChange }
  | { questionIds: string[]; status: StatusChange }

export type StatusJobVariables = StatusJobRequest & {
  /** The toast title when it fails ("The vote could not be paused"). */
  errorTitle: string
  /** Tells the callers' buttons apart: which one shows progress. */
  tag: string
  /**
   * Runs with the process re-read after the job, in the same render as the page receiving it; `ok` only when the job
   * completed for every targeted question.
   */
  onRefreshed?: (refreshed: VotingProcessResponse, ok: boolean) => void
}

export type StatusJobOutcome = { ok: boolean; error?: StatusJobErrorKind }

/** Questions a completed or failed status job reports as not changed (its per-question outcomes). */
const failedQuestions = (job: JobStatusResponse | undefined) =>
  (job?.result?.questions ?? []).filter((entry) => entry.status === 'failed' || !!entry.error)

/**
 * The one way the vote screens change question statuses (header actions, a whole-vote pause, a single question): send
 * the change, wait for its job, then re-read the process into the query the ElectionProvider observes and refresh the
 * results and the votes list, whatever happened. Failures are told in the organiser's words; a slow job is told as
 * slow, not failed, and the buttons stay guarded while it runs. Every run shares one mutation key prefix per vote, so
 * `useIsStatusJobRunning` sees any of them from any screen.
 */
export const useStatusJob = (processId: string | undefined) => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const queryClient = useQueryClient()
  const toast = useToast()
  const mutationKey = QueryKeys.process.questionStatus(processId)

  const slowTitle = () => t('votes.job.slow_title', { defaultValue: 'Still working on it' })
  const partialText = (failed: number, total: number) =>
    t('votes.job.partial', {
      defaultValue:
        'Some questions could not change: {{failed, number}} of {{total, number}}. The page shows where each one stands.',
      failed,
      total,
    })

  const reportError = (error: unknown, title: string, bulk: boolean): StatusJobErrorKind => {
    const kind = statusJobErrorKind(error)
    // The raw reason helps debugging; the organiser reads the mapped sentence.
    if (kind === 'other') console.error('Status change failed', error)
    const failed = error instanceof JobFailedError ? failedQuestions(error.job) : []
    const total = error instanceof JobFailedError ? (error.job.result?.questions?.length ?? 0) : 0
    const partial = failed.length > 0 && failed.length < total
    const description = partial
      ? partialText(failed.length, total)
      : {
          busy: t('votes.manage.error.busy', {
            defaultValue: 'Another change is under way. Try again in a few seconds.',
          }),
          stale: bulk
            ? t('votes.job.stale', {
                defaultValue: 'A question had already changed state. The page now shows where each one stands.',
              })
            : t('votes.manage.error.stale', { defaultValue: 'The question had already changed state.' }),
          timeout: t('votes.manage.error.timeout', {
            defaultValue: 'This is taking longer than expected. The state will update on its own.',
          }),
          other: t('votes.error.other', { defaultValue: 'Something went wrong. Reload the page and try again.' }),
        }[kind]
    toast({
      title: kind === 'timeout' ? slowTitle() : title,
      description,
      type: kind === 'timeout' ? 'info' : 'error',
      duration: 7000,
      closable: true,
    })
    return kind
  }

  const waitPatiently = async (jobId: string) => {
    try {
      return await client.jobs.waitFor(jobId, { timeoutMs: STATUS_JOB_SLOW_MS })
    } catch (error) {
      if (statusJobErrorKind(error) !== 'timeout') throw error
    }
    toast({
      title: slowTitle(),
      description: t('votes.job.slow', {
        defaultValue: 'The change has not finished yet. We keep waiting and will refresh the page when it does.',
      }),
      type: 'info',
      duration: 7000,
      closable: true,
    })
    return client.jobs.waitFor(jobId, { timeoutMs: STATUS_JOB_GIVE_UP_MS })
  }

  const mutation = useMutation<StatusJobOutcome, never, StatusJobVariables>({
    mutationKey,
    mutationFn: async (variables) => {
      if (!processId) return { ok: false, error: 'other' }
      const processKey = QueryKeys.election.process(processId)
      const bulk = 'questionIds' in variables
      // A poll that left before the change must not land after it.
      await queryClient.cancelQueries({ queryKey: processKey })
      let outcome: StatusJobOutcome
      try {
        const { jobId } = bulk
          ? await client.elections.bulkSetQuestionStatus(processId, {
              status: variables.status,
              questions: variables.questionIds.map((id) => ({ id })),
            })
          : await client.elections.setQuestionStatus(processId, variables.questionId, variables.status)
        const job = await waitPatiently(jobId)
        const failed = failedQuestions(job)
        if (failed.length) {
          const total = job.result?.questions?.length ?? failed.length
          toast({
            title: variables.errorTitle,
            description: partialText(failed.length, total),
            type: 'error',
            duration: 7000,
            closable: true,
          })
        }
        outcome = { ok: !failed.length }
      } catch (error) {
        outcome = { ok: false, error: reportError(error, variables.errorTitle, bulk) }
      }
      try {
        const refreshed = await client.elections.get(processId)
        await queryClient.cancelQueries({ queryKey: processKey })
        notifyManager.batch(() => {
          variables.onRefreshed?.(refreshed, outcome.ok)
          queryClient.setQueryData(processKey, refreshed)
        })
      } catch {
        // The page's own poll catches up; a failed re-read must not hide the change's outcome.
      }
      void queryClient.invalidateQueries({ queryKey: QueryKeys.election.results(processId) })
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })
      // Home's published lists are cached for a while too: a status filter must not keep showing the old status
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.electionLists })
      return outcome
    },
  })

  return {
    run: mutation.mutateAsync,
    /** The tag of the change this instance runs, while it runs. */
    pending: mutation.isPending ? mutation.variables : undefined,
  }
}

/** Whether any status change of this vote is running, from any screen. */
export const useIsStatusJobRunning = (processId: string | undefined) =>
  useIsMutating({ mutationKey: QueryKeys.process.questionStatus(processId) }) > 0
