import { useElection } from '@vocdoni/react-components'
import type { LocalizedInput } from '@vocdoni/api-types'
import { BallotType, inferBallotType } from '@vocdoni/ballot'
import { ElectionResultsTypeNames, ensure0x, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { Routes } from '~src/router/routes'
import { useCreateProcess } from '../Create'
import { defaultProcessValues, SelectorTypes } from '../Create/common'

const BALLOT_TO_RESULTS_TYPE_NAME: Record<BallotType, ElectionResultsTypeNames> = {
  [BallotType.SingleChoice]: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
  [BallotType.MultiChoice]: ElectionResultsTypeNames.MULTIPLE_CHOICE,
  [BallotType.Approval]: ElectionResultsTypeNames.APPROVAL,
  [BallotType.Budget]: ElectionResultsTypeNames.BUDGET,
  [BallotType.Quadratic]: ElectionResultsTypeNames.QUADRATIC,
}

/** Resolve a LocalizedInput (string | Record<string,string>) to a plain string. */
const localStr = (v?: LocalizedInput): string => (typeof v === 'string' ? v : (v?.default ?? ''))

/** Shape of the SAAS-stored per-choice metadata (optional extension of api-types Choice). */
type ChoiceWithMeta = {
  meta?: {
    description?: string
    image?: { default?: string }
  }
}

export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { election } = useElection()
  const createProcess = useCreateProcess()
  const { permission } = useSubscription()
  const limit = permission(SubscriptionPermission.Drafts)

  const cloneAsDraft = async () => {
    if (!election) return

    // InvalidElection instances (SDK draft state) have no questions/voteType
    if (election instanceof InvalidElection) return

    // Guard: if voteType or questions are missing (edge-case mocks / malformed data), default to single-choice
    const ballot = election.voteType && election.questions ? inferBallotType(election) : BallotType.SingleChoice
    const resultsTypeName = BALLOT_TO_RESULTS_TYPE_NAME[ballot]
    const questionType =
      resultsTypeName === ElectionResultsTypeNames.MULTIPLE_CHOICE ? SelectorTypes.Multiple : SelectorTypes.Single

    // For multiple choice: derive limits from voteType
    const choiceLimits =
      questionType === SelectorTypes.Multiple ? { min: 0, max: election.voteType?.maxCount ?? 0 } : undefined

    const isWeighted = election.census?.weighted ?? false

    // Extended info: true when any choice has a non-empty description or image in its SAAS meta
    const extendedInfo = (election.questions ?? []).some((q) =>
      q.choices.some((c) => {
        const m = (c as unknown as ChoiceWithMeta).meta
        return (
          (typeof m?.description === 'string' && m.description.length > 0) ||
          (typeof m?.image?.default === 'string' && m.image.default.length > 0)
        )
      })
    )

    const metadata = {
      ...defaultProcessValues,
      title: localStr(election.title),
      description: localStr(election.description),
      extendedInfo,
      questionType,
      minNumberOfChoices: questionType === SelectorTypes.Multiple ? (choiceLimits?.min ?? 0) : null,
      maxNumberOfChoices:
        questionType === SelectorTypes.Multiple
          ? (choiceLimits?.max ?? election.questions?.[0]?.choices.length ?? null)
          : null,
      resultVisibility: election.electionType.secretUntilTheEnd ? ('hidden' as const) : ('live' as const),
      weightedVote: Boolean(isWeighted),
      questions: (election.questions ?? []).map((question) => {
        return {
          title: localStr(question.title),
          description: localStr(question.description),
          options: question.choices.map((option) => {
            const m = (option as unknown as ChoiceWithMeta).meta
            return {
              option: localStr(option.title),
              description: m?.description !== undefined ? m.description : undefined,
              image: m?.image?.default !== undefined ? m.image.default : undefined,
            }
          }),
        }
      }),
    }

    try {
      const clonedDraftId = await createProcess.mutateAsync({
        metadata,
        orgAddress: ensure0x(election.organizationId),
      })

      toast({
        title: t('drafts.cloned_draft', {
          defaultValue: 'Draft cloned successfully',
        }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate(
        {
          pathname: generatePath(Routes.processes.create, { page: 1 }),
          search: createSearchParams({ draftId: clonedDraftId }).toString(),
        },
        { replace: true }
      )
    } catch (error) {
      toast({
        title: t('drafts.cloned_draft_error', { defaultValue: 'Error cloning draft' }),
        description: t('process.create.limit_reached.message', {
          defaultValue:
            "You've reached your limit of {{ count }} drafts. To save this draft, delete an existing draft or upgrade your plan.",
          count: limit,
        }),
        type: 'error',
        duration: 10000,
        isClosable: true,
      })
    }
  }

  return { cloneAsDraft }
}
