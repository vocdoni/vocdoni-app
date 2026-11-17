import { notifyManager, useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { hasEndedBySchedule } from '~utils/vote-state'
import { QueryKeys } from './keys'
import { questionStatusErrorKind } from './question-status'

type VotePauseAction = 'pause' | 'resume'
type VotePauseVariables = { action: VotePauseAction; questionIds: string[] }

export type VotePause = {
  /** The vote was paused as a whole and not resumed: no question open, at least one held by that pause. */
  isHeld: boolean
  /** The questions the pause stopped, still paused. Empty unless `isHeld`. */
  heldQuestionIds: string[]
  pause: () => Promise<void>
  resume: () => Promise<void>
  /** A pause or a resume of this vote is running, from any screen. */
  isPending: boolean
}

// Which questions a pause stopped, per vote. The backend has no process-level pause, so this browser remembers them
// (another device falls back to reopening every paused question that has votes, ruling R20).
const STORAGE_PREFIX = 'votes.pause.held.'
// As useQuestionStatusAction: one transaction per question, serialised per organisation.
const STATUS_JOB_TIMEOUT_MS = 120_000

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // Another tab paused or resumed a vote.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(STORAGE_PREFIX)) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const readHeld = (processId: string | undefined): string | null => {
  if (!processId || typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_PREFIX + processId)
  } catch {
    return null
  }
}

const writeHeld = (processId: string, questionIds: string[]) => {
  try {
    if (questionIds.length) localStorage.setItem(STORAGE_PREFIX + processId, JSON.stringify(questionIds))
    else localStorage.removeItem(STORAGE_PREFIX + processId)
  } catch {
    // Storage blocked: resume falls back to every paused question that has votes.
  }
  listeners.forEach((listener) => listener())
}

const parseHeld = (raw: string | null): string[] => {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * Pauses a question-by-question vote as a whole ("Pause the vote": every open question to `paused`) and resumes it
 * (the questions that pause stopped back to `ready`). Like useQuestionStatusAction it waits for the job, re-reads the
 * process into the query the ElectionProvider observes, refreshes the results and the votes list, and reports a
 * failure in the organiser's words. It shares that hook's mutation key prefix, so every status button on the page
 * waits for it.
 */
export const useVotePause = (process: VotingProcessResponse | null | undefined): VotePause => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const queryClient = useQueryClient()
  const toast = useToast()
  const processId = process?.id
  const questions = process?.questions
  const mutationKey = [...QueryKeys.process.questionStatus(processId), 'vote-pause']

  const raw = useSyncExternalStore(
    subscribe,
    () => readHeld(processId),
    () => null
  )
  const remembered = useMemo(() => parseHeld(raw), [raw])
  const stillPaused = useMemo(() => {
    const paused = new Set((questions ?? []).filter((q) => q.status === 'PAUSED').map((q) => q.id))
    return remembered.filter((id) => paused.has(id))
  }, [questions, remembered])
  // A held question reopened, closed or voided (here or elsewhere) ends the pause: forget it.
  const broken = !!questions && stillPaused.length < remembered.length

  useEffect(() => {
    if (processId && broken) writeHeld(processId, [])
  }, [processId, broken])

  const isHeld =
    !!process &&
    isQuestionByQuestion(process) &&
    !broken &&
    stillPaused.length > 0 &&
    !process.questions.some((q) => q.status === 'ONGOING') &&
    !hasEndedBySchedule(process, new Date())

  const mutation = useMutation<void, unknown, VotePauseVariables>({
    mutationKey,
    mutationFn: async ({ action, questionIds }) => {
      if (!processId) throw new Error('No process to change')
      const { jobId } = await client.elections.bulkSetQuestionStatus(processId, {
        status: action === 'pause' ? 'paused' : 'ready',
        questions: questionIds.map((id) => ({ id })),
      })
      await client.jobs.waitFor(jobId, { timeoutMs: STATUS_JOB_TIMEOUT_MS })
    },
    onError: (error, { action }) => {
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
        title:
          action === 'pause'
            ? t('votes.pause.error.pause', { defaultValue: 'The vote could not be paused' })
            : t('votes.pause.error.resume', { defaultValue: 'The vote could not be resumed' }),
        description,
        type: kind === 'timeout' ? 'info' : 'error',
        duration: 7000,
        closable: true,
      })
    },
    onSettled: async (_data, _error, { action, questionIds }) => {
      if (!processId) return
      const processKey = QueryKeys.election.process(processId)
      try {
        const refreshed = await client.elections.get(processId)
        // A poll that left before the change must not overwrite the re-read.
        await queryClient.cancelQueries({ queryKey: processKey })
        const paused = new Set(refreshed.questions.filter((q) => q.status === 'PAUSED').map((q) => q.id))
        // One render for the process and the memory: a held question compared with the process from before the
        // pause would read as reopened and be forgotten.
        notifyManager.batch(() => {
          queryClient.setQueryData(processKey, refreshed)
          notifyManager.schedule(() =>
            writeHeld(processId, action === 'pause' ? questionIds.filter((id) => paused.has(id)) : [])
          )
        })
      } catch {
        // The 30s poll catches up; a failed re-read must not hide the action's own outcome.
      }
      void queryClient.invalidateQueries({ queryKey: QueryKeys.election.results(processId) })
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })
    },
  })

  const isPending = useIsMutating({ mutationKey }) > 0
  const { mutateAsync } = mutation

  return useMemo<VotePause>(() => {
    const pause = async () => {
      const open = (questions ?? []).filter((q) => q.status === 'ONGOING').map((q) => q.id)
      if (!open.length) return
      await mutateAsync({ action: 'pause', questionIds: open }).catch(() => undefined)
    }
    const resume = async () => {
      const targets = remembered.length
        ? stillPaused
        : (questions ?? []).filter((q) => q.status === 'PAUSED' && (q.results?.voteCount ?? 0) > 0).map((q) => q.id)
      if (!targets.length) return
      await mutateAsync({ action: 'resume', questionIds: targets }).catch(() => undefined)
    }
    return { isHeld, heldQuestionIds: isHeld ? stillPaused : [], pause, resume, isPending }
  }, [isHeld, isPending, mutateAsync, questions, remembered, stillPaused])
}
