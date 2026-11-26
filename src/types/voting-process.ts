import type { CreateVotingProcessRequest, VotingProcessResponse } from '@vocdoni/api-types'

/**
 * Question-by-question votes are created with `initialStatus: 'PAUSED'` (saas-backend#668). @vocdoni/api-types 2.5
 * does not type the field yet (vocdoni-integrator-sdk#76); the client spreads unknown fields both ways, so it passes
 * through untouched. Reads return `'PAUSED'` or nothing. Delete these types once the SDK ships them.
 */
export type InitialStatus = 'PAUSED'

export type CreateVotingProcessRequestWithMode = CreateVotingProcessRequest & { initialStatus?: InitialStatus }

/** A process read with the untyped fields this app relies on: the mode and the legacy projection flag. */
export type VotingProcessWithMode = VotingProcessResponse & { initialStatus?: InitialStatus; legacy?: boolean }

export const isQuestionByQuestion = (process: VotingProcessResponse | null | undefined): boolean =>
  (process as VotingProcessWithMode | null | undefined)?.initialStatus === 'PAUSED'

/** Legacy vochain processes the backend appends to the list as read-only projections. */
export const isLegacyProcess = (process: VotingProcessResponse): boolean =>
  (process as VotingProcessWithMode).legacy === true
