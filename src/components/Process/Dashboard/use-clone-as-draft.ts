import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router'
import { useSubscription } from '~components/Auth/Subscription'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useVoteGroupApi, voteGroupDescription } from '~src/queries/voteGroups'
import { Routes } from '~src/router/routes'
import { processTitle } from '../List/organize'
import { useCreateProcess } from '../Create'
import { cloneWithOwnCensus } from '../Create/census/clone'
import { voteGroupTitle } from '../Create/census/useCensusAttach'
import { isDraftLimitError } from '../Create/draft-limit'
import { votingProcessToCreateRequest } from '../Create/draft-mapping'

/**
 * Copies a process into a new draft and opens it. The copy never shares the original's census: it
 * gets a copy of its own (Everyone stays Everyone), see `cloneWithOwnCensus`.
 */
export const useCloneProcess = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const createProcess = useCreateProcess()
  const { permission } = useSubscription()
  const limit = permission(SubscriptionPermission.Drafts)
  const voteGroups = useVoteGroupApi()
  const language = usePublicLanguage()

  const clone = async (election?: VotingProcessResponse | null) => {
    if (!election?.id || !election.questions?.length) return

    try {
      const request = votingProcessToCreateRequest(election, election.orgAddress)
      const name = processTitle(election, language)
      const clonedDraftId = voteGroups
        ? await cloneWithOwnCensus(voteGroups, {
            request,
            create: (body) => createProcess.mutateAsync(body),
            name,
            title: voteGroupTitle(t, name),
            description: voteGroupDescription(t, name),
          })
        : await createProcess.mutateAsync({ ...request, census: { ...request.census, groupId: undefined } })

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
          pathname: generatePath(Routes.processes.create, { page: '1' }),
          search: createSearchParams({ draftId: clonedDraftId }).toString(),
        },
        { replace: true }
      )
    } catch (error) {
      // Only blame the plan when the plan is the reason: any other failure says what went wrong
      toast({
        title: t('drafts.cloned_draft_error', { defaultValue: 'Error cloning draft' }),
        description: isDraftLimitError(error)
          ? t('process.create.limit_reached.message', {
              defaultValue:
                "You've reached your limit of {{ count }} drafts. To save this draft, delete an existing draft or upgrade your plan.",
              count: limit,
            })
          : error instanceof Error
            ? error.message
            : undefined,
        type: 'error',
        duration: 10000,
        isClosable: true,
      })
    }
  }

  return { clone, isCloning: createProcess.isPending }
}

/** {@link useCloneProcess} for the process of the surrounding ElectionProvider. */
export const useCloneAsDraft = () => {
  const { election } = useElection()
  const { clone, isCloning } = useCloneProcess()

  return { cloneAsDraft: () => clone(election), isCloning }
}
