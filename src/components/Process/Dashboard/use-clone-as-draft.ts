import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
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

// The copies in flight, by source process, shared by every instance of the hook: one page offers "Duplicate" in the
// header, the idle card and the sheet, and tapping two of them must make one draft (a second may hit the draft limit).
const cloning = new Set<string>()
const listeners = new Set<() => void>()
const setCloning = (id: string, on: boolean) => {
  if (on) cloning.add(id)
  else cloning.delete(id)
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const anyCloning = () => cloning.size > 0

/**
 * Copies a process into a new draft and opens it in the wizard. Takes the process, so list rows (which have no
 * ElectionProvider) and the vote page share it. Starting paused travels only while QUESTION_BY_QUESTION is on:
 * with it off nobody could manage the copy's paused questions from the wizard, so the copy starts open and says so.
 */
export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const createProcess = useCreateProcess()
  const { DISABLE_ANONYMOUS_VOTING: disableAnonymousVoting, QUESTION_BY_QUESTION: questionByQuestion } = useAppEnv()
  const isCloning = useSyncExternalStore(subscribe, anyCloning, anyCloning)

  const cloneAsDraft = async (process: VotingProcessResponse | null | undefined) => {
    // Callers only offer it for a process with questions; an empty draft has nothing to copy.
    if (!process?.id || !process.questions?.length || cloning.has(process.id)) return
    const sourceId = process.id
    setCloning(sourceId, true)

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
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })

      // A new history entry: Back from the wizard returns to the list or the vote it was copied from.
      navigate({
        pathname: generatePath(Routes.processes.create),
        search: createSearchParams({ draftId: clonedDraftId }).toString(),
      })
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
    } finally {
      setCloning(sourceId, false)
    }
  }

  return { cloneAsDraft, isCloning }
}
