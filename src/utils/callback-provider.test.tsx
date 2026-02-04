import { renderHook } from '@testing-library/react'
import { CallbackProvider, useCallbackContext } from './callback-provider'

describe('CallbackProvider', () => {
  it('returns no-op handlers when used outside provider', () => {
    const { result } = renderHook(() => useCallbackContext())
    expect(() => result.current.success()).not.toThrow()
    expect(() => result.current.error()).not.toThrow()
  })

  it('exposes provided handlers', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CallbackProvider success={onSuccess} error={onError}>
        {children}
      </CallbackProvider>
    )

    const { result } = renderHook(() => useCallbackContext(), { wrapper })
    result.current.success()
    result.current.error()

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
