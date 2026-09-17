import { describe, expect, it } from 'vitest'

// The runtime env only reaches the browser because `appEnv` is listed in
// passToClient. Dropping it does not break SSR or any test -- the client just
// silently falls back to defaults and every env var (PRIMARY_COLOR, SAAS_URL,
// LANGUAGES...) stops applying. Pin it so that regression fails here instead.
describe('vike page config', () => {
  it('forwards the runtime env to the client through passToClient', async () => {
    const { default: config } = await import('./+config')

    expect(config.passToClient).toContain('appEnv')
  })

  it('opts the document out of browser translation before React mounts', async () => {
    const { default: config } = await import('./+config')

    expect(config).toMatchObject({
      htmlAttributes: { translate: 'no', class: 'notranslate' },
    })
  })
})
