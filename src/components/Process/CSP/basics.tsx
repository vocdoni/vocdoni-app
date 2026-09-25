import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { AuthRequest, OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'

export type CensusData = {
  authFields: OrgMemberAuthField[]
  twoFaFields: OrgMemberTwoFaField[]
}

export type AuthFieldType = OrgMemberAuthField
export type TwoFaFieldType = OrgMemberTwoFaField

export type CSPFormData = {
  memberNumber?: string
  name?: string
  surname?: string
  nationalId?: string
  birthDate?: string
  email?: string
  phone?: string
} & Record<string, string>

export type CSPStep0FormData = CSPFormData

export type CSPStep0RequestData = CSPFormData

export type ResendChallengePayload = {
  email?: string
  phone?: string
}

// Maps the SaaS CSP auth error codes to translated, voter-facing messages. Any
// other failure keeps the API's own message.
const useTranslateCspError = () => {
  const { t } = useTranslation()

  return (error: unknown): Error => {
    if (error instanceof VocdoniApiError) {
      switch (error.code) {
        case 40029:
          return new Error(
            t('csp.errors.participant_not_found', {
              defaultValue: 'The voter is not listed in the census, or the provided credentials are incorrect.',
            })
          )
        case 40103:
          return new Error(
            t('csp.errors.requests_on_cooldown', {
              defaultValue: 'Too many requests. Please wait a moment before trying again.',
            })
          )
        case 40801:
          return new Error(
            t('csp.errors.zero_voting_weight', {
              defaultValue: "You don't have enough voting power to access the election.",
            })
          )
      }
    }

    return error instanceof Error ? error : new Error(String(error))
  }
}

// Both auth steps are keyed under one prefix so their in-flight state outlives
// the dialog that started them: closing the modal unmounts the step (and its
// mutation observer), but not the request.
const cspAuthMutationKey = ['csp', 'auth']

// Step 0 — identify the participant against the process census. For auth-only
// censuses (no 2FA fields) the provider already marks the voter connected.
export const useCspAuth0 = () => {
  const { auth0 } = useElectionAuth()
  const translateError = useTranslateCspError()

  return useMutation<void, Error, AuthRequest>({
    mutationKey: [...cspAuthMutationKey, 0],
    mutationFn: async (participant) => {
      try {
        await auth0(participant)
      } catch (error) {
        throw translateError(error)
      }
    },
  })
}

// Step 1 — confirm the 2FA challenge (OTP); marks the voter connected.
export const useCspAuth1 = () => {
  const { auth1 } = useElectionAuth()
  const translateError = useTranslateCspError()

  return useMutation<void, Error, string>({
    mutationKey: [...cspAuthMutationKey, 1],
    mutationFn: async (code) => {
      try {
        await auth1(code)
      } catch (error) {
        throw translateError(error)
      }
    },
  })
}

// true while any auth request (identify, OTP or resend) is in flight, whichever
// Identify dialog (open or already closed) sent it. The flow is shared by every
// button, so a late completion would move it under whichever dialog is open.
export const useCspAuthPending = () => useIsMutating({ mutationKey: cspAuthMutationKey }) > 0

// Same check, read at call time: handlers such as the PIN auto-submit may run
// before the render that would reflect a request just sent.
export const useIsCspAuthBusy = () => {
  const client = useQueryClient()
  return () => client.isMutating({ mutationKey: cspAuthMutationKey }) > 0
}

// Resend the pending 2FA challenge to the voter's contact.
export const useCspResend = () => {
  const { resend } = useElectionAuth()
  const translateError = useTranslateCspError()

  return useMutation<void, Error, ResendChallengePayload>({
    mutationKey: [...cspAuthMutationKey, 'resend'],
    mutationFn: async (contact) => {
      try {
        await resend(contact)
      } catch (error) {
        throw translateError(error)
      }
    },
  })
}
