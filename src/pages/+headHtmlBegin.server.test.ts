import type { PageContextServer } from 'vike/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import headHtmlBegin from './+headHtmlBegin.server'

// The build-commit tag goes first so it sits as high in <head> as Vike allows. The sha comes from the globalContext
// resolved at server boot, so the render never reads the env or git.
describe('headHtmlBegin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('emits the build-commit meta tag first, then the notranslate meta tag', () => {
    const pageContext = { globalContext: { commitSha: '0123456' } } as PageContextServer

    expect(headHtmlBegin(pageContext)).toBe(
      '<meta name="build-commit" content="0123456" /><meta name="google" content="notranslate" />'
    )
  })

  it('takes the sha from the globalContext, not from the env at render time', () => {
    vi.stubEnv('COMMIT_SHA', 'ffffff1')
    const pageContext = { globalContext: { commitSha: '0123456' } } as PageContextServer

    expect(headHtmlBegin(pageContext)).toContain('content="0123456"')
  })
})
