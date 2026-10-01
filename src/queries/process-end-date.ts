import { computeProcessStatus } from '@vocdoni/api-client'
import type { QuestionStatus, VotingProcessResponse } from '@vocdoni/api-types'

const stoppedVotingStatuses = new Set<QuestionStatus>(['ENDED', 'CANCELED', 'RESULTS'])

/** True once the process no longer accepts votes, however it got there. */
export const hasStoppedVoting = (election?: VotingProcessResponse | null) =>
  !!election && stoppedVotingStatuses.has(computeProcessStatus(election.questions))

/**
 * When voting actually stopped, for a process stopped ahead of its configured end — otherwise null.
 *
 * The SaaS process keeps `endDate` as the *configured* end and never rewrites it. The backend
 * records the real end as `endedAt` (vocdoni/saas-backend#729), present only when every question
 * was stopped early. `@vocdoni/api-types` does not type it yet, but the API client passes it through.
 */
export const getEarlyEndDate = (election: VotingProcessResponse): Date | null => {
  const { endedAt } = election as { endedAt?: string }

  if (!endedAt) return null

  const date = new Date(endedAt)

  return Number.isNaN(date.getTime()) ? null : date
}

/** When voting stops (or stopped): the real end of a process stopped early, else its configured end. */
export const getProcessEndDate = (election: VotingProcessResponse): Date =>
  getEarlyEndDate(election) ?? new Date(election.endDate ?? '')
