import { describe, expect, it, vi } from 'vitest'
import { securityHeaders } from './security-headers.mjs'

function run(options?: { isProduction?: boolean }) {
  const res = { setHeader: vi.fn() }
  const next = vi.fn()
  securityHeaders(options)({} as never, res as never, next)
  return { res, next }
}

describe('securityHeaders', () => {
  it('sets the baseline headers and calls next', () => {
    const { res, next } = run()

    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN')
    expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "frame-ancestors 'self'")
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin')
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('sets HSTS in production', () => {
    const { res } = run({ isProduction: true })

    expect(res.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  })

  it('omits HSTS outside production', () => {
    const { res } = run({ isProduction: false })

    expect(res.setHeader).not.toHaveBeenCalledWith('Strict-Transport-Security', expect.anything())
  })
})
