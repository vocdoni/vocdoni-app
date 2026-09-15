import type { GlobalContextServer } from 'vike/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Producer side of the runtime-env chain: process.env -> getServerAppEnv() ->
// globalContext.appEnv. Nothing else exercises this hook, so a rename or a
// dropped assignment would only surface as "the env vars stopped working" in a
// deployed image.
describe('onCreateGlobalContext', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('resolves the runtime env from process.env onto the global context', async () => {
    vi.stubEnv('PRIMARY_COLOR', '#1a73e8')
    vi.stubEnv('SAAS_URL', 'https://example.test/api/')

    const { default: onCreateGlobalContext } = await import('./+onCreateGlobalContext.server')
    const globalContext = {} as GlobalContextServer

    onCreateGlobalContext(globalContext)

    expect(globalContext.appEnv?.PRIMARY_COLOR).toBe('#1a73e8')
    // trailing slash trimmed by buildAppEnv: proves the real resolver ran
    expect(globalContext.appEnv?.SAAS_URL).toBe('https://example.test/api')
  })

  it('still populates the env when nothing is configured', async () => {
    const { default: onCreateGlobalContext } = await import('./+onCreateGlobalContext.server')
    const globalContext = {} as GlobalContextServer

    onCreateGlobalContext(globalContext)

    expect(globalContext.appEnv).toBeDefined()
    expect(globalContext.appEnv?.PRIMARY_COLOR).toBeUndefined()
  })
})
