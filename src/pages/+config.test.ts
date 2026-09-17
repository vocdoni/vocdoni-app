import { describe, expect, it } from 'vitest'

// The runtime env only reaches the browser because `appEnv` is listed in
// passToClient. Dropping it does not break SSR or any test -- the client just
// silently falls back to defaults and every env var (PRIMARY_COLOR, SAAS_URL,
// LANGUAGES...) stops applying. Pin it so that regression fails here instead.
describe('vike page config', () => {
  it('isolates process pages and their summaries from the analytics document', async () => {
    const { default: config } = await import('./@lang/processes/@id/+config')

    expect(config.clientRouting).toBe(false)
  })

  it('isolates the configured voting homepage from the analytics document', async () => {
    const { default: config } = await import('./home-process/+config')

    expect(config.clientRouting).toBe(false)
  })

  it('preserves the public-page pathname during server-routed hydration', async () => {
    const { default: processConfig } = await import('./@lang/processes/@id/+config')
    const { default: homeConfig } = await import('./home-process/+config')

    expect(processConfig.passToClient).toContain('urlPathname')
    expect(homeConfig.passToClient).toContain('urlPathname')
  })

  it('forwards the runtime env to the client through passToClient', async () => {
    const { default: config } = await import('./+config')

    expect(config.passToClient).toContain('appEnv')
  })
})
