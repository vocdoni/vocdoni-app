import { useElection, useElectionAuth } from '@vocdoni/react-components'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CertificateAuthApi } from '~queries/certificateAuth/client'
import { CERT_RETURN_ATTRIBUTE } from '~queries/certificateAuth/returnScript'
import {
  challengeFor,
  clearPending,
  clearReturnStash,
  createVerifier,
  dropVerifier,
  purgeExpiredVerifiers,
  readPending,
  readReturnStash,
  readVerifier,
  saveVerifier,
  setPending,
  VERIFIER_TTL_MS,
} from '~queries/certificateAuth/storage'
import {
  CertAuthError,
  isCertAuthServerCode,
  RECOVERY_CODES,
  type CertAuthPurpose,
  type CertHolder,
  type RedeemCertAuthResponse,
} from '~queries/certificateAuth/types'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { adoptCertificateSession, installCertificateBridge } from './sdk-bridge'

export type CertPhase =
  | { kind: 'ssr' }
  | { kind: 'idle'; resume?: boolean }
  | { kind: 'starting' }
  | { kind: 'checking'; slow: boolean }
  | { kind: 'stalled' }
  | { kind: 'identified'; holder: CertHolder }
  | { kind: 'checked'; holder: CertHolder }
  | { kind: 'error'; error: CertAuthError }

export const REDEEM_SLOW_MS = 15_000
export const REDEEM_TIMEOUT_MS = 45_000
export const PROBE_TIMEOUT_MS = 3_000

// One redeem per code, whatever remounts (StrictMode, two panels): a second call would burn it.
const inFlight = new Map<string, Promise<RedeemCertAuthResponse>>()

const isAbort = (error: unknown) =>
  error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')

const asCertError = (error: unknown) => (error instanceof CertAuthError ? error : new CertAuthError('internal'))

// auth0 throws this while ElectionProvider has no process yet; the redeemed token is still good then.
const isElectionNotLoaded = (error: unknown) => error instanceof Error && /not loaded yet/i.test(error.message)

const isHttps = (url: string) => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

type Redeemed = { result: RedeemCertAuthResponse; purpose: CertAuthPurpose }

type Options = {
  processId: string | undefined
  purpose: CertAuthPurpose
  api: CertificateAuthApi
  /** Injected for tests; the real one leaves no history entry behind. */
  navigate?: (url: string) => void
  /** The mock adapter returns to the app over plain http in local dev. */
  allowInsecureAuthUrl?: boolean
}

const replaceLocation = (url: string) => window.location.replace(url)

export const useCertificateAuth = ({
  processId,
  purpose,
  api,
  navigate = replaceLocation,
  allowInsecureAuthUrl = false,
}: Options) => {
  const { client } = useApiClient()
  const { election, status } = useElection()
  const { auth0, clear } = useElectionAuth()
  const [phase, setPhase] = useState<CertPhase>({ kind: 'ssr' })
  const starting = useRef(false)
  const lastCode = useRef<{ code: string; state: string } | null>(null)
  const initialisedFor = useRef<string | null>(null)
  // A redeem that resolved before the election loaded waits here; the latest provider values live in refs
  // so the mount effect's closure never adopts with a stale auth0.
  const redeemed = useRef<Redeemed | null>(null)
  const latest = useRef({ client, election, status, auth0 })
  latest.current = { client, election, status, auth0 }

  const finish = useCallback(
    (state?: string) => {
      if (state) dropVerifier(state)
      clearReturnStash()
      if (processId) clearPending(processId)
      lastCode.current = null
    },
    [processId]
  )

  const settle = useCallback(async () => {
    const pending = redeemed.current
    const { client, election, status, auth0 } = latest.current
    if (!pending || !processId || !election) return
    // Taken before any await so a re-render cannot adopt the same token twice.
    redeemed.current = null
    const { result, purpose: attempted } = pending
    if (attempted === 'vote' && result.authToken) {
      try {
        installCertificateBridge(client)
        await adoptCertificateSession(auth0, processId, {
          authToken: result.authToken,
          weight: result.weight,
          voterRef: result.voterRef,
        })
      } catch (error) {
        if (isElectionNotLoaded(error)) {
          redeemed.current = pending
          return
        }
        setPhase({ kind: 'error', error: asCertError(error) })
        return
      }
      setPhase({ kind: 'identified', holder: result.holder })
      return
    }
    // A vote attempt without a token is a pre-check only while voting has not opened; after the end the
    // process status decides what the page shows, so this attempt just ends.
    if (attempted === 'check' || status === 'UPCOMING') setPhase({ kind: 'checked', holder: result.holder })
    else setPhase({ kind: 'idle' })
  }, [processId])

  useEffect(() => {
    if (redeemed.current) void settle()
  }, [election, auth0, settle])

  const redeem = useCallback(
    async ({ code, state }: { code: string; state: string }) => {
      if (!processId) return
      const stored = readVerifier(state, processId)
      if (!stored) {
        finish(state)
        setPhase({ kind: 'idle', resume: true })
        return
      }
      lastCode.current = { code, state }
      setPhase({ kind: 'checking', slow: false })
      const slow = setTimeout(
        () => setPhase((p) => (p.kind === 'checking' ? { kind: 'checking', slow: true } : p)),
        REDEEM_SLOW_MS
      )
      try {
        let pending = inFlight.get(code)
        if (!pending) {
          pending = api.redeem(processId, { code, verifier: stored.verifier }, AbortSignal.timeout(REDEEM_TIMEOUT_MS))
          inFlight.set(code, pending)
          pending.finally(() => inFlight.delete(code)).catch(() => {})
        }
        const result = await pending
        // Another caller sharing this redeem already settled it.
        if (lastCode.current?.code !== code) return
        finish(state)
        redeemed.current = { result, purpose: stored.purpose }
        await settle()
      } catch (error) {
        // A slow or dropped connection: the code stays valid until consumed, so keep it for Try again.
        if (isAbort(error) || (error instanceof CertAuthError && error.reason === 'network')) {
          setPhase({ kind: 'stalled' })
          return
        }
        finish(state)
        const certError = asCertError(error)
        setPhase(
          RECOVERY_CODES.has(certError.reason) ? { kind: 'idle', resume: true } : { kind: 'error', error: certError }
        )
      } finally {
        clearTimeout(slow)
      }
    },
    [api, finish, processId, settle]
  )

  // After hydration: pick up a return from the auth host, or a check that never came back.
  useEffect(() => {
    // StrictMode replays effects: a second pass would lose the resume marker the first one cleared.
    if (!processId || initialisedFor.current === processId) return
    initialisedFor.current = processId
    const stash = readReturnStash()
    document.documentElement.removeAttribute(CERT_RETURN_ATTRIBUTE)
    if (stash && 'code' in stash) {
      void redeem(stash)
      return
    }
    if (stash && 'error' in stash) {
      // The error fragment carries no state: the pending marker names the attempt whose verifier goes.
      finish(readPending(processId)?.state)
      const reason = isCertAuthServerCode(stash.error) ? stash.error : 'internal'
      setPhase(
        RECOVERY_CODES.has(reason)
          ? { kind: 'idle', resume: true }
          : { kind: 'error', error: new CertAuthError(reason) }
      )
      return
    }
    const resume = !!readPending(processId)
    clearPending(processId)
    setPhase({ kind: 'idle', resume })
  }, [finish, processId, redeem])

  // Back from the auth host via bfcache: never leave the page stuck on "Opening...".
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !starting.current) return
      starting.current = false
      setPhase({ kind: 'idle' })
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const start = useCallback(async () => {
    if (!processId || starting.current) return
    starting.current = true
    setPhase({ kind: 'starting' })
    let state: string | undefined
    try {
      purgeExpiredVerifiers()
      const verifier = createVerifier()
      const challenge = await challengeFor(verifier)
      // Never the query or fragment: hand-off and mock params must not travel to the auth host.
      const returnUrl = window.location.origin + window.location.pathname
      const created = await api.create(processId, { challenge, challengeMethod: 'S256', returnUrl, purpose })
      state = created.state
      if (!isHttps(created.authUrl) && !allowInsecureAuthUrl) throw new CertAuthError('internal')
      if (!saveVerifier(created.state, { verifier, processId, purpose, expiresAt: Date.now() + VERIFIER_TTL_MS }))
        throw new CertAuthError('internal')
      if (created.probeUrl) await api.probe(created.probeUrl, AbortSignal.timeout(PROBE_TIMEOUT_MS))
      setPending(processId, { state: created.state, startedAt: Date.now() })
      navigate(created.authUrl)
    } catch (error) {
      starting.current = false
      if (state) dropVerifier(state)
      setPhase({ kind: 'error', error: isAbort(error) ? new CertAuthError('network') : asCertError(error) })
    }
  }, [allowInsecureAuthUrl, api, navigate, processId, purpose])

  const retry = useCallback(() => {
    if (lastCode.current) void redeem(lastCode.current)
  }, [redeem])

  const reset = useCallback(() => setPhase({ kind: 'idle' }), [])

  const logout = useCallback(() => {
    clear()
    setPhase({ kind: 'idle' })
  }, [clear])

  return { phase, start, retry, reset, logout }
}
