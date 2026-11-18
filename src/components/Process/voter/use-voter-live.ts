import { useQueryClient } from '@tanstack/react-query'
import { resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import { useEffect, useMemo, useState } from 'react'
import { jitterFactor, MAX_TIMEOUT_MS, VOTER_END_POLL_MS, VOTER_END_WINDOW_MS, voterLiveQueryOptions } from './live'

/**
 * The voter page's reads (spec D5): the provider options, plus the end-instant timer. At the scheduled end it
 * refetches the process at once and opens the fast-poll window, as the SDK's own timer does for the start.
 * `endPassed` tells the flow the clock has passed the end before any read says so.
 */
export const useVoterLive = (
  id: string,
  election: Pick<VotingProcessResponse, 'endDate' | 'startDate'> | undefined
) => {
  const queryClient = useQueryClient()
  const [factor] = useState(() => jitterFactor(Math.random()))
  const [endWindowUntil, setEndWindowUntil] = useState<number>()
  const end = election ? resolveEndDate(election)?.getTime() : undefined

  useEffect(() => {
    if (end === undefined) return
    const remaining = end - Date.now()
    if (remaining <= 0 || remaining > MAX_TIMEOUT_MS) return
    let spread: ReturnType<typeof setTimeout> | undefined
    const timer = setTimeout(() => {
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
  return { ...options, endPassed: endWindowUntil !== undefined }
}
