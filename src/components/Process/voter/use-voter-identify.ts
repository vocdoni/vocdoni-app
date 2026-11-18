import { useMutation } from '@tanstack/react-query'
import type { AuthRequest } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import { cspAuthMutationKey, isCspMismatch, useCspErrorDetails } from '~components/Process/CSP/basics'

/**
 * A failed identification: whether it is a failed match (every field marked), today's message for it, and whether
 * that message is one of the refusals the app words (`known`); otherwise it is the SDK's own text, never shown, and
 * `cause` is what the screen logs for support.
 */
export type VoterIdentifyError = { mismatch: boolean; message: string; known: boolean; cause?: unknown }

/**
 * Auth step 0 for the voter page: the identify dialog's mutation (same key, so the in-flight guards are shared), with
 * the failure kept as a match failure or not (audit F10). The messages stay `translateCspError`'s.
 */
export const useVoterIdentify = () => {
  const { auth0 } = useElectionAuth()
  const translate = useCspErrorDetails()
  return useMutation<void, VoterIdentifyError, AuthRequest>({
    mutationKey: [...cspAuthMutationKey, 0],
    mutationFn: async (participant) => {
      try {
        await auth0(participant)
      } catch (error) {
        const { message, known } = translate(error)
        throw { mismatch: isCspMismatch(error), message, known, cause: error } satisfies VoterIdentifyError
      }
    },
  })
}
