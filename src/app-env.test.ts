import { afterEach, describe, expect, it, vi } from 'vitest'

describe('AppEnv', () => {
  afterEach(() => {
    delete globalThis.__APP_ENV__
    delete process.env.APP_TITLE
    delete process.env.APP_URL
    delete process.env.VOCDONI_ENVIRONMENT
    vi.resetModules()
  })

  it('falls back to process.env during server-side module imports', async () => {
    process.env.APP_TITLE = 'Server Title'
    process.env.APP_URL = 'https://app.vocdoni.io'
    process.env.VOCDONI_ENVIRONMENT = 'stg'
    delete globalThis.__APP_ENV__

    const { AppEnv } = await import('./app-env')

    expect(AppEnv.title).toBe('Server Title')
    expect(AppEnv.APP_URL).toBe('https://app.vocdoni.io')
    expect(AppEnv.VOCDONI_ENVIRONMENT).toBe('stg')
  })
})
