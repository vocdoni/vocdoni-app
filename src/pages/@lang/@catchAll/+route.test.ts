import type { PageContext } from 'vike/types'

const makeContext = (urlPathname: string) =>
  ({
    urlPathname,
    globalContext: {
      appEnv: {
        LANGUAGES: { en: 'English', ca: 'Catalan', es: 'Spanish' },
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
})
