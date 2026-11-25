import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorModeScript, isVoterPageId } from './color-mode-script'

// Runs the inline script as the browser would, with the given system preference.
const run = (followSystem: boolean, system: 'light' | 'dark') => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) => ({ matches: system === 'dark', media: query }) as MediaQueryList
  )
  const body = colorModeScript(followSystem).replace(/^<script>|<\/script>$/g, '')
  new Function(body)()
  const root = document.documentElement
  return { mode: root.classList.contains('dark') ? 'dark' : 'light', scheme: root.style.colorScheme }
}

describe('colorModeScript', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.style.colorScheme = ''
  })

  it('follows the system when nothing is stored', () => {
    expect(run(false, 'dark')).toEqual({ mode: 'dark', scheme: 'dark' })
    expect(run(false, 'light')).toEqual({ mode: 'light', scheme: 'light' })
  })

  it('applies the stored dashboard choice over the system', () => {
    localStorage.setItem('theme-preference', 'dark')
    expect(run(false, 'light')).toEqual({ mode: 'dark', scheme: 'dark' })
  })

  it('ignores the stored dashboard choice on a voter page', () => {
    localStorage.setItem('theme-preference', 'dark')
    expect(run(true, 'light')).toEqual({ mode: 'light', scheme: 'light' })
  })

  it('follows the system when storage throws, as in a blocked private window', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(run(false, 'dark')).toEqual({ mode: 'dark', scheme: 'dark' })
    expect(run(false, 'light')).toEqual({ mode: 'light', scheme: 'light' })
  })

  it('keeps the classes Vike puts on <html>', () => {
    document.documentElement.classList.add('notranslate')
    run(false, 'dark')
    expect(document.documentElement.classList.contains('notranslate')).toBe(true)
    document.documentElement.classList.remove('notranslate')
  })
})

describe('isVoterPageId', () => {
  it.each([
    ['/src/pages/@lang/processes/@id', true],
    ['/src/pages/@lang/processes/@id/summary', true],
    ['/src/pages/@lang/organization/@address', true],
    ['/src/pages/home-process', true],
    ['/src/pages/@lang/@catchAll', false],
    ['/src/pages/@catchAll', false],
    ['/src/pages/_error', true],
    [null, false],
  ])('%s -> %s', (pageId, expected) => {
    expect(isVoterPageId(pageId)).toBe(expected)
  })
})
