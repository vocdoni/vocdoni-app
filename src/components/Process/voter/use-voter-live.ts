import { useQueryClient } from '@tanstack/react-query'
import { resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import { useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  jitterFactor,
  MAX_TIMEOUT_MS,
  VOTER_CLOCK_TOLERANCE_MS,
  VOTER_END_POLL_MS,
  VOTER_END_WINDOW_MS,
  voterLiveQueryOptions,
} from './live'
import { VoterServerNow } from './VoterFlowProvider'

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
  const serverNow = useContext(VoterServerNow)
  // A device clock far from the server's would read a live question-by-question vote as not started (or ended), and
  // poll it at the wrong rate: the poll, the end timer and the fast-poll window read the server's timeline instead
  // (gate F4). The provider's room clock is the device clock, held below the end while it is untrusted.
  const [serverOffset] = useState(() =>
    serverNow === undefined || Math.abs(Date.now() - serverNow) <= VOTER_CLOCK_TOLERANCE_MS ? 0 : serverNow - Date.now()
  )
  const now = useCallback(() => Date.now() + serverOffset, [serverOffset])
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
    const remaining = end - now()
    if (remaining <= 0 || remaining > MAX_TIMEOUT_MS) return
    let spread: ReturnType<typeof setTimeout> | undefined
    const timer = setTimeout(() => {
      setPassedEnd(end)
      setEndWindowUntil(now() + VOTER_END_WINDOW_MS)
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
  }, [end, id, now, queryClient])

  const options = useMemo(() => voterLiveQueryOptions({ endWindowUntil, factor, now }), [endWindowUntil, factor, now])
  return { ...options, endPassed: passedEnd !== undefined && passedEnd === end }
}
