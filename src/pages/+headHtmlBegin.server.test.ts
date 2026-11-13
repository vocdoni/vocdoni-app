import { afterEach, describe, expect, it, vi } from 'vitest'

// The build-commit tag goes first so it sits as high in <head> as Vike allows, and it is resolved at runtime from
// the container env, not baked in at build time.
describe('headHtmlBegin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('emits the build-commit meta tag first, then the notranslate meta tag', async () => {
    vi.stubEnv('COMMIT_SHA', '0123456789abcdef0123456789abcdef01234567')
    const { default: headHtmlBegin } = await import('./+headHtmlBegin.server')

    expect(headHtmlBegin()).toBe(
      '<meta name="build-commit" content="0123456" /><meta name="google" content="notranslate" />'
    )
  })
})
