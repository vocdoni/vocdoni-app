import { afterEach, describe, expect, it, vi } from 'vitest'

describe('AppEnv', () => {
  afterEach(() => {
    delete globalThis.__APP_ENV__
    delete process.env.APP_TITLE
    delete process.env.VOCDONI_ENVIRONMENT
    vi.resetModules()
  })

  it('falls back to process.env during server-side module imports', async () => {
    process.env.APP_TITLE = 'Server Title'
    process.env.VOCDONI_ENVIRONMENT = 'stg'
    delete globalThis.__APP_ENV__

    const { AppEnv } = await import('./app-env')

    expect(AppEnv.title).toBe('Server Title')
    expect(AppEnv.VOCDONI_ENVIRONMENT).toBe('stg')
  })
})
