import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const pageContext = vi.hoisted(() => ({ current: {} as any }))

vi.mock('vike-react/usePageContext', () => ({ usePageContext: () => pageContext.current }))

import DefaultPageHead from './DefaultPageHead'

const render = (context: any) => {
  pageContext.current = { globalContext: {}, ...context }
  return renderToStaticMarkup(<DefaultPageHead />)
}

describe('DefaultPageHead', () => {
  it('points og and twitter images at the route language card on the configured origin', () => {
    const html = render({
      routeParams: { lang: 'ca' },
      globalContext: { appEnv: { APP_URL: 'https://app.example.org/' } },
    })

    expect(html).toContain('property="og:image" content="https://app.example.org/assets/og/ca.png"')
    expect(html).toContain('name="twitter:image" content="https://app.example.org/assets/og/ca.png"')
    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:height" content="630"')
    expect(html).toContain('property="og:image:alt"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('property="og:type" content="website"')
    expect(html).toContain('property="og:site_name" content="Vocdoni"')
    expect(html).toContain('name="twitter:site" content="@vocdoni"')
  })

  it('rebuilds the origin from forwarded headers and falls back to the English card', () => {
    const html = render({
      routeParams: { lang: 'xx' },
      headers: { host: 'internal:3000', 'x-forwarded-host': 'vote.example.org', 'x-forwarded-proto': 'https' },
    })

    expect(html).toContain('property="og:image" content="https://vote.example.org/assets/og/en.png"')
  })

  it('emits a relative path when no origin can be resolved', () => {
    const html = render({ routeParams: {} })

    expect(html).toMatch(/property="og:image" content="\/assets\/og\/[a-z-]+\.png"/)
  })
})
