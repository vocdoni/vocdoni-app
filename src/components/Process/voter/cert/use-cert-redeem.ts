import { useMutation } from '@tanstack/react-query'
import type { AuthRequest } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { isCspMismatch, cspAuthMutationKey, useCspErrorDetails } from '~components/Process/voter/csp/basics'

/**
 * Step 0 with a certificate code (`certCode`, `codeVerifier`, and the contact of a 2FA census). It shares the CSP auth
 * mutation key, so the in-flight guards of the page cover it. A refused code (40802, 40029) proves nothing about the
 * census: it is spent, expired or bound to another verifier, or the contact does not match.
 */
export const useCertRedeem = () => {
  const { t } = useTranslation()
  const { auth0 } = useElectionAuth()
  const details = useCspErrorDetails()
  return useMutation<void, Error, AuthRequest>({
    retry: false,
    mutationKey: [...cspAuthMutationKey, 0],
    mutationFn: async (request) => {
      try {
        await auth0(request)
      } catch (error) {
        if (isCspMismatch(error)) {
          throw new Error(
            request.email || request.phone
              ? t('csp.cert.errors.code_refused_contact')
              : t('csp.cert.errors.code_refused')
          )
        }
        const { message, known } = details(error)
        if (!known) {
          console.error('Certificate sign-in failed:', error)
          throw new Error(t('csp.cert.errors.generic'))
        }
        throw new Error(message)
      }
    },
  })
}
