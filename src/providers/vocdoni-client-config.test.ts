import { describe, expect, it } from 'vitest'

import { getVocdoniClientConfig } from './vocdoni-client-config'

describe('getVocdoniClientConfig', () => {
  it('resolves the dev environment to the dev defaults', () => {
    expect(getVocdoniClientConfig('dev')).toEqual({
      clientEnv: 'dev',
      explorerUrl: 'https://dev.explorer.vote',
    })
  })

  it('resolves the prod environment to the prod defaults', () => {
    expect(getVocdoniClientConfig('prod')).toEqual({
      clientEnv: 'prod',
      explorerUrl: 'https://explorer.vote',
    })
  })

  it('defaults to the dev environment', () => {
    expect(getVocdoniClientConfig()).toEqual({
      clientEnv: 'dev',
      explorerUrl: 'https://dev.explorer.vote',
    })
  })
})
