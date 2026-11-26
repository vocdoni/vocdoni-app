import { describe, expect, it } from 'vitest'
import { detectCertificateBrowser, type BrowserEnv, type CertificateBrowser } from './browser-support'

const env = (ua: string, overrides: Partial<BrowserEnv> = {}): BrowserEnv => ({
  userAgent: ua,
  maxTouchPoints: 5,
  hasTelegram: false,
  ...overrides,
})

describe('detectCertificateBrowser', () => {
  it.each<[string, BrowserEnv, CertificateBrowser]>([
    [
      'Android WebView (wv)',
      env(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.102 Mobile Safari/537.36'
      ),
      { kind: 'in-app', platform: 'android' },
    ],
    [
      'Instagram on iPhone',
      env(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0'
      ),
      { kind: 'in-app', platform: 'ios' },
    ],
    [
      'bare WKWebView (iPhone, no Safari/)',
      env(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      ),
      { kind: 'in-app', platform: 'ios' },
    ],
    [
      'Facebook App on Android',
      env(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.102 Mobile Safari/537.36 [FBAN/FB4A;FBAV/450.0;FBBV/555]'
      ),
      { kind: 'in-app', platform: 'android' },
    ],
    [
      'Telegram (hasTelegram flag)',
      env('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36', {
        hasTelegram: true,
      }),
      { kind: 'in-app', platform: 'android' },
    ],
    [
      'Chrome on iPhone (CriOS)',
      env(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.84 Mobile/15E148 Safari/604.1'
      ),
      { kind: 'ios-other-browser' },
    ],
    [
      'Firefox on iPhone (FxiOS)',
      env(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/130.0 Mobile/15E148 Safari/605.1.15'
      ),
      { kind: 'ios-other-browser' },
    ],
    [
      'old Firefox on Android (< 138)',
      env('Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0', { maxTouchPoints: 5 }),
      { kind: 'old-firefox-android' },
    ],
    [
      'new Firefox on Android (>= 138)',
      env('Mozilla/5.0 (Android 14; Mobile; rv:142.0) Gecko/142.0 Firefox/142.0', { maxTouchPoints: 5 }),
      { kind: 'supported' },
    ],
    [
      'Safari on iPhone',
      env(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
      ),
      { kind: 'supported' },
    ],
    [
      'iPadOS Safari (Macintosh UA, maxTouchPoints > 1)',
      env(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
        { maxTouchPoints: 5 }
      ),
      { kind: 'supported' },
    ],
    [
      'iPadOS WKWebView (Macintosh UA, no Safari/, maxTouchPoints > 1)',
      env('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)', {
        maxTouchPoints: 5,
      }),
      { kind: 'in-app', platform: 'ios' },
    ],
    [
      'Chrome on Windows',
      env(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        { maxTouchPoints: 5 }
      ),
      { kind: 'supported' },
    ],
  ])('%s', (_label, browserEnv, expected) => {
    expect(detectCertificateBrowser(browserEnv)).toEqual(expected)
  })
})
