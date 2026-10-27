import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { AuthRequest, OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import { useElectionAuth } from '@vocdoni/react-components'
import { useEffect, useState } from 'react'
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

// How long the backend makes a voter wait between two sends of a code. Used
// after a successful resend, whose response doesn't carry it.
export const RESEND_COOLDOWN_MS = 60_000

// A request refused because a code was sent too recently (40103). retryAfterMs
// is the wait the backend reported, if it did.
export class CspCooldownError extends Error {
  retryAfterMs?: number

  constructor(message: string, retryAfterMs?: number) {
    super(message)
    this.name = 'CspCooldownError'
    this.retryAfterMs = retryAfterMs
  }
}

// The backend reports the wait left as data.coolDownTime, in milliseconds.
const coolDownTimeMs = (error: VocdoniApiError): number | undefined => {
  const data = (error.body as { data?: { coolDownTime?: unknown } } | null)?.data
  const ms = data?.coolDownTime
  return typeof ms === 'number' && ms > 0 ? ms : undefined
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
        case 40103: {
          const retryAfterMs = coolDownTimeMs(error)
          if (retryAfterMs === undefined) {
            return new CspCooldownError(
              t('csp.errors.requests_on_cooldown', {
                defaultValue: 'Too many requests. Please wait a moment before trying again.',
              })
            )
          }
          return new CspCooldownError(
            t('csp.errors.requests_on_cooldown_seconds', {
              defaultValue: 'You can request a new code in {{seconds}} s.',
              seconds: Math.ceil(retryAfterMs / 1000),
            }),
            retryAfterMs
          )
        }
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

// Seconds left of a wait started with start(ms); 0 when there is none.
export const useCountdown = () => {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (until <= Date.now()) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= until) clearInterval(timer)
    }, 250)
    return () => clearInterval(timer)
  }, [until])

  const start = (ms: number) => {
    const current = Date.now()
    setNow(current)
    setUntil(current + ms)
  }

  return { secondsLeft: Math.max(0, Math.ceil((until - now) / 1000)), start }
}
