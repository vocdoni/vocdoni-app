import type { VocdoniApiClient } from '@vocdoni/api-client'
import type { AuthRequest, AuthResponse } from '@vocdoni/api-types'

// react-providers 4.0.0 only takes a voter token from `client.elections.authStep0`, so this wraps that
// method: a body carrying the sentinel is answered once from memory, any other body reaches the backend.
// Remove it once ElectionProvider's session can adopt a certificate token itself.
export const CERT_SESSION_FIELD = '__vocdoniCertificateSession'
const BRIDGED = Symbol.for('vocdoni.certificateBridge')

type Session = { authToken: string; weight?: string }
const sessions = new Map<string, Session>()

type BridgedElections = VocdoniApiClient['elections'] & { [BRIDGED]?: true }

export const installCertificateBridge = (client: VocdoniApiClient) => {
  const elections = client.elections as BridgedElections
  if (elections[BRIDGED]) return
  const original = elections.authStep0.bind(elections)
  elections.authStep0 = async (processId: string, body: AuthRequest): Promise<AuthResponse> => {
    const handle = (body as Record<string, unknown> | undefined)?.[CERT_SESSION_FIELD]
    if (typeof handle !== 'string') return original(processId, body)
    const key = `${processId}:${handle}`
    const session = sessions.get(key)
    sessions.delete(key)
    if (!session) throw new Error('No certificate session to adopt')
    return { authToken: session.authToken, weight: session.weight }
  }
  elections[BRIDGED] = true
}

// auth0 marks the voter connected (a certificate census has no 2FA fields) and hashes the sentinel body
// as the pending-vote owner, so a stable `voterRef` keeps that owner across reloads.
export const adoptCertificateSession = async (
  auth0: (participant: AuthRequest) => Promise<void>,
  processId: string,
  { authToken, weight, voterRef }: { authToken: string; weight?: string; voterRef: string }
) => {
  const key = `${processId}:${voterRef}`
  sessions.set(key, { authToken, weight })
  try {
    await auth0({ [CERT_SESSION_FIELD]: voterRef } as AuthRequest)
  } finally {
    sessions.delete(key)
  }
}
