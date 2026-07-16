import { EnvOptions } from '@vocdoni/sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getVocdoniClientConfig', () => {
  afterEach(() => {
    delete process.env.VOCDONI_ENVIRONMENT
    vi.resetModules()
  })

  it('resolves the dev environment to the SDK dev defaults', async () => {
    process.env.VOCDONI_ENVIRONMENT = 'dev'

    const { getVocdoniClientConfig } = await import('./vocdoni-client-config')

    expect(getVocdoniClientConfig()).toEqual({
      clientEnv: EnvOptions.DEV,
    })
  })
})
