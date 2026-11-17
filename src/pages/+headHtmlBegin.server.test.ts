import type { PageContextServer } from 'vike/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorModeScript } from '~theme/color-mode-script'
import headHtmlBegin from './+headHtmlBegin.server'

const context = (pageId: string | null = '/src/pages/@lang/@catchAll') =>
  ({ globalContext: { commitSha: '0123456' }, pageId }) as PageContextServer

// The build-commit tag goes first so it sits as high in <head> as Vike allows. The sha comes from the globalContext
// resolved at server boot, so the render never reads the env or git.
describe('headHtmlBegin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('emits the build-commit meta tag first, then the notranslate meta tag, then the colour-mode script', () => {
    expect(headHtmlBegin(context())).toBe(
      `<meta name="build-commit" content="0123456" /><meta name="google" content="notranslate" />${colorModeScript(false)}`
    )
  })

  it('takes the sha from the globalContext, not from the env at render time', () => {
    vi.stubEnv('COMMIT_SHA', 'ffffff1')

    expect(headHtmlBegin(context())).toContain('content="0123456"')
  })

  it("applies the device's saved choice on the client-rendered routes", () => {
    expect(headHtmlBegin(context())).toContain("localStorage.getItem('theme-preference')")
  })

  it.each([
    '/src/pages/@lang/processes/@id',
    '/src/pages/@lang/processes/@id/summary',
    '/src/pages/@lang/organization/@address',
    '/src/pages/home-process',
  ])('makes the voter page %s follow the system, never the saved choice', (pageId) => {
    const html = headHtmlBegin(context(pageId))
    expect(html).toContain("localStorage.getItem('theme-preference-voter')")
    expect(html).not.toContain("getItem('theme-preference')")
  })
})
