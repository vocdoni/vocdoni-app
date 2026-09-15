import type { PageContext } from 'vike/types'

const makeContext = (urlPathname: string, appEnv: Record<string, unknown> = {}) =>
  ({
    urlPathname,
    globalContext: {
      appEnv: {
        LANGUAGES: { en: 'English', ca: 'Catalan', es: 'Spanish' },
        ...appEnv,
      },
    },
  }) as unknown as PageContext

describe('localized catch-all route', () => {
  it('matches localized admin and auth paths', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/ca/admin'))).toEqual({
      routeParams: {
        lang: 'ca',
      },
    })

    expect(route(makeContext('/en/account/signin'))).toEqual({
      routeParams: {
        lang: 'en',
      },
    })
  })

  it('does not claim routes owned by dedicated SSR pages', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/ca/organization/0xabc'))).toBe(false)
    expect(route(makeContext('/ca/processes/0xprocess'))).toBe(false)
    expect(route(makeContext('/ca/processes/0xprocess/summary'))).toBe(false)
  })

  it('keeps the localized root unless HOME_PROCESS_ID claims it', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/ca'))).toEqual({ routeParams: { lang: 'ca' } })
    expect(route(makeContext('/ca/'))).toEqual({ routeParams: { lang: 'ca' } })

    expect(route(makeContext('/ca', { HOME_PROCESS_ID: '0xprocess' }))).toBe(false)
    expect(route(makeContext('/ca/', { HOME_PROCESS_ID: '0xprocess' }))).toBe(false)
    // Only the root is given up: the rest of the localized SPA space is untouched.
    expect(route(makeContext('/ca/plans', { HOME_PROCESS_ID: '0xprocess' }))).toEqual({
      routeParams: { lang: 'ca' },
    })
  })
})
