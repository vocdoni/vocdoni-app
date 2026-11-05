import { renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanPageUrl, handoffUrl, useEscapeHandoff } from './useEscapeHandoff'

const WEBVIEW_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36'

const stubUserAgent = (ua: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

describe('useEscapeHandoff', () => {
  it('strips the hand-off param, flags the tab and keeps detection off', () => {
    stubUserAgent(WEBVIEW_UA)
    window.history.replaceState(null, '', '/ca/processes/p?identify=cert-escape&x=1#h')

    const { result } = renderHook(() => useEscapeHandoff())

    expect(result.current).toEqual({ browser: { kind: 'supported' }, resuming: true })
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/ca/processes/p?x=1#h')
    expect(sessionStorage.getItem('vocdoni.cert.escaped')).toBe('1')
  })

  it('keeps detection off for a later load of the same tab', () => {
    stubUserAgent(WEBVIEW_UA)
    window.history.replaceState(null, '', '/ca/processes/p?identify=cert-escape')
    renderHook(() => useEscapeHandoff()).unmount()

    const { result } = renderHook(() => useEscapeHandoff())

    expect(result.current).toEqual({ browser: { kind: 'supported' }, resuming: false })
  })

  it('detects an in-app viewer in a fresh tab', () => {
    stubUserAgent(WEBVIEW_UA)
    window.history.replaceState(null, '', '/ca/processes/p')

    const { result } = renderHook(() => useEscapeHandoff())

    expect(result.current).toEqual({ browser: { kind: 'in-app', platform: 'android' }, resuming: false })
  })

  it('reports a supported browser and no hand-off on the server render', () => {
    stubUserAgent(WEBVIEW_UA)
    window.history.replaceState(null, '', '/ca/processes/p?identify=cert-escape')
    const Probe = () => <>{JSON.stringify(useEscapeHandoff())}</>

    const html = renderToString(<Probe />)

    expect(JSON.parse(html.replace(/&quot;/g, '"'))).toEqual({ browser: { kind: 'supported' }, resuming: false })
    expect(window.location.search).toBe('?identify=cert-escape')
  })

  it('builds the hand-off link from the clean URL only', () => {
    window.history.replaceState(null, '', '/ca/processes/p?x=1#h')

    expect(cleanPageUrl()).toBe(`${window.location.origin}/ca/processes/p`)
    expect(handoffUrl()).toBe(`${window.location.origin}/ca/processes/p?identify=cert-escape`)
  })
})
