vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    getLanguagesEnv: () => ({
      en: 'English',
      ca: 'Catalan',
      es: 'Spanish',
    }),
  }
})

describe('localized catch-all route', () => {
  it('matches localized admin and auth paths', async () => {
    const { default: route } = await import('./+route')

    expect(route({ urlPathname: '/ca/admin' })).toEqual({
      routeParams: {
        lang: 'ca',
      },
    })

    expect(route({ urlPathname: '/en/account/signin' })).toEqual({
      routeParams: {
        lang: 'en',
      },
    })
  })

  it('does not claim routes owned by dedicated SSR pages', async () => {
    const { default: route } = await import('./+route')

    expect(route({ urlPathname: '/ca/organization/0xabc' })).toBe(false)
    expect(route({ urlPathname: '/ca/processes/0xprocess' })).toBe(false)
    expect(route({ urlPathname: '/ca/processes/0xprocess/summary' })).toBe(false)
  })
})
