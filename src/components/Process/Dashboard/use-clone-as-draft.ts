import { useElection } from '@vocdoni/react-components'
import { isSecretUntilTheEnd } from '@vocdoni/api-client'
import type { LocalizedInput, VotingProcessQuestion } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { Routes } from '~src/router/routes'
import { useCreateProcess } from '../Create'
import { defaultProcessValues, SelectorTypes } from '../Create/common'

/** Resolve a LocalizedInput (string | Record<string,string>) to a plain string. */
const localStr = (v?: LocalizedInput): string => (typeof v === 'string' ? v : (v?.default ?? ''))

/** Per-choice extended info the create flow stores under `question.metadata.choices`. */
type ChoiceMeta = { value: number; description?: string; image?: string }

const choiceMetas = (question: VotingProcessQuestion): ChoiceMeta[] => {
  const choices = question.metadata?.choices
  return Array.isArray(choices) ? (choices as ChoiceMeta[]) : []
}

// `VotingProcessQuestion.type` is stored using the API's canonical lowercase names
// (VOTING_PROCESS_QUESTION_TYPES), not the app's camelCase SelectorTypes.
const MULTICHOICE_QUESTION_TYPE: VotingProcessQuestion['type'] = 'multichoice'

export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { election } = useElection()
  const createProcess = useCreateProcess()
  const { permission } = useSubscription()
  const limit = permission(SubscriptionPermission.Drafts)

  const cloneAsDraft = async () => {
    if (!election?.id || !election.questions?.length) return

    // The create flow only produces uniform singlechoice/multichoice processes, so the
    // first question determines the selector type of the cloned draft.
    const firstQuestion = election.questions[0]
    const questionType =
      firstQuestion.type === MULTICHOICE_QUESTION_TYPE ? SelectorTypes.Multiple : SelectorTypes.Single

    // For multiple choice: derive limits from the question type setup (ballotProtocol as fallback)
    const choiceLimits =
      questionType === SelectorTypes.Multiple
        ? {
            min: firstQuestion.typeSetup?.minChoices ?? 0,
            max: firstQuestion.typeSetup?.maxChoices ?? firstQuestion.ballotProtocol?.maxCount ?? 0,
          }
        : undefined

    const isWeighted = election.census?.weighted ?? false

    // Extended info: true when any choice has a non-empty description or image in its metadata
    const extendedInfo = election.questions.some((q) =>
      choiceMetas(q).some(
        (m) =>
          (typeof m.description === 'string' && m.description.length > 0) ||
          (typeof m.image === 'string' && m.image.length > 0)
      )
    )

    const metadata = {
      ...defaultProcessValues,
      title: localStr(election.title),
      description: localStr(election.description),
      extendedInfo,
      questionType,
      minNumberOfChoices: questionType === SelectorTypes.Multiple ? (choiceLimits?.min ?? 0) : null,
      maxNumberOfChoices:
        questionType === SelectorTypes.Multiple ? (choiceLimits?.max ?? firstQuestion.choices.length ?? null) : null,
      resultVisibility: isSecretUntilTheEnd(election) ? ('hidden' as const) : ('live' as const),
      weightedVote: Boolean(isWeighted),
      questions: election.questions.map((question) => {
        const metas = choiceMetas(question)
        return {
          title: localStr(question.title),
          description: localStr(question.description),
          options: question.choices.map((option) => {
            const m = metas.find((entry) => entry.value === option.value)
            return {
              option: localStr(option.title),
              description: m?.description !== undefined ? m.description : undefined,
              image: m?.image !== undefined ? m.image : undefined,
            }
          }),
        }
      }),
    }

    try {
      const clonedDraftId = await createProcess.mutateAsync({
        metadata,
        orgAddress: election.orgAddress,
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
