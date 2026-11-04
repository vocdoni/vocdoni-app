import { renderHook } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { useCertificateAuthMode } from './mode'

const modeWith = (appEnv: Parameters<typeof AllProviders>[0]['appEnv']) =>
  renderHook(() => useCertificateAuthMode(), {
    wrapper: ({ children }) => <AllProviders appEnv={appEnv}>{children}</AllProviders>,
  }).result.current

describe('useCertificateAuthMode', () => {
  it('is off unless the env enables it', () => {
    expect(modeWith({})).toBe('off')
    expect(modeWith({ ENABLE_CERTIFICATE_AUTH: 'on' })).toBe('on')
    expect(modeWith({ ENABLE_CERTIFICATE_AUTH: 'mock' })).toBe('mock')
  })
})
