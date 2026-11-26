import { useQuery, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckResponse } from '@vocdoni/api-types'
import { useEffect, useRef, useState } from 'react'
import { checkRetryDelay, jitterFactor } from './live'
import type { Membership } from './voter-flow'

export const voterCheckKey = (id: string | undefined) => ['voter-check', id] as const

const isUnauthorized = (error: unknown) => error instanceof VocdoniApiError && error.status === 401

// A client error that asking again will not change (a timeout or a rate limit may, so those keep retrying).
const RETRYABLE_CLIENT_ERRORS: ReadonlySet<number> = new Set([408, 429])
const isTerminal = (error: unknown) =>
  error instanceof VocdoniApiError &&
  error.status >= 400 &&
  error.status < 500 &&
  !RETRYABLE_CLIENT_ERRORS.has(error.status)

type VoterCheckInput = {
  id: string | undefined
  authToken: string | null
  connected: boolean
  check: () => Promise<ProcessCheckResponse>
  /** Changes whenever the process status or any question status changes: the check runs again. */
  statusKey: string
}

/**
 * The flow's own membership check (spec D4, audit F5 and F8): the source of `checking`, `notEligible` and a lost
 * session. The SDK runs its check only when the token or the process status changes and swallows its failure, so the
 * flow keeps its own, refetched when any question status changes, on focus and after every cast.
 */
export const useVoterCheck = ({ id, authToken, connected, check, statusKey }: VoterCheckInput) => {
  const queryClient = useQueryClient()
  // One spread per tab, fixed (see `checkRetryDelay`), and the failures in a row: the query's own `errorUpdateCount`
  // never goes back to zero, so one bad minute would leave every later retry at the ceiling (gate-2 N1).
  const [factor] = useState(() => jitterFactor(Math.random()))
  const failures = useRef(0)
  useEffect(() => {
    failures.current = 0
  }, [id, authToken])
  const query = useQuery({
    queryKey: [...voterCheckKey(id), authToken],
    queryFn: async () => {
      try {
        const answer = await check()
        failures.current = 0
        return answer
      } catch (error) {
        failures.current += 1
        throw error
      }
    },
    enabled: connected && !!authToken && !!id,
    // No quick retries: a failing check backs off with jitter instead (gate F5), as the room's tabs would otherwise
    // hit the failing endpoint in step every few seconds. The interval only runs while the page is visible; focus and
    // reconnect check again at once. A 401 or another client error is never retried (408 and 429 are).
    retry: false,
    refetchInterval: (current) =>
      current.state.status === 'error' && !isUnauthorized(current.state.error) && !isTerminal(current.state.error)
        ? checkRetryDelay(failures.current, factor)
        : false,
    // Focus and reconnect check again even when the last answer is recent: the app's default `staleTime` (30 s) would
    // skip it, and a second device that voted meanwhile must be heard when the tab comes back (live test, 2026-11-24).
    // Nothing polls this query: a status change (below), focus, reconnect and every cast are its only triggers.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    gcTime: 0,
  })

  const firstKey = useRef(statusKey)
  useEffect(() => {
    if (firstKey.current === statusKey) return
    firstKey.current = statusKey
    if (connected) void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
  }, [statusKey, connected, id, queryClient])

  let membership: Membership = 'pending'
  if (!connected) membership = 'idle'
  else if (query.status === 'error' && isUnauthorized(query.error)) membership = 'sessionLost'
  // A check the server refuses for good, with no answer yet, ends on the unavailable screen: waiting would never end.
  else if (query.status === 'error' && !query.data && isTerminal(query.error)) membership = 'unavailable'
  // A refetch that failed for another reason keeps the last answer while the retry goes on behind it: one dropped
  // request does not take the ballot away (gate-2 N3). With no answer yet, the check stays pending. The SDK checks
  // again inside every cast, so a stale "ok" cannot cast anything the backend would refuse.
  // A member the check lists no question for has nothing to vote here: the same screen as a non-member, with "Surt",
  // not a wait for a per-question state that never comes and a false "session expired" (gate F9).
  else if (query.data) {
    membership = query.data.belongsToProcess && query.data.questions.length > 0 ? 'ok' : 'notInProcess'
  }

  const answers = query.data?.questions ?? []
  // Every question this voter may vote is on chain: a vote cast from another device, or the only questions open to
  // them (audit F9).
  const votedElsewhere =
    connected &&
    answers.some((question) => question.hasVoted) &&
    answers.every((question) => question.hasVoted || !question.canVote)
  // The questions the check's last answer lists as on chain, re-read after every cast and when a status changes.
  const votedIds = answers.filter((question) => question.hasVoted).map((question) => question.questionId)
  // The questions this voter is not eligible for (a question restricted to part of the census).
  const ineligibleIds = answers.filter((question) => !question.canVote).map((question) => question.questionId)
  return { membership, votedElsewhere, votedIds, ineligibleIds }
}
