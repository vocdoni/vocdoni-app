import { describe, expect, it } from 'vitest'
import { resolvePublicOrigin } from './publicOrigin'

describe('resolvePublicOrigin', () => {
  it('prefers APP_URL and reduces it to an origin', () => {
    const origin = resolvePublicOrigin({ globalContext: { appEnv: { APP_URL: 'https://app.example.org/x/' } } })

    expect(origin).toBe('https://app.example.org')
  })

  it('rebuilds the origin from forwarded headers', () => {
    expect(
      resolvePublicOrigin({
        headers: { host: 'internal:3000', 'x-forwarded-host': 'vote.example.org', 'x-forwarded-proto': 'https' },
      })
    ).toBe('https://vote.example.org')
    expect(resolvePublicOrigin({ headers: { host: 'localhost:3000' } })).toBe('http://localhost:3000')
  })

  it('uses only the first forwarded hop and ignores a junk forwarded proto', () => {
    expect(resolvePublicOrigin({ headers: { 'x-forwarded-host': 'app.example.org, proxy.internal' } })).toBe(
      'https://app.example.org'
    )
    expect(
      resolvePublicOrigin({
        headers: { 'x-forwarded-host': 'localhost:13000,@evil.example', 'x-forwarded-proto': 'http' },
      })
    ).toBe('http://localhost:13000')
    expect(
      resolvePublicOrigin({ headers: { host: 'app.example.org', 'x-forwarded-proto': 'https://evil.example/?' } })
    ).toBe('https://app.example.org')
  })

  it('gives up on header values that are not a plain host', () => {
    expect(resolvePublicOrigin({ headers: { host: 'foo bar' } })).toBeUndefined()
    expect(resolvePublicOrigin({ headers: { 'x-forwarded-host': '@evil.example' } })).toBeUndefined()
    expect(resolvePublicOrigin({ headers: {} })).toBeUndefined()
  })
})
