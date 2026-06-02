import { renderHook } from '@testing-library/react'
import { CensusType } from '@vocdoni/sdk'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useCspSessionGuard } from './use-csp-session-guard'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

const cspElection = { census: { type: CensusType.CSP } }
const web3Election = { census: { type: CensusType.WEIGHTED } }

type ElectionState = Record<string, unknown>

const makeState = (overrides: ElectionState = {}): ElectionState => ({
  election: cspElection,
  connected: false,
  isInCensus: false,
  clearClient: vi.fn(),
  loading: { census: false },
  loaded: { census: false },
  ...overrides,
})

describe('useCspSessionGuard', () => {
  afterEach(() => resetReactProvidersMock())

  it('closes the session once a membership check resolves the voter is not in the census', () => {
    const clearClient = vi.fn()
    // census check in flight
    let state = makeState({ connected: true, loading: { census: true }, loaded: { census: false }, clearClient })
    setReactProvidersMock({ useElection: () => state })

    const { rerender } = renderHook(() => useCspSessionGuard())
    expect(clearClient).not.toHaveBeenCalled()

    // check completed: voter does not belong
    state = makeState({
      connected: true,
      loading: { census: false },
      loaded: { census: true },
      isInCensus: false,
      clearClient,
    })
    rerender()

    expect(clearClient).toHaveBeenCalledTimes(1)
  })

  it('keeps the session when the voter is in the census', () => {
    const clearClient = vi.fn()
    let state = makeState({ connected: true, loading: { census: true }, loaded: { census: false }, clearClient })
    setReactProvidersMock({ useElection: () => state })

    const { rerender } = renderHook(() => useCspSessionGuard())

    state = makeState({
      connected: true,
      loading: { census: false },
      loaded: { census: true },
      isInCensus: true,
      clearClient,
    })
    rerender()

    expect(clearClient).not.toHaveBeenCalled()
  })

  it('does not close before a fresh membership check has run (stale loaded state)', () => {
    const clearClient = vi.fn()
    // connected with a resolved-but-stale census state and no in-flight check
    const state = makeState({
      connected: true,
      loading: { census: false },
      loaded: { census: true },
      isInCensus: false,
      clearClient,
    })
    setReactProvidersMock({ useElection: () => state })

    renderHook(() => useCspSessionGuard())

    expect(clearClient).not.toHaveBeenCalled()
  })

  it('is a no-op for non-CSP censuses', () => {
    const clearClient = vi.fn()
    let state = makeState({
      election: web3Election,
      connected: true,
      loading: { census: true },
      loaded: { census: false },
      clearClient,
    })
    setReactProvidersMock({ useElection: () => state })

    const { rerender } = renderHook(() => useCspSessionGuard())

    state = makeState({
      election: web3Election,
      connected: true,
      loading: { census: false },
      loaded: { census: true },
      isInCensus: false,
      clearClient,
    })
    rerender()

    expect(clearClient).not.toHaveBeenCalled()
  })

  it('does not close when there is no CSP session (not connected)', () => {
    const clearClient = vi.fn()
    let state = makeState({ connected: false, loading: { census: true }, loaded: { census: false }, clearClient })
    setReactProvidersMock({ useElection: () => state })

    const { rerender } = renderHook(() => useCspSessionGuard())

    state = makeState({
      connected: false,
      loading: { census: false },
      loaded: { census: true },
      isInCensus: false,
      clearClient,
    })
    rerender()

    expect(clearClient).not.toHaveBeenCalled()
  })
})
