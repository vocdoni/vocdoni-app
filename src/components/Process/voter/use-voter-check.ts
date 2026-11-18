import { useQuery, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckResponse } from '@vocdoni/api-types'
import { useEffect, useRef } from 'react'
import { checkRetryDelay } from './live'
import type { Membership } from './voter-flow'

export const voterCheckKey = (id: string | undefined) => ['voter-check', id] as const

const isUnauthorized = (error: unknown) => error instanceof VocdoniApiError && error.status === 401

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
  const query = useQuery({
    queryKey: [...voterCheckKey(id), authToken],
    queryFn: () => check(),
    enabled: connected && !!authToken && !!id,
    // No quick retries: a failing check backs off with jitter instead (gate F5), as the room's tabs would otherwise
    // hit the failing endpoint in step every few seconds.
    retry: false,
    refetchInterval: (current) =>
      current.state.status === 'error' && !isUnauthorized(current.state.error)
        ? checkRetryDelay(current.state.errorUpdateCount)
        : false,
    refetchOnWindowFocus: true,
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
  else if (query.status === 'error') membership = isUnauthorized(query.error) ? 'sessionLost' : 'pending'
  else if (query.data) membership = query.data.belongsToProcess ? 'ok' : 'notInProcess'

  const answers = query.data?.questions ?? []
  // Every question this voter may vote is on chain: a vote cast from another device, or the only questions open to
  // them (audit F9).
  const votedElsewhere =
    connected &&
    answers.some((question) => question.hasVoted) &&
    answers.every((question) => question.hasVoted || !question.canVote)
  return { membership, votedElsewhere }
}
