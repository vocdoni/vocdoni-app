import { useElection } from '@vocdoni/react-providers'
import { ensure0x, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, useNavigate } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { Routes } from '~src/router/routes'
import { useCreateProcess } from '../Create'
import { defaultProcessValues } from '../Create/common'

export const useCloneAsDraft = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { election } = useElection()
  const createProcess = useCreateProcess()
  const { permission } = useSubscription()
  const limit = permission(SubscriptionPermission.Drafts)

  const cloneAsDraft = async () => {
    if (!election || election instanceof InvalidElection) return

    const extendedInfo = election.questions.some((question) =>
      question.choices.some(({ meta }) => meta && (meta.description || meta.image?.default))
    )

    const metadata = {
      ...defaultProcessValues,
      title: election.title.default,
      description: election.description.default,
      extendedInfo,
      questions: election.questions.map((question) => {
        return {
          title: question.title.default,
          description: question.description.default,
          options: question.choices.map((option) => ({
            option: option.title.default,
            description: option.meta?.description,
            image: option.meta?.image?.default,
          })),
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
