import { act, render, screen, waitFor } from '@testing-library/react'
import { VocdoniApiClient } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, useClient, useElectionAuth } from '@vocdoni/react-providers'
import { TestProvider } from '@vocdoni/react-providers/test-utils'
import { adoptCertificateSession, CERT_SESSION_FIELD, installCertificateBridge } from './sdk-bridge'

// vitest.setup.ts stubs useClient; this file needs the real provider tree.
vi.mock('@vocdoni/react-providers', async (importOriginal) => importOriginal())

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
const election = {
  id: '6650f0c0a1b2c3d4e5f60718',
  orgAddress: '0x1',
  title: { default: 'T' },
  chainId: 'c',
  status: 'ONGOING',
  census: { authFields: ['nationalId'], twoFaFields: [], authMethod: 'certificate' },
  questions: [],
} as unknown as VotingProcessResponse

describe('certificate SDK bridge', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('answers its sentinel once from memory and forwards every other body', async () => {
    const fetchMock = vi.fn(async () => json({ authToken: 'typed' }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new VocdoniApiClient({ apiUrl: 'http://api.test' })
    installCertificateBridge(client)
    installCertificateBridge(client)
    let got: unknown
    await adoptCertificateSession(
      async (participant) => {
        got = await client.elections.authStep0('p1', participant)
      },
      'p1',
      { authToken: 'tok', voterRef: 'ref' }
    )
    expect(got).toEqual({ authToken: 'tok', weight: undefined })
    expect(fetchMock).not.toHaveBeenCalled()
    await expect(client.elections.authStep0('p1', { nationalId: 'x' })).resolves.toEqual({ authToken: 'typed' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await expect(client.elections.authStep0('p1', { [CERT_SESSION_FIELD]: 'ref' } as never)).rejects.toThrow()
  })

  it('connects a real ElectionProvider with the redeemed token', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).endsWith('/check') ? json({ belongsToProcess: true, questions: [] }) : json(election)
    )
    vi.stubGlobal('fetch', fetchMock)
    let auth!: ReturnType<typeof useElectionAuth>
    const Probe = () => {
      installCertificateBridge(useClient().client)
      auth = useElectionAuth()
      return <span data-testid='state'>{`${auth.connected}:${auth.authToken ?? ''}`}</span>
    }
    render(
      <TestProvider>
        <ElectionProvider election={election}>
          <Probe />
        </ElectionProvider>
      </TestProvider>
    )
    expect(screen.getByTestId('state').textContent).toBe('false:')
    await act(() => adoptCertificateSession(auth.auth0, election.id, { authToken: 'tok', voterRef: 'ref' }))
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('true:tok'))
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/auth/0'))).toBe(false)
  })
})
