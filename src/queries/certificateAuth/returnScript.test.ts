import { readReturnStash } from './storage'
import { CERT_RETURN_SCRIPT } from './returnScript'

const run = () => new Function(CERT_RETURN_SCRIPT)()

beforeEach(() => {
  sessionStorage.clear()
  document.documentElement.removeAttribute('data-cert-return')
})

describe('certificate return script', () => {
  it('stashes the code, strips the fragment keeping path and query, and flags html', () => {
    history.replaceState(null, '', '/ca/processes/6650f0c0a1b2c3d4e5f60718?x=1#code=c0de_1&state=st-1')
    run()
    expect(location.hash).toBe('')
    expect(location.pathname + location.search).toBe('/ca/processes/6650f0c0a1b2c3d4e5f60718?x=1')
    expect(document.documentElement.hasAttribute('data-cert-return')).toBe(true)
    expect(readReturnStash()).toMatchObject({ code: 'c0de_1', state: 'st-1' })
  })
  it('stashes an error return', () => {
    history.replaceState(null, '', '/processes/p#error=attempt_expired')
    run()
    expect(readReturnStash()).toMatchObject({ error: 'attempt_expired' })
  })
  it('leaves unrelated fragments alone', () => {
    history.replaceState(null, '', '/processes/p#questions')
    run()
    expect(location.hash).toBe('#questions')
    expect(readReturnStash()).toBeNull()
    expect(document.documentElement.hasAttribute('data-cert-return')).toBe(false)
  })
  it('strips but never stashes malformed values', () => {
    history.replaceState(null, '', '/processes/p#code=%3Cx%3E&state=1')
    run()
    expect(location.hash).toBe('')
    expect(readReturnStash()).toBeNull()
  })
})
