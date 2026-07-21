import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'

export type SupportTicket = {
  title: string
  type: string
  description: string
}

export const useSendSupportTicket = (options?: Omit<UseMutationOptions<void, Error, SupportTicket>, 'mutationFn'>) => {
  const { t } = useTranslation()
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation<void, Error, SupportTicket>({
    mutationFn: (params: SupportTicket) => {
      // Fail fast rather than POSTing to organizations/undefined/ticket. The
      // message can surface in user-facing toasts, so keep it localized.
      if (!account?.address) {
        return Promise.reject(
          new Error(
            t('form.support.no_organization', {
              defaultValue: 'Your organization is not ready yet. Please try again in a moment.',
            })
          )
        )
      }
      return bearedFetch<void>(ApiEndpoints.OrganizationsSupport.replace('{address}', account.address), {
        body: params,
        method: 'POST',
      })
    },
    ...options,
  })
}
