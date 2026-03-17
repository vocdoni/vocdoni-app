import { EnvOptions } from '@vocdoni/sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getVocdoniClientConfig', () => {
  afterEach(() => {
    delete process.env.VOCDONI_ENVIRONMENT
    vi.resetModules()
  })

  it('rewrites the dev environment to the one-dev api endpoint', async () => {
    process.env.VOCDONI_ENVIRONMENT = 'dev'

    const { getVocdoniClientConfig } = await import('./vocdoni-client-config')

    expect(getVocdoniClientConfig()).toEqual({
      clientEnv: EnvOptions.DEV,
      options: {
        api_url: 'https://one-dev.vocdoni.net/v2',
      },
    })
  })
})
