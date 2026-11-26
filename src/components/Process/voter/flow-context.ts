import type { VotingProcessResponse } from '@vocdoni/api-types'
import { createContext, useContext } from 'react'
import type { ProcessBrand } from '~utils/process-brand'
import type { ChainRecord, VoterFacts, VoterLocalState, VoterScreen } from './voter-flow'

/** What every voter screen reads (`useVoterFlow()`). Screens call no SDK hook of their own except the SDK's fields. */
export type VoterFlow = {
  screen: VoterScreen
  /** True once the screen has changed after the first one: the new screen's heading takes the focus. */
  moved: boolean
  election: VotingProcessResponse
  brand: ProcessBrand
  facts: VoterFacts
  state: VoterLocalState
  /** Census weight of the connected voter (`useElection().weight`), shown on review for a weighted census. */
  weight: number | null
  weighted: boolean
  anonymous: boolean
  /** Every vote id the voter holds, by question id. */
  voteIds: Record<string, string>
  /** Per question id: the SDK's react-components i18n key of the notice that replaces its fields, if any. */
  lockedNotice: (questionId: string) => string | undefined
  /** Per question, in order: the SDK's `voteStatus` value. */
  statuses: (string | undefined)[]
  /** Per question, in order: what the chain is known to hold of its vote (`chainRecordOf`). */
  chain: ChainRecord[]
  // Navigation (each pushes the step to history.state).
  start: () => void
  next: (index: number) => void
  back: (index: number) => void
  goTo: (index: number) => void
  change: (index: number) => void
  review: () => void
  /** Writes a blank vote (an empty list) into the SDK form for a question that allows one, or takes it back. */
  chooseBlank: (index: number, on: boolean) => void
  // Actions.
  cast: () => Promise<void>
  /** From the tap on "Emet el vot" until the SDK settles: the button stays off. */
  casting: boolean
  signOut: () => void
  showResults: (on: boolean) => void
  checkReceipt: () => void
  /** Question by question: asks the membership check again (a closed question whose vote could not be confirmed). */
  recheck: () => void
  /** Opens or leaves "Verifica el teu comprovant" (anonymous census). */
  verifyReceipt: (on: boolean) => void
  /** Question by question: "Enrere" leaves the open question's ballot for the room (frame 1). */
  park: (index: number) => void
  /** Question by question: "No votar aquesta pregunta" (frame 3b). Casts nothing: the passive abstention (R12). */
  skip: (index: number) => void
  /** Question by question: "Vota ara", "Vota la pregunta N": back to the open question's ballot (frame 2). */
  resume: (index: number) => void
  /** Question by question: "Emet el vot" casts this question only (SDK #118). */
  castQuestion: (index: number) => Promise<void>
  /** Leaves "Comprova el teu vot" for the closed screen again. */
  leaveReceipt: () => void
}

export const VoterFlowContext = createContext<VoterFlow | undefined>(undefined)

export const useVoterFlow = (): VoterFlow => {
  const flow = useContext(VoterFlowContext)
  if (!flow) throw new Error('useVoterFlow must be used inside VoterFlowProvider')
  return flow
}
