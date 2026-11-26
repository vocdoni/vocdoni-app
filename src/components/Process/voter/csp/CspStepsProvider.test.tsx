import { render, screen } from '@testing-library/react'
import { certAuthStorageKey } from '~components/Process/CertAuth/cert-auth'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CspAuthProvider, useCspAuthContext } from './CspStepsProvider'

const PID = 'p1'
const STATE = 's'.repeat(22)
const VERIFIER = 'v'.repeat(43)
const CODE = 'c'.repeat(43)

const connection = { connected: false }
const certCensus = { certAuth: true, authFields: ['nationalId'], twoFaFields: [] }
const useCensus = (census: object) =>
  setReactProvidersMock({
    useElection: () => ({ election: { id: PID, census } }),
    useElectionAuth: () => ({ connected: connection.connected }),
  })

const Probe = () => {
  const { certReturn, currentStep } = useCspAuthContext()
  return (
    <>
      <output data-testid='cert'>{JSON.stringify(certReturn)}</output>
      <output data-testid='step'>{currentStep}</output>
    </>
  )
}

const renderProvider = () =>
  render(
    <CspAuthProvider processId={PID}>
      <Probe />
    </CspAuthProvider>
  )

const landOn = (hash: string, state: unknown = null) => {
  window.history.replaceState(state, '', `/en/processes/${PID}${hash}`)
}

const storeFlow = () =>
  sessionStorage.setItem(certAuthStorageKey(PID), JSON.stringify({ state: STATE, codeVerifier: VERIFIER }))

describe('CspAuthProvider certificate return', () => {
  beforeEach(() => {
    sessionStorage.clear()
    connection.connected = false
    landOn('')
  })

  it('reads the gateway return of a certificate census once, strips the fragment and keeps history.state', () => {
    const historyState = { voterStep: { name: 'welcome' } }
    storeFlow()
    landOn(`#certCode=${CODE}&state=${STATE}`, historyState)
    useCensus(certCensus)
    renderProvider()

    expect(screen.getByTestId('cert')).toHaveTextContent(
      JSON.stringify({ kind: 'code', certCode: CODE, codeVerifier: VERIFIER })
    )
    expect(window.location.hash).toBe('')
    expect(window.history.state).toEqual(historyState)
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
  })

  it('leaves the fragment of a census without certificates alone', () => {
    landOn(`#certCode=${CODE}&state=${STATE}`)
    useCensus({ authFields: ['memberNumber'], twoFaFields: [] })
    renderProvider()

    expect(screen.getByTestId('cert')).toHaveTextContent('null')
    expect(window.location.hash).toBe(`#certCode=${CODE}&state=${STATE}`)
  })

  it('keeps the answer through the mount-time reset of the flow', () => {
    storeFlow()
    landOn(`#certError=not_in_census&state=${STATE}`)
    useCensus(certCensus)
    renderProvider()

    expect(screen.getByTestId('cert')).toHaveTextContent('"kind":"error","code":"not_in_census"')
    expect(screen.getByTestId('step')).toHaveTextContent('0')
  })

  it('strips the fragment but keeps no answer for a voter already connected', () => {
    storeFlow()
    landOn(`#certCode=${CODE}&state=${STATE}`)
    connection.connected = true
    useCensus(certCensus)
    renderProvider()

    expect(screen.getByTestId('cert')).toHaveTextContent('null')
    expect(window.location.hash).toBe('')
  })

  it('clears the answer once the voter is connected', () => {
    storeFlow()
    landOn(`#certCode=${CODE}&state=${STATE}`)
    useCensus(certCensus)
    const { rerender } = renderProvider()
    expect(screen.getByTestId('cert')).not.toHaveTextContent('null')

    connection.connected = true
    setReactProvidersMock({ useElectionAuth: () => ({ connected: true }) })
    rerender(
      <CspAuthProvider processId={PID}>
        <Probe />
      </CspAuthProvider>
    )
    expect(screen.getByTestId('cert')).toHaveTextContent('null')
  })
})
