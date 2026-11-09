import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { robotsTxt, robotsTxtHandler } from './robots.mjs'

function run({ method = 'GET', path = '/robots.txt', headers = {} as Record<string, string> } = {}) {
  const res = { setHeader: vi.fn(), send: vi.fn() }
  const next = vi.fn()
  robotsTxtHandler()({ method, path, headers } as never, res as never, next)
  return { res, next }
}

const ALLOW = '\nDisallow:\n'
const DISALLOW = '\nDisallow: /\n'

describe('robotsTxt', () => {
  it('allows everything on the production app', () => {
    expect(robotsTxt('app.vocdoni.io')).toContain(ALLOW)
    expect(robotsTxt('app.vocdoni.io')).not.toContain('Disallow: /')
  })

  it('matches the production hostname case-insensitively', () => {
    expect(robotsTxt('APP.Vocdoni.IO')).toContain(ALLOW)
  })

  it.each(['app-dev.vocdoni.io', 'app-stg.vocdoni.io', 'localhost', 'vocdoni.io', 'example.com', ''])(
    'disallows everything on %s',
    (hostname) => {
      expect(robotsTxt(hostname)).toContain(DISALLOW)
    }
  )

  it('keeps the robotstxt.org reference line', () => {
    expect(robotsTxt('app.vocdoni.io').startsWith('# https://www.robotstxt.org/robotstxt.html\n')).toBe(true)
  })
})

describe('robotsTxtHandler', () => {
  const previousAppUrl = process.env.APP_URL

  beforeEach(() => {
    delete process.env.APP_URL
  })

  afterEach(() => {
    if (previousAppUrl === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previousAppUrl
  })

  it('answers GET /robots.txt as plain text for the request host', () => {
    const { res, next } = run({ headers: { host: 'app-dev.vocdoni.io' } })

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8')
    expect(res.send).toHaveBeenCalledWith(robotsTxt('app-dev.vocdoni.io'))
    expect(next).not.toHaveBeenCalled()
  })

  it('answers HEAD /robots.txt too', () => {
    const { res, next } = run({ method: 'HEAD', headers: { host: 'app.vocdoni.io' } })

    expect(res.send).toHaveBeenCalledWith(robotsTxt('app.vocdoni.io'))
    expect(next).not.toHaveBeenCalled()
  })

  it('passes other paths through', () => {
    const { res, next } = run({ path: '/processes/abc', headers: { host: 'app.vocdoni.io' } })

    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('passes other methods through', () => {
    const { res, next } = run({ method: 'POST', headers: { host: 'app.vocdoni.io' } })

    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('allows crawling when Host is the production app', () => {
    const { res } = run({ headers: { host: 'app.vocdoni.io' } })

    expect(res.send.mock.calls[0][0]).toContain(ALLOW)
  })

  it('allows crawling behind a proxy that forwards the public host in X-Forwarded-Host', () => {
    const { res } = run({ headers: { host: 'internal:8080', 'x-forwarded-host': 'app.vocdoni.io' } })

    expect(res.send.mock.calls[0][0]).toContain(ALLOW)
  })

  it('disallows crawling when X-Forwarded-Host is a non-production app', () => {
    const { res } = run({ headers: { host: 'internal:8080', 'x-forwarded-host': 'app-stg.vocdoni.io' } })

    expect(res.send.mock.calls[0][0]).toContain(DISALLOW)
  })

  it('allows crawling when APP_URL is the production app, whatever the headers say', () => {
    process.env.APP_URL = 'https://app.vocdoni.io'
    const { res } = run({ headers: { host: 'app-dev.vocdoni.io', 'x-forwarded-host': 'app-dev.vocdoni.io' } })

    expect(res.send.mock.calls[0][0]).toContain(ALLOW)
  })

  it('disallows crawling when APP_URL is a non-production app, even with a production Host', () => {
    process.env.APP_URL = 'https://app-dev.vocdoni.io'
    const { res } = run({ headers: { host: 'app.vocdoni.io' } })

    expect(res.send.mock.calls[0][0]).toContain(DISALLOW)
  })

  it('allows crawling when the production host carries a port', () => {
    const { res } = run({ headers: { host: 'app.vocdoni.io:443' } })

    expect(res.send.mock.calls[0][0]).toContain(ALLOW)
  })

  it('disallows crawling when no host headers are present', () => {
    const { res } = run({ headers: {} })

    expect(res.send.mock.calls[0][0]).toContain(DISALLOW)
  })
})
