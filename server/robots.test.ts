import { describe, expect, it, vi } from 'vitest'
import { robotsTxt, robotsTxtHandler } from './robots.mjs'

function run({ method = 'GET', path = '/robots.txt', hostname = 'app.vocdoni.io' } = {}) {
  const res = { setHeader: vi.fn(), send: vi.fn() }
  const next = vi.fn()
  robotsTxtHandler()({ method, path, hostname } as never, res as never, next)
  return { res, next }
}

describe('robotsTxt', () => {
  it('allows everything on the production app', () => {
    expect(robotsTxt('app.vocdoni.io')).toContain('\nDisallow:\n')
    expect(robotsTxt('app.vocdoni.io')).not.toContain('Disallow: /')
  })

  it('matches the production hostname case-insensitively', () => {
    expect(robotsTxt('APP.Vocdoni.IO')).toContain('\nDisallow:\n')
  })

  it.each(['app-dev.vocdoni.io', 'app-stg.vocdoni.io', 'localhost', 'vocdoni.io', 'example.com'])(
    'disallows everything on %s',
    (hostname) => {
      expect(robotsTxt(hostname)).toContain('\nDisallow: /\n')
    }
  )

  it('keeps the robotstxt.org reference line', () => {
    expect(robotsTxt('app.vocdoni.io').startsWith('# https://www.robotstxt.org/robotstxt.html\n')).toBe(true)
  })
})

describe('robotsTxtHandler', () => {
  it('answers GET /robots.txt as plain text for the request hostname', () => {
    const { res, next } = run({ hostname: 'app-dev.vocdoni.io' })

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8')
    expect(res.send).toHaveBeenCalledWith(robotsTxt('app-dev.vocdoni.io'))
    expect(next).not.toHaveBeenCalled()
  })

  it('answers HEAD /robots.txt too', () => {
    const { res, next } = run({ method: 'HEAD' })

    expect(res.send).toHaveBeenCalledWith(robotsTxt('app.vocdoni.io'))
    expect(next).not.toHaveBeenCalled()
  })

  it('passes other paths through', () => {
    const { res, next } = run({ path: '/processes/abc' })

    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('passes other methods through', () => {
    const { res, next } = run({ method: 'POST' })

    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
