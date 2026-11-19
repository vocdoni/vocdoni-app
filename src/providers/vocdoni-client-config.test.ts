import { describe, expect, it } from 'vitest'

import { getVocdoniClientConfig } from './vocdoni-client-config'

describe('getVocdoniClientConfig', () => {
  it('resolves the dev environment to the dev network and explorer', () => {
    expect(getVocdoniClientConfig('dev')).toEqual({ clientEnv: 'dev', explorerUrl: 'https://dev.explorer.vote' })
  })

  it('resolves the prod environment to the prod network and explorer', () => {
    expect(getVocdoniClientConfig('prod')).toEqual({ clientEnv: 'prod', explorerUrl: 'https://explorer.vote' })
  })

  it('defaults to the dev environment', () => {
    expect(getVocdoniClientConfig()).toEqual({ clientEnv: 'dev', explorerUrl: 'https://dev.explorer.vote' })
  })

  it('resolves the stg environment to the stg network and explorer', () => {
    expect(getVocdoniClientConfig('stg')).toEqual({ clientEnv: 'stg', explorerUrl: 'https://stg.explorer.vote' })
  })
})
