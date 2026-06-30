import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'

type ProvisionedOrganization = { address: string }

/**
 * Self-serve integrator org provisioning. A signed-in integrator always has exactly one
 * organization, so when none exists yet (e.g. right after sign-up) we create one in the
 * background with no form:
 * - `provisionAccount: true` makes the backend forge the on-chain account at creation time,
 *   so the client never needs an SDK signer/wallet step.
 * - `integrator: true` subscribes the org to the free integrator plan, so `users/me` then
 *   reports `isIntegrator: true`.
 * `type: 'others'` and all other fields are defaults the user can edit later. On success the
 * profile is refreshed so the new org shows up.
 */
export const useProvisionIntegratorOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<ProvisionedOrganization, Error>({
    mutationFn: () =>
      bearedFetch<ProvisionedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { type: 'others', provisionAccount: true, integrator: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}
