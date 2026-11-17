import { useMutation } from '@tanstack/react-query'
import type { AuthRequest } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import { cspAuthMutationKey, isCspMismatch, useTranslateCspError } from '~components/Process/CSP/basics'

/** A failed identification: whether it is a failed match (every field marked) and today's message for it. */
export type VoterIdentifyError = { mismatch: boolean; message: string }

/**
 * Auth step 0 for the voter page: the identify dialog's mutation (same key, so the in-flight guards are shared), with
 * the failure kept as a match failure or not (audit F10). The messages stay `useTranslateCspError`'s.
 */
export const useVoterIdentify = () => {
  const { auth0 } = useElectionAuth()
  const translate = useTranslateCspError()
  return useMutation<void, VoterIdentifyError, AuthRequest>({
    mutationKey: [...cspAuthMutationKey, 0],
    mutationFn: async (participant) => {
      try {
        await auth0(participant)
      } catch (error) {
        throw { mismatch: isCspMismatch(error), message: translate(error).message } satisfies VoterIdentifyError
      }
    },
  })
}
