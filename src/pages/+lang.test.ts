import type { PageContext } from 'vike/types'
import { describe, expect, it } from 'vitest'

// Regression guard: the localized SPA catch-all used to ship `<html lang="en">` for
// every `/:lang/...` document, which is what made browsers offer to translate it.
describe('default document language', () => {
  it.each(['pt', 'pt-br', 'ca', 'en'])('uses %s from the localized route', async (language) => {
    const { default: lang } = await import('./+lang')

    expect(lang({ routeParams: { lang: language } })).toBe(language)
  })

  it('leaves the vike-react default in place when the route carries no language', async () => {
    const { default: lang } = await import('./+lang')

    expect(lang({ routeParams: {} })).toBeUndefined()
    expect(lang({ routeParams: { lang: '' } })).toBeUndefined()
    expect(lang({} as Pick<PageContext, 'routeParams'>)).toBeUndefined()
  })
})
