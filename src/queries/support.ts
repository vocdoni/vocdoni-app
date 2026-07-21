import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'

export type SupportTicket = {
  title: string
  type: string
  description: string
}

export const useSendSupportTicket = (options?: Omit<UseMutationOptions<void, Error, SupportTicket>, 'mutationFn'>) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation<void, Error, SupportTicket>({
    mutationFn: (params: SupportTicket) => {
      // Fail fast rather than POSTing to organizations/undefined/ticket
      if (!account?.address) {
        return Promise.reject(new Error('Cannot send support ticket: no organization account available'))
      }
      return bearedFetch<void>(ApiEndpoints.OrganizationsSupport.replace('{address}', account.address), {
        body: params,
        method: 'POST',
      })
    },
    ...options,
  })
}
