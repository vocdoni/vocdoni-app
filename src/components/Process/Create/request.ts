import { useOrganization } from '@vocdoni/react-components'
import type {
  CensusSpec,
  Choice,
  CreateVotingProcessRequest,
  OrgMemberAuthField,
  OrgMemberTwoFaField,
  VotingProcessQuestionRequest,
} from '@vocdoni/api-types'
import { addDays } from 'date-fns'
import { useSubscription } from '~components/Auth/Subscription'
import { SubscriptionPermission } from '~constants'
import { Option, parseFormDateTime, Process, SelectorTypes } from './common'
import { getTwoFaFields } from './VoterAuthentication/utils'

export const buildCensusSpec = (form: Process): CensusSpec => {
  const spec: CensusSpec = {
    groupId: form.groupId || undefined,
    weighted: form.weightedVote || undefined,
    // Blind-CSP census: omitted rather than sent as `false`, matching how the
    // other optional flags are built here.
    anonymous: form.anonymousVoting || undefined,
  }
  if (form.census?.credentials?.length) {
    spec.authFields = form.census.credentials as OrgMemberAuthField[]
  }
  if (form.census?.use2FA && form.census?.use2FAMethod) {
    spec.twoFaFields = getTwoFaFields(form.census.use2FAMethod) as OrgMemberTwoFaField[]
  }
  return spec
}

export const useFormToVotingProcessRequest = () => {
  const { permission } = useSubscription()
  const { organization } = useOrganization()

  const parseLocalDateTime = (dateStr?: string, timeStr?: string): string | undefined => {
    if (!dateStr || !timeStr) return undefined
    return parseFormDateTime(dateStr, timeStr).toISOString()
  }

  return (form: Process, censusSpec: CensusSpec): CreateVotingProcessRequest => {
    // The SAAS API rejects processes without an owner org. Draft saves are skipped and
    // the publish/save buttons are disabled until the address resolves, so reaching this
    // guard means a caller bypassed those checks.
    if (!organization?.address) {
      throw new Error('Organization address is not available yet')
    }

    const parsedStart = form.autoStart ? undefined : parseLocalDateTime(form.startDate, form.startTime)
    const startRef = parsedStart ? new Date(parsedStart) : new Date()
    const endDate =
      form.endDate && form.endTime ? parseLocalDateTime(form.endDate, form.endTime) : addDays(startRef, 1).toISOString()

    const secretUntilTheEnd = form.resultVisibility === 'hidden'

    const questions: VotingProcessQuestionRequest[] = form.questions.map((question) => {
      const choices: Choice[] = question.options.map((q: Option, i: number) => ({
        title: { default: q.option },
        value: i,
      }))

      const metadata: Record<string, unknown> | undefined = question.extendedInfo
        ? {
            choices: question.options.map((q, i) => ({ value: i, description: q.description, image: q.image })),
          }
        : undefined

      if (question.type === SelectorTypes.Multiple) {
        const maxChoices =
          (question.maxNumberOfChoices ?? 0) > 0 ? question.maxNumberOfChoices! : question.options.length
        return {
          title: { default: question.title },
          description: question.description ? { default: question.description } : undefined,
          choices,
          type: 'multichoice',
          // uniqueChoices must stay false on multichoice: the backend derives the
          // dense 0/1 layout (one field per choice) and maps this flag onto the
          // on-chain uniqueValues, which would discard every multi-selection
          // ballot at tally — the API rejects the combination since ballot 1.0.0.
          typeSetup: { maxChoices, minChoices: question.minNumberOfChoices ?? 0, uniqueChoices: false },
          secretUntilTheEnd,
          metadata,
        }
      }

      return {
        title: { default: question.title },
        description: question.description ? { default: question.description } : undefined,
        choices,
        type: 'singlechoice',
        secretUntilTheEnd,
        metadata,
      }
    })

    const request: CreateVotingProcessRequest & { initialStatus?: string } = {
      orgAddress: organization.address,
      title: { default: form.title },
      description: form.description ? { default: form.description } : undefined,
      startDate: parsedStart,
      endDate,
      streamUri: permission(SubscriptionPermission.LiveStreaming) ? form.streamUri || undefined : undefined,
      // Same treatment as streamUri: the plan gates blind-CSP censuses, and the
      // backend rejects the publish (opaquely, inside the job) rather than the
      // draft, so never let the flag through on a plan without the feature.
      census: permission(SubscriptionPermission.Anonymous) ? censusSpec : { ...censusSpec, anonymous: undefined },
      questions,
    }
    return request
  }
}
