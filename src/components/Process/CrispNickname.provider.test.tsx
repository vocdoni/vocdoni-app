import { renderHook } from '@testing-library/react'
import { ElectionProvider, useElectionAuth } from '@vocdoni/react-components'
import { TestProvider } from '@vocdoni/react-providers/test-utils'
import type { ReactNode } from 'react'

// The setup file stubs both packages for every test. This one reads the real auth value, so the `owner` that
// CrispNicknameObserver depends on is checked against the installed providers, not a stub that could miss a rename.
vi.unmock('@vocdoni/react-components')
vi.unmock('@vocdoni/react-providers')

describe('useElectionAuth from the installed providers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes the owner key the Crisp nickname reads', () => {
    // A fetch that never settles keeps the process read pending: no request leaves the test, and no state lands late.
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => undefined))
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProvider apiUrl='https://api.test'>
        <ElectionProvider id='process-1'>{children}</ElectionProvider>
      </TestProvider>
    )

    const { result } = renderHook(() => useElectionAuth(), { wrapper })

    expect('owner' in result.current).toBe(true)
  })
})
