import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router'
import { apiErrorDetails, ErrorCode } from '~components/Auth/api'
import { useToast } from '~components/Toast'
import { MaxDraftsPerOrg } from '~constants'
import { Routes } from '~src/router/routes'
import { useCreateProcess } from '../Create'
import { votingProcessToCreateRequest } from '../Create/draft-mapping'

export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { election } = useElection()
  const createProcess = useCreateProcess()

  const cloneAsDraft = async () => {
    if (!election?.id || !election.questions?.length) return

    try {
      const clonedDraftId = await createProcess.mutateAsync(votingProcessToCreateRequest(election, election.orgAddress))

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

  return { cloneAsDraft }
}
