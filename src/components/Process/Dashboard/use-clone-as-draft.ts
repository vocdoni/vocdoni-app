import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router'
import { useSubscription } from '~components/Auth/Subscription'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { Routes } from '~src/router/routes'
import { useCreateProcess } from '../Create'
import { votingProcessToCreateRequest } from '../Create/draft-mapping'

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
