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

  it('gives up on header values that do not form a valid origin', () => {
    expect(resolvePublicOrigin({ headers: { 'x-forwarded-host': 'app.example.org, app.example.org' } })).toBeUndefined()
    expect(resolvePublicOrigin({ headers: { host: 'foo bar' } })).toBeUndefined()
    expect(resolvePublicOrigin({ headers: {} })).toBeUndefined()
  })
})
