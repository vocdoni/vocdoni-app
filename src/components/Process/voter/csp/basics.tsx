import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { AuthRequest, OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useOptionalCspAuthContext } from './CspStepsProvider'

export type CensusData = {
  authFields: OrgMemberAuthField[]
  twoFaFields: OrgMemberTwoFaField[]
}

export type AuthFieldType = OrgMemberAuthField
export type TwoFaFieldType = OrgMemberTwoFaField

export type ResendChallengePayload = {
  email?: string
  phone?: string
}

// Seconds until a rate-limited voter may retry, from the 40017 body's `data.retryAfter`.
const retryAfterSeconds = (body: unknown): number | undefined => {
  if (typeof body !== 'object' || body === null || !('data' in body)) return undefined
  const { data } = body
  if (typeof data !== 'object' || data === null || !('retryAfter' in data)) return undefined
  const { retryAfter } = data
  return typeof retryAfter === 'number' && retryAfter > 0 ? retryAfter : undefined
}

/** A failed match (unknown participant, wrong contact or password): every field is suspect, none is named. */
export const isCspMismatch = (error: unknown): boolean =>
  error instanceof VocdoniApiError && (error.code === 40029 || error.code === 40802)

/** The request a CSP auth error came from: the same codes mean different things on each (`translateCspError`). */
export type CspAuthStep = 'identify' | 'code' | 'resend'

/** A CSP auth failure as the voter reads it, and whether it was one of the refusals worded here. */
export type TranslatedCspError = { message: string; known: boolean }

/**
 * Maps the SaaS CSP auth error codes to translated, voter-facing messages (`known: true`), per step as the SDK does
 * (`translateCspAuthError`). Any other failure keeps the API's own message with `known: false`, so a screen can decide
 * not to show it. With `hasPassword` a failed match does not blame any single field.
 */
export const translateCspError = (
  error: unknown,
  t: TFunction,
  { hasPassword = false, step = 'identify' }: { hasPassword?: boolean; step?: CspAuthStep } = {}
): TranslatedCspError => {
  const known = (message: string): TranslatedCspError => ({ message, known: true })
  if (error instanceof VocdoniApiError) {
    switch (error.code) {
      // 40802 covers both an unknown participant and a contact mismatch; older backends send 40029.
      case 40029:
      case 40802:
        // A wrong password is answered like an unknown participant (no membership oracle), so with a
        // password the message must not blame the password, or any single field, specifically.
        if (hasPassword) {
          return known(
            t('csp.errors.credentials_or_password_incorrect', {
              defaultValue: "We couldn't verify your identity. Check your credentials and your password and try again.",
            })
          )
        }
        return known(
          t('csp.errors.participant_not_found', {
            defaultValue: 'The voter is not listed in the census, or the provided credentials are incorrect.',
          })
        )
      // The backend answers a wrong or expired code, on either step, with 40001. The SDK's own wording for the refusals
      // it words per step lives in its namespace, so they match its copy.
      case 40001:
        if (step === 'code') return known(t('csp.errors.code_rejected', { ns: 'react-components' }))
        if (step === 'resend') return known(t('csp.errors.resend_expired', { ns: 'react-components' }))
        break
      case 40005:
        if (step === 'identify') return known(t('csp.errors.missing_data', { ns: 'react-components' }))
        break
      case 40017: {
        const retryAfter = retryAfterSeconds(error.body)
        if (retryAfter === undefined) {
          if (step === 'resend') return known(t('csp.errors.resend_limit', { ns: 'react-components' }))
          return known(
            t('csp.errors.too_many_attempts', { defaultValue: 'Too many attempts. Please try again later.' })
          )
        }
        if (retryAfter < 3600) {
          return known(
            t('csp.errors.too_many_attempts_minutes', {
              count: Math.max(1, Math.ceil(retryAfter / 60)),
              defaultValue_one: 'Too many attempts. Please try again in {{count}} minute.',
              defaultValue_other: 'Too many attempts. Please try again in {{count}} minutes.',
            })
          )
        }
        return known(
          t('csp.errors.too_many_attempts_hours', {
            count: Math.ceil(retryAfter / 3600),
            defaultValue_one: 'Too many attempts. Please try again in {{count}} hour.',
            defaultValue_other: 'Too many attempts. Please try again in {{count}} hours.',
          })
        )
      }
      case 40103:
        return known(
          t('csp.errors.requests_on_cooldown', {
            defaultValue: 'Too many requests. Please wait a moment before trying again.',
          })
        )
      case 40801:
        return known(
          t('csp.errors.zero_voting_weight', {
            defaultValue: "You don't have enough voting power to access this vote.",
          })
        )
    }
  }
  return { message: error instanceof Error ? error.message : String(error), known: false }
}

/** A refusal `translateCspError` recognised: the mutations below throw it, so a screen can tell it from a raw one. */
export class KnownCspError extends Error {
  /** True when the underlying error was a census-mismatch code (40029 / 40802). */
  readonly isMismatch: boolean
  constructor(message: string, isMismatch = false) {
    super(message)
    this.name = 'KnownCspError'
    this.isMismatch = isMismatch
  }
}

/** `translateCspError` with the page's `t`, the step's request and whether the census asks for a password. */
export const useCspErrorDetails = (step: CspAuthStep = 'identify') => {
  const { t } = useTranslation()
  const hasPassword = !!useOptionalCspAuthContext()?.authFields.includes('password')
  return (error: unknown): TranslatedCspError => translateCspError(error, t, { hasPassword, step })
}

// The dialog's form of `translateCspError`: a recognised refusal as a `KnownCspError` with its message; any other
// failure is passed on as it came (an Error), keeping the API's own message.
const useTranslateCspError = (step: CspAuthStep) => {
  const details = useCspErrorDetails(step)

  return (error: unknown): Error => {
    const { message, known } = details(error)
    if (known) return new KnownCspError(message, isCspMismatch(error))
    return error instanceof Error ? error : new Error(String(error))
  }
}

// Both auth steps are keyed under one prefix so their in-flight state outlives
// the dialog that started them: closing the modal unmounts the step (and its
// mutation observer), but not the request.
export const cspAuthMutationKey = ['csp', 'auth']

// Step 0 — identify the participant against the process census. For auth-only
// censuses (no 2FA fields) the provider already marks the voter connected.
export const useCspAuth0 = () => {
  const { auth0 } = useElectionAuth()
  const translateError = useTranslateCspError('identify')

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
  const translateError = useTranslateCspError('code')

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
  const translateError = useTranslateCspError('resend')

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
