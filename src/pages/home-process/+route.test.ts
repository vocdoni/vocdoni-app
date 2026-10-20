import type { PageContext } from 'vike/types'

const makeContext = (urlPathname: string, homeProcessId?: string) =>
  ({
    urlPathname,
    globalContext: {
      appEnv: {
        LANGUAGES: { en: 'English', ca: 'Catalan', es: 'Spanish' },
        HOME_PROCESS_ID: homeProcessId,
      },
    },
  }) as unknown as PageContext

describe('single-process homepage route', () => {
  it('claims the bare and localized roots when HOME_PROCESS_ID is set', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/', '0xprocess'))).toEqual({
      routeParams: {
        id: '0xprocess',
      },
    })

    expect(route(makeContext('/ca', '0xprocess'))).toEqual({
      routeParams: {
        lang: 'ca',
        id: '0xprocess',
      },
    })

    expect(route(makeContext('/es/', '0xprocess'))).toEqual({
      routeParams: {
        lang: 'es',
        id: '0xprocess',
      },
    })
  })

  it('never matches when HOME_PROCESS_ID is unset', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/'))).toBe(false)
    expect(route(makeContext('/en'))).toBe(false)
    // A blank env value counts as unset.
    expect(route(makeContext('/en', '   '))).toBe(false)
  })

  it('leaves every non-root path alone', async () => {
    const { default: route } = await import('./+route')

    expect(route(makeContext('/en/plans', '0xprocess'))).toBe(false)
    expect(route(makeContext('/en/processes/0xother', '0xprocess'))).toBe(false)
    // Unsupported languages stay with the catch-all, which redirects them.
    expect(route(makeContext('/fr', '0xprocess'))).toBe(false)
    expect(route(makeContext('/admin', '0xprocess'))).toBe(false)
  })
})
