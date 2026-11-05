import { getElectionTitle, useElection, useElectionAuth } from '@vocdoni/react-components'
import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CertButton } from './CertButton'
import { useCertificateAuthContext } from './CertificateAuthProvider'
import { CertificateSlot } from './CertificateSlot'
import { ErrorBlock } from './ErrorBlock'
import { getErrorSpec } from './errorSpec'
import { IdentifiedStrip } from './IdentifiedStrip'
import { IdentifyPanel } from './IdentifyPanel'
import { CheckingPanel, OpeningPanel, StalledPanel } from './ProgressPanels'
import type { CertPhase } from './useCertificateAuth'
import { usePanelFocus } from './usePanelFocus'

type Flow = NonNullable<ReturnType<typeof useCertificateAuthContext>>

// Only an open vote takes a sign-in: ended, canceled, results and upcoming votes get no panel.
const useVotingOpen = () => {
  const { status } = useElection()
  return status === 'ONGOING' || status === 'PAUSED'
}

// The server pass already shows the idle panel, so settling on idle after hydration must not move focus.
const focusKey = (phase: CertPhase) => (phase.kind === 'ssr' ? 'idle' : phase.kind)

const CertificatePanel = ({ flow }: { flow: Flow }) => {
  const { t, i18n } = useTranslation()
  const { election } = useElection()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { phase, start, retry } = flow

  const spec =
    phase.kind === 'error'
      ? getErrorSpec(phase.error, {
          t,
          language: i18n.resolvedLanguage ?? i18n.language,
          mode: 'vote',
          closesAt: election?.endDate ? new Date(election.endDate) : undefined,
          onRetry: start,
        })
      : null

  let title: string
  if (spec) title = spec.title
  else if (phase.kind === 'starting')
    title = t('cert_auth.opening.title', { defaultValue: 'Opening the certificate window...' })
  else if (phase.kind === 'checking')
    title = phase.slow
      ? t('cert_auth.checking.slow_title', { defaultValue: 'Still checking with your certificate provider...' })
      : t('cert_auth.checking.title', { defaultValue: 'Checking your certificate...' })
  else if (phase.kind === 'stalled') title = t('cert_auth.stalled.title', { defaultValue: "The check didn't finish" })
  else title = t('cert_auth.identify.title', { defaultValue: 'Identify to vote' })

  usePanelFocus(headingRef, focusKey(phase), {
    title,
    vote: getElectionTitle(election),
    error: phase.kind === 'error',
    skipInitial: phase.kind === 'ssr' || phase.kind === 'idle',
  })

  let panel: ReactNode
  if (phase.kind === 'error' && spec)
    panel = (
      <ErrorBlock
        spec={spec}
        headingRef={headingRef}
        reference={phase.error.data.reference}
        hasHolderData={!!phase.error.data.holder}
      />
    )
  else if (phase.kind === 'starting') panel = <OpeningPanel ref={headingRef} />
  else if (phase.kind === 'checking') panel = <CheckingPanel ref={headingRef} slow={phase.slow} />
  else if (phase.kind === 'stalled') panel = <StalledPanel ref={headingRef} onRetry={retry} />
  else panel = <IdentifyPanel ref={headingRef} resume={phase.kind === 'idle' && phase.resume} onStart={start} />

  return (
    <CertificateSlot phase={phase} idle={<IdentifyPanel onStart={start} />} returning={<CheckingPanel />}>
      {panel}
    </CertificateSlot>
  )
}

/** The certificate sign-in panel above the ballot: progress panels, the error block and the identified strip. */
export const CertificateIdentify = ({ onIdentified }: { onIdentified(): void }) => {
  const flow = useCertificateAuthContext()
  const open = useVotingOpen()
  const { connected } = useElectionAuth()
  const kind = flow?.phase.kind
  const reset = flow?.reset
  const onIdentifiedRef = useRef(onIdentified)
  onIdentifiedRef.current = onIdentified
  const wasConnected = useRef(false)

  useEffect(() => {
    if (kind === 'identified') onIdentifiedRef.current()
  }, [kind])

  // A logout from the aside ends the session under the strip: go back to the sign-in panel.
  useEffect(() => {
    if (kind !== 'identified') {
      wasConnected.current = false
      return
    }
    if (connected) wasConnected.current = true
    else if (wasConnected.current) reset?.()
  }, [connected, kind, reset])

  if (!flow || !open) return null
  if (flow.phase.kind === 'identified') return <IdentifiedStrip holder={flow.phase.holder} onLogout={flow.logout} />
  if (flow.phase.kind === 'checked') return null
  return <CertificatePanel flow={flow} />
}

/** The sticky action under the ballot: the certificate button while the voter has not started. */
export const CertificateStickyAction = () => {
  const flow = useCertificateAuthContext()
  const open = useVotingOpen()
  if (!flow || !open) return null
  const button = <CertButton size='md' onClick={() => void flow.start()} />
  // During SSR and hydration the phase is 'ssr': place the button in the idle slot so the head
  // script hides it on returns before first paint, avoiding a pop-in on slow devices.
  if (flow.phase.kind === 'ssr') {
    return (
      <CertificateSlot phase={flow.phase} idle={button} returning={null}>
        {null}
      </CertificateSlot>
    )
  }
  if (flow.phase.kind !== 'idle') return null
  return button
}

/** Tells the ballot whether a certificate attempt is in flight, so it can dim and mark itself busy. */
export const CertificateBallotState = ({ children }: { children: (busy: boolean) => ReactNode }) => {
  const kind = useCertificateAuthContext()?.phase.kind
  return <>{children(kind === 'starting' || kind === 'checking')}</>
}
