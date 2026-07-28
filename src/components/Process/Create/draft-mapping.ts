import { isSecretUntilTheEnd } from '@vocdoni/api-client'
import type {
  CreateVotingProcessRequest,
  LocalizedInput,
  VotingProcessQuestion,
  VotingProcessQuestionRequest,
  VotingProcessQuestionType,
  VotingProcessResponse,
} from '@vocdoni/api-types'
import { format } from 'date-fns'
import { defaultProcessValues, Process, SelectorTypes } from './common'
import { TwoFAMethod } from './VoterAuthentication/utils'

/** Resolve a LocalizedInput (string | Record<string,string>) to a plain string. */
export const localStr = (v?: LocalizedInput): string => (typeof v === 'string' ? v : (v?.default ?? ''))

/** Per-choice extended info the create flow stores under `question.metadata.choices`. */
type ChoiceMeta = { value: number; description?: string; image?: string }

export const choiceMetas = (question: Pick<VotingProcessQuestion, 'metadata'>): ChoiceMeta[] => {
  const choices = question.metadata?.choices
  return Array.isArray(choices) ? (choices as ChoiceMeta[]) : []
}

// `VotingProcessQuestion.type` uses the API's canonical lowercase names
// (VOTING_PROCESS_QUESTION_TYPES), not the app's camelCase SelectorTypes.
export const MULTICHOICE_QUESTION_TYPE = 'multichoice'

/** Inverse of `getTwoFaFields`: the wizard's 2FA method for a set of API fields. */
const twoFaMethodOf = (fields: readonly string[]): TwoFAMethod | undefined => {
  const email = fields.includes('email')
  const phone = fields.includes('phone')

  if (email && phone) return 'voter_choice'
  if (email) return 'email'
  if (phone) return 'sms'
  return undefined
}

/**
 * Rehydrates the create-wizard form from a stored process (a draft, or a
 * published process being cloned).
 *
 * Lossy by design: `censusType` and `voterPrivacy` are wizard-only leftovers
 * with no v2 counterpart. The census `groupId` does round-trip (saas-backend#606)
 * and is absent, rather than a zero id, for an organization-wide census.
 */
export const votingProcessToForm = (process: VotingProcessResponse): Process => {
  const questions = process.questions ?? []

  const startDate = process.startDate ? new Date(process.startDate) : undefined
  const endDate = process.endDate ? new Date(process.endDate) : undefined

  const authFields = process.census?.authFields ?? []
  const twoFaFields = process.census?.twoFaFields ?? []
  const twoFaMethod = twoFaMethodOf(twoFaFields)

  return {
    ...defaultProcessValues,
    title: localStr(process.title),
    description: localStr(process.description),
    autoStart: !startDate,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
    startTime: startDate ? format(startDate, 'HH:mm') : '',
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
    endTime: endDate ? format(endDate, 'HH:mm') : '',
    streamUri: process.streamUri ?? '',
    resultVisibility: isSecretUntilTheEnd(process) ? 'hidden' : 'live',
    weightedVote: process.census?.weighted ?? false,
    groupId: process.census?.groupId ?? defaultProcessValues.groupId,
    census: authFields.length
      ? {
          credentials: [...authFields],
          use2FA: twoFaFields.length > 0,
          use2FAMethod: twoFaMethod ?? 'email',
        }
      : defaultProcessValues.census,
    // A process always has at least one question (the API rejects an empty list),
    // but keep the wizard's default question rather than rendering an empty form.
    questions: questions.length
      ? questions.map((question) => {
          const metas = choiceMetas(question)
          const isMultiChoice = question.type === MULTICHOICE_QUESTION_TYPE

          return {
            title: localStr(question.title),
            description: localStr(question.description),
            type: isMultiChoice ? SelectorTypes.Multiple : SelectorTypes.Single,
            // Extended info is on when any of its choices carries a description
            // or an image.
            extendedInfo: metas.some((meta) => !!meta.description || !!meta.image),
            minNumberOfChoices: isMultiChoice ? (question.typeSetup?.minChoices ?? 0) : null,
            maxNumberOfChoices: isMultiChoice
              ? (question.typeSetup?.maxChoices ??
                question.ballotProtocol?.maxCount ??
                question.choices?.length ??
                null)
              : null,
            options: (question.choices ?? []).map((choice) => {
              const meta = metas.find((entry) => entry.value === choice.value)

              return {
                option: localStr(choice.title),
                description: meta?.description,
                image: meta?.image,
              }
            }),
          }
        })
      : defaultProcessValues.questions,
  }
}

const questionToRequest = (question: VotingProcessQuestion): VotingProcessQuestionRequest => ({
  title: question.title,
  description: question.description,
  choices: question.choices,
  // A question needs either a named type or a raw ballot protocol; backend-derived
  // questions can come back with an empty type, so fall back to their protocol.
  ...(question.type
    ? { type: question.type as VotingProcessQuestionType, typeSetup: question.typeSetup }
    : { ballotProtocol: question.ballotProtocol }),
  secretUntilTheEnd: question.secretUntilTheEnd,
  metadata: question.metadata,
})

/**
 * Builds the create body for a copy of an existing process (clone as draft).
 *
 * Dates are intentionally dropped: a clone is scheduled afresh, and copying the
 * source's schedule would produce a draft that is already in the past.
 */
export const votingProcessToCreateRequest = (
  process: VotingProcessResponse,
  orgAddress: string
): CreateVotingProcessRequest => ({
  orgAddress,
  title: process.title,
  description: process.description,
  header: process.header,
  streamUri: process.streamUri,
  census: {
    weighted: process.census?.weighted,
    authFields: process.census?.authFields,
    twoFaFields: process.census?.twoFaFields,
    // Absent for an organization-wide census, which is exactly what we want to
    // send back for one.
    groupId: process.census?.groupId,
  },
  questions: (process.questions ?? []).map(questionToRequest),
})
