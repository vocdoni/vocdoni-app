import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { deriveVoteState, isTerminalQuestion, pausedHoldIds } from '~utils/vote-state'
import { useStatusJob } from './status-job'

export type VotePause = {
  /** The question-by-question vote reads paused: started, nothing open, a question that was open is paused. */
  isHeld: boolean
  /** The questions "Resume the vote" reopens. Empty unless `isHeld`. */
  heldQuestionIds: string[]
  pause: () => Promise<void>
  resume: () => Promise<void>
  /** A pause or a resume of this vote is running. */
  isPending: boolean
}

// Which questions a whole-vote pause stopped, per vote. Only a hint for "this question was open" (one with no votes
// cannot tell otherwise) and for what Resume reopens; the state itself is derived from the process.
const STORAGE_PREFIX = 'votes.pause.held.'

const NONE: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()
let version = 0
const cache = new Map<string, { raw: string | null; ids: ReadonlySet<string> }>()

const notify = () => {
  version += 1
  listeners.forEach((listener) => listener())
}

// Another tab paused or resumed a vote: re-read, never prune from here.
const onStorage = (event: StorageEvent) => {
  if (event.key === null || event.key.startsWith(STORAGE_PREFIX)) notify()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

const readRaw = (processId: string): string | null => {
  try {
    return localStorage.getItem(STORAGE_PREFIX + processId)
  } catch {
    return null
  }
}

const parse = (raw: string | null): ReadonlySet<string> => {
  if (!raw) return NONE
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? new Set(value.filter((id): id is string => typeof id === 'string')) : NONE
  } catch {
    return NONE
  }
}

/** This browser's pause memory of a vote; the same set object until it changes. */
export const readRemembered = (processId: string | undefined): ReadonlySet<string> => {
  if (!processId || typeof localStorage === 'undefined') return NONE
  const raw = readRaw(processId)
  const cached = cache.get(processId)
  if (cached && cached.raw === raw) return cached.ids
  const ids = parse(raw)
  cache.set(processId, { raw, ids })
  return ids
}

const writeRemembered = (processId: string, ids: Iterable<string>) => {
  const list = [...new Set(ids)]
  try {
    if (list.length) localStorage.setItem(STORAGE_PREFIX + processId, JSON.stringify(list))
    else localStorage.removeItem(STORAGE_PREFIX + processId)
  } catch {
    // Storage blocked: Resume falls back to every paused question that has votes.
  }
  notify()
}

/** Re-renders when any vote's pause memory changes, in this tab or another; read the sets with `readRemembered`. */
export const usePauseMemoryVersion = () =>
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0
  )

export const useRemembered = (processId: string | undefined): ReadonlySet<string> => {
  const memoryVersion = usePauseMemoryVersion()
  // The version is what tells the memory changed; the read keeps the set's identity while it does not.
  return useMemo(() => readRemembered(processId), [processId, memoryVersion])
}

const pausedIn = (process: VotingProcessResponse) =>
  new Set(process.questions.filter((question) => question.status === 'PAUSED').map(({ id }) => id))

/**
 * Pauses a question-by-question vote as a whole ("Pause the vote": every open question to `paused`) and resumes it
 * (the held questions back to `ready`), through the shared status-job runner. Call it once per vote page (the actions
 * provider); screens read it from `useActions()`. The memory only grows on a pause and only shrinks after a change
 * the re-read confirms, or when a remembered question is over, so a failure, a timeout or a stale tab never loses it.
 */
export const useVotePause = (process: VotingProcessResponse | null | undefined, now: Date): VotePause => {
  const { t } = useTranslation()
  const processId = process?.id
  const { run, pending } = useStatusJob(processId)
  const remembered = useRemembered(processId)

  // A question that is over never reopens, so even an old read may forget it.
  useEffect(() => {
    if (!processId || !process || !remembered.size) return
    const over = new Set(process.questions.filter(isTerminalQuestion).map(({ id }) => id))
    if ([...remembered].some((id) => over.has(id))) {
      writeRemembered(
        processId,
        [...remembered].filter((id) => !over.has(id))
      )
    }
  }, [processId, process, remembered])

  const isHeld = !!process && isQuestionByQuestion(process) && deriveVoteState(process, now, remembered) === 'paused'
  const heldKey = isHeld && process ? pausedHoldIds(process, remembered).join() : ''
  const isPending = pending?.tag === 'pauseVote' || pending?.tag === 'resumeVote'

  return useMemo<VotePause>(() => {
    const heldQuestionIds = heldKey ? heldKey.split(',') : []
    const pause = async () => {
      if (!processId || !process) return
      const open = process.questions.filter((question) => question.status === 'ONGOING').map(({ id }) => id)
      if (!open.length) return
      // Remembered before sending: a pause that times out may still land, and must not land unremembered.
      writeRemembered(processId, [...readRemembered(processId), ...open])
      await run({
        questionIds: open,
        status: 'paused',
        tag: 'pauseVote',
        errorTitle: t('votes.pause.error.pause', { defaultValue: 'The vote could not be paused' }),
        onRefreshed: (refreshed, ok) => {
          if (!ok) return
          const paused = pausedIn(refreshed)
          writeRemembered(
            processId,
            [...readRemembered(processId)].filter((id) => paused.has(id))
          )
        },
      })
    }
    const resume = async () => {
      if (!processId || !heldQuestionIds.length) return
      await run({
        questionIds: heldQuestionIds,
        status: 'ready',
        tag: 'resumeVote',
        errorTitle: t('votes.pause.error.resume', { defaultValue: 'The vote could not be resumed' }),
        onRefreshed: (refreshed, ok) => {
          // Only a confirmed resume forgets: after a failure the questions may still be held.
          if (!ok) return
          const paused = pausedIn(refreshed)
          writeRemembered(
            processId,
            [...readRemembered(processId)].filter((id) => paused.has(id))
          )
        },
      })
    }
    return { isHeld, heldQuestionIds, pause, resume, isPending }
  }, [heldKey, isHeld, isPending, process, processId, run, t])
}
