import type { PageContextServer } from 'vike/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorModeScript } from '~theme/color-mode-script'
import headHtmlBegin from './+headHtmlBegin.server'

type AppEnvOverrides = { PROCESS_IDS?: string; CUSTOM_ORGANIZATION_DOMAINS?: Record<string, string> }

const context = (
  pageId: string | null = '/src/pages/@lang/@catchAll',
  urlPathname?: string,
  { headers, appEnv }: { headers?: Record<string, string>; appEnv?: AppEnvOverrides } = {}
) =>
  ({
    globalContext: {
      commitSha: '0123456',
      appEnv: {
        LANGUAGES: { en: 'English', es: 'Spanish' },
        PROCESS_IDS: '',
        CUSTOM_ORGANIZATION_DOMAINS: {},
        ...appEnv,
      },
    },
    pageId,
    urlPathname,
    headers,
  }) as unknown as PageContextServer

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

  // The root is a client-rendered voter shell only when it shows a shared census or a custom-domain organisation;
  // otherwise it redirects to the dashboard, which keeps its saved choice.
  it('keeps the saved choice on the root of a plain domain', () => {
    expect(headHtmlBegin(context('/src/pages/@lang/@catchAll', '/en', { headers: { host: 'app.example' } }))).toContain(
      "getItem('theme-preference')"
    )
  })

  it('makes the root follow the system when a shared census is configured', () => {
    const html = headHtmlBegin(
      context('/src/pages/@lang/@catchAll', '/en', {
        headers: { host: 'app.example' },
        appEnv: { PROCESS_IDS: 'abc,def' },
      })
    )
    expect(html).toContain("getItem('theme-preference-voter')")
    expect(html).not.toContain("getItem('theme-preference')")
  })

  it('makes the root follow the system on a custom organisation domain, matching the host without its port', () => {
    const html = headHtmlBegin(
      context('/src/pages/@lang/@catchAll', '/en', {
        headers: { 'x-forwarded-host': 'org.example:8443, proxy.example' },
        appEnv: { CUSTOM_ORGANIZATION_DOMAINS: { 'org.example': '0xabc' } },
      })
    )
    expect(html).toContain("getItem('theme-preference-voter')")
    expect(html).not.toContain("getItem('theme-preference')")
  })

  it('keeps the saved choice on the root of an unmapped host even when a shared census exists elsewhere', () => {
    const html = headHtmlBegin(
      context('/src/pages/@lang/@catchAll', '/', {
        headers: { host: 'app.example' },
        appEnv: { CUSTOM_ORGANIZATION_DOMAINS: { 'org.example': '0xabc' } },
      })
    )
    expect(html).toContain("getItem('theme-preference')")
  })

  it.each(['/admin', '/en/admin', '/en/processes/new', '/xx'])('keeps the saved choice on %s', (urlPathname) => {
    expect(
      headHtmlBegin(
        context('/src/pages/@lang/@catchAll', urlPathname, {
          headers: { host: 'org.example' },
          appEnv: { PROCESS_IDS: 'abc', CUSTOM_ORGANIZATION_DOMAINS: { 'org.example': '0xabc' } },
        })
      )
    ).toContain("getItem('theme-preference')")
  })

  it.each([
    '/src/pages/@lang/processes/@id',
    '/src/pages/@lang/processes/@id/summary',
    '/src/pages/@lang/organization/@address',
    '/src/pages/home-process',
    '/src/pages/_error',
  ])('makes the voter page %s follow the system, never the saved choice', (pageId) => {
    const html = headHtmlBegin(context(pageId))
    expect(html).toContain("localStorage.getItem('theme-preference-voter')")
    expect(html).not.toContain("getItem('theme-preference')")
  })
})
