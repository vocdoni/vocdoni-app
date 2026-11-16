import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router'
import { apiErrorDetails, ErrorCode } from '~components/Auth/api'
import { useToast } from '~components/Toast'
import { MaxDraftsPerOrg } from '~constants'
import { QueryKeys } from '~queries/keys'
import { useAppEnv } from '~src/app-env'
import { Routes } from '~src/router/routes'
import { isQuestionByQuestion, type CreateVotingProcessRequestWithMode } from '~src/types/voting-process'
import { useCreateProcess } from '../Create'
import { votingProcessToCreateRequest } from '../Create/draft-mapping'

/**
 * Copies a process into a new draft and opens it in the wizard. Takes the process, so list rows (which have no
 * ElectionProvider) and the vote page share it. The voting mode travels only while QUESTION_BY_QUESTION is on:
 * with it off nobody could manage the copy's mode from the wizard, so the copy votes all at once and says so.
 */
export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const createProcess = useCreateProcess()
  const { DISABLE_ANONYMOUS_VOTING: disableAnonymousVoting, QUESTION_BY_QUESTION: questionByQuestion } = useAppEnv()

  const cloneAsDraft = async (process: VotingProcessResponse | null | undefined) => {
    if (!process?.id || !process.questions?.length) return

    const sourceIsByQuestion = isQuestionByQuestion(process)
    const request: CreateVotingProcessRequestWithMode = {
      ...votingProcessToCreateRequest(process, process.orgAddress, disableAnonymousVoting),
      ...(sourceIsByQuestion && questionByQuestion ? { initialStatus: 'PAUSED' as const } : {}),
    }

    try {
      const clonedDraftId = await createProcess.mutateAsync(request)

      toast({
        title: t('drafts.cloned_draft', {
          defaultValue: 'Draft cloned successfully',
        }),
        description:
          sourceIsByQuestion && !questionByQuestion
            ? t('votes.clone.all_at_once', { defaultValue: 'The copy votes all questions at once.' })
            : undefined,
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votes(process.orgAddress) })

      navigate(
        {
          pathname: generatePath(Routes.processes.create),
          search: createSearchParams({ draftId: clonedDraftId }).toString(),
        },
        { replace: true }
      )
    } catch (error) {
      // Any other refusal (a legacy process over today's question cap, for one) carries the backend's own reason
      const isDraftLimit = apiErrorDetails(error)?.code === ErrorCode.DraftLimitReached
      toast({
        title: t('drafts.cloned_draft_error', { defaultValue: 'Error cloning draft' }),
        description: isDraftLimit
          ? t('process.create.limit_reached.message', {
              defaultValue:
                "You've reached your limit of {{ count }} drafts. To save this draft, delete an existing draft.",
              count: MaxDraftsPerOrg,
            })
          : error instanceof Error
            ? error.message
            : String(error),
        type: 'error',
        duration: 10000,
        isClosable: true,
      })
    }
  }

  return { cloneAsDraft, isCloning: createProcess.isPending }
}
