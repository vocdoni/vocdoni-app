import { EnvOptions } from '@vocdoni/sdk'
import { describe, expect, it } from 'vitest'

import { getVocdoniClientConfig } from './vocdoni-client-config'

describe('getVocdoniClientConfig', () => {
  it('resolves the dev environment to the SDK dev defaults', () => {
    expect(getVocdoniClientConfig('dev')).toEqual({
      clientEnv: EnvOptions.DEV,
      explorerUrl: 'https://dev.explorer.vote',
    })
  })

  it('resolves the prod environment to the SDK prod defaults', () => {
    expect(getVocdoniClientConfig('prod')).toEqual({
      clientEnv: EnvOptions.PROD,
      explorerUrl: 'https://explorer.vote',
    })
  })

  it('defaults to the SDK dev environment', () => {
    expect(getVocdoniClientConfig()).toEqual({
      clientEnv: EnvOptions.DEV,
      explorerUrl: 'https://dev.explorer.vote',
    })
  })
})
