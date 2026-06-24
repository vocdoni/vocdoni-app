import { useMutation } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/OrgContext'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

// POST /organizations/{address}/ticket. `type` is a free-form ticket category.
export type SupportTicket = {
  type: string
  title: string
  description: string
}

/** Submits a support ticket for the active organization. */
export const useSendTicket = () => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()

  return useMutation<void, Error, SupportTicket>({
    mutationFn: (body) =>
      bearedFetch<void>(ApiEndpoints.OrganizationTicket.replace('{address}', ensure0x(selectedAddress!)), {
        method: 'POST',
        body,
      }),
  })
}
