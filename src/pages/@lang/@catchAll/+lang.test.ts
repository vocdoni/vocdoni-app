import { describe, expect, it } from 'vitest'

describe('localized SPA document language', () => {
  it.each(['pt', 'pt-br', 'ca', 'en'])('uses %s from the route for the HTML language', async (language) => {
    const { default: lang } = await import('./+lang')

    expect(lang({ routeParams: { lang: language } })).toBe(language)
  })
})
