import { describe, expect, it } from 'vitest'

import { getVocdoniClientConfig } from './vocdoni-client-config'

describe('getVocdoniClientConfig', () => {
  it('resolves the dev environment to the dev network', () => {
    expect(getVocdoniClientConfig('dev')).toEqual({ clientEnv: 'dev' })
  })

  it('resolves the prod environment to the prod network', () => {
    expect(getVocdoniClientConfig('prod')).toEqual({ clientEnv: 'prod' })
  })

  it('defaults to the dev environment', () => {
    expect(getVocdoniClientConfig()).toEqual({ clientEnv: 'dev' })
  })

  it('resolves the stg environment to the stg network', () => {
    expect(getVocdoniClientConfig('stg')).toEqual({ clientEnv: 'stg' })
  })
})
