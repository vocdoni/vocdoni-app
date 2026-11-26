import { useQueryClient } from '@tanstack/react-query'
import { resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { jitterFactor, MAX_TIMEOUT_MS, VOTER_END_POLL_MS, VOTER_END_WINDOW_MS, voterLiveQueryOptions } from './live'

type ProcessDates = Pick<VotingProcessResponse, 'endDate' | 'startDate'>

/**
 * The voter page's reads (spec D5): the provider options, plus the end-instant timer. At the scheduled end it
 * refetches the process at once and opens the fast-poll window, as the SDK's own timer does for the start.
 * `endPassed` says the clock passed the end the process read holds now (an end moved later is waited for), before
 * any read says so.
 */
export const useVoterLive = (id: string, election: ProcessDates | undefined) => {
  const queryClient = useQueryClient()
  const [factor] = useState(() => jitterFactor(Math.random()))
  const [endWindowUntil, setEndWindowUntil] = useState<number>()
  // The end instant the timer fired at, so a later end is not passed until its own instant comes.
  const [passedEnd, setPassedEnd] = useState<number>()
  // The provider's read, which the server's copy seeds and the refetches replace. Nothing is cached on the server or
  // while the page hydrates: the prop is the one both sides agree on, and the cache takes over after that.
  const live = useSyncExternalStore(
    (notify) => queryClient.getQueryCache().subscribe(notify),
    () => queryClient.getQueryData<ProcessDates>(electionQueryKeys.election(id)),
    () => undefined
  )
  const process = live ?? election
  const end = process ? resolveEndDate(process)?.getTime() : undefined

  useEffect(() => {
    if (end === undefined) return
    const remaining = end - Date.now()
    if (remaining <= 0 || remaining > MAX_TIMEOUT_MS) return
    let spread: ReturnType<typeof setTimeout> | undefined
    const timer = setTimeout(() => {
      setPassedEnd(end)
      setEndWindowUntil(Date.now() + VOTER_END_WINDOW_MS)
      // Every open tab reaches the end at the same instant: the read is spread over one fast-poll interval (gate F5).
      spread = setTimeout(
        () => void queryClient.invalidateQueries({ queryKey: electionQueryKeys.election(id) }),
        Math.random() * VOTER_END_POLL_MS
      )
    }, remaining)
    return () => {
      clearTimeout(timer)
      clearTimeout(spread)
    }
  }, [end, id, queryClient])

  const options = useMemo(
    () => voterLiveQueryOptions({ endWindowUntil, factor, now: Date.now }),
    [endWindowUntil, factor]
  )
  return { ...options, endPassed: passedEnd !== undefined && passedEnd === end }
}
