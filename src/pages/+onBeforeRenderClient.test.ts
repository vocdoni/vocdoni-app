import type { PageContextClient } from 'vike/types'
import { buildAppEnv } from '~src/app-env-build'

const loadLanguages = vi.fn(async (_languages: (string | undefined)[]) => {})

vi.mock('~i18n', () => ({
  loadLanguages: (languages: (string | undefined)[]) => loadLanguages(languages),
  getBaseI18n: () => ({ language: 'de' }),
}))

const run = async (pageContext: Partial<PageContextClient>, LANGUAGES = 'es,ca,en') => {
  const { default: onBeforeRenderClient } = await import('./+onBeforeRenderClient')
  await onBeforeRenderClient({ globalContext: { appEnv: buildAppEnv({ LANGUAGES }) }, ...pageContext } as never)
  return loadLanguages.mock.calls.at(-1)?.[0]
}

// The client must hold the page's language (and the LANGUAGES fallback) before React
// renders: a public SSR page would otherwise hydrate against untranslated copy.
describe('onBeforeRenderClient', () => {
  it('loads the language of a public SSR page and the configured fallback', async () => {
    expect(await run({ data: { meta: { language: 'ca' } }, routeParams: { lang: 'ca' } })).toEqual(['ca', 'es'])
  })

  it('loads the route language of a client-rendered localized page', async () => {
    expect(await run({ routeParams: { lang: 'eu' } }, 'en,eu')).toEqual(['eu', 'en'])
  })

  it('falls back to the browser-detected language without a route language', async () => {
    expect(await run({ routeParams: {} })).toEqual(['de', 'es'])
  })
})
