import { renderHook } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { httpCertificateAuthApi } from './client'
import { useCertificateAuthApi } from './useCertificateAuthApi'

const hookWith = (appEnv: Parameters<typeof AllProviders>[0]['appEnv']) =>
  renderHook(() => useCertificateAuthApi(), {
    wrapper: ({ children }) => <AllProviders appEnv={appEnv}>{children}</AllProviders>,
  })

describe('useCertificateAuthApi', () => {
  it('returns httpCertificateAuthApi when ENABLE_CERTIFICATE_AUTH is "on"', () => {
    const { result } = hookWith({ ENABLE_CERTIFICATE_AUTH: 'on' })
    expect(result.current).toBe(httpCertificateAuthApi)
  })

  it('returns a mock (not httpCertificateAuthApi) when ENABLE_CERTIFICATE_AUTH is "mock"', () => {
    const { result } = hookWith({ ENABLE_CERTIFICATE_AUTH: 'mock' })
    expect(result.current).not.toBe(httpCertificateAuthApi)
    expect(typeof result.current.create).toBe('function')
    expect(typeof result.current.redeem).toBe('function')
    expect(typeof result.current.probe).toBe('function')
  })

  it('returns the same object across re-renders', () => {
    const { result, rerender } = hookWith({ ENABLE_CERTIFICATE_AUTH: 'mock' })
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
