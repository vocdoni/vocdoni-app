import { computeProcessStatus } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'

/** Where a published vote is in its life, as organizers think about it. */
export type ProcessState = 'live' | 'paused' | 'scheduled' | 'ended' | 'canceled'

/** The list filters. `live` includes paused votes and `closed` includes canceled ones. */
export type ProcessFilter = 'all' | 'live' | 'scheduled' | 'drafts' | 'closed'

export const PROCESS_FILTERS: ProcessFilter[] = ['all', 'live', 'scheduled', 'drafts', 'closed']

export const isProcessFilter = (value?: string): value is ProcessFilter =>
  !!value && (PROCESS_FILTERS as string[]).includes(value)

export const ENDING_SOON_MS = 48 * 60 * 60 * 1000

/**
 * The state of a published vote, from its questions' on-chain statuses. `computeProcessStatus`
 * already treats a READY vote whose start date is still ahead as UPCOMING, and a vote with any
 * question still open as ONGOING. A status the chain doesn't report is shown as ended: it's the
 * state that asks nothing of the organizer.
 */
export const getProcessState = (process: Pick<VotingProcessResponse, 'questions' | 'startDate'>): ProcessState => {
  switch (computeProcessStatus(process.questions ?? [], { startDate: process.startDate })) {
    case 'ONGOING':
      return 'live'
    case 'PAUSED':
      return 'paused'
    case 'UPCOMING':
      return 'scheduled'
    case 'CANCELED':
      return 'canceled'
    default:
      return 'ended'
  }
}

export const filterOfState = (state: ProcessState): Exclude<ProcessFilter, 'all' | 'drafts'> =>
  state === 'live' || state === 'paused' ? 'live' : state === 'scheduled' ? 'scheduled' : 'closed'

export const isEndingSoon = (endDate?: string | Date, now = Date.now()) => {
  if (!endDate) return false
  const left = new Date(endDate).getTime() - now
  return left > 0 && left <= ENDING_SOON_MS
}
