// Adapted from ferranrego's feat/cert-auth-5-voter-escape (vocdoni-app#1980), with its UA matrix.
// Only `in-app` changes the voter flow today; the other kinds are kept for the record until they
// are confirmed on real devices.

/** Where a certificate can't be used from this page, from the browser's user agent. */
export type CertificateBrowser =
  | { kind: 'supported' }
  | { kind: 'in-app'; platform: 'android' | 'ios' | 'other' }
  | { kind: 'ios-other-browser' }
  | { kind: 'old-firefox-android' }

export type BrowserEnv = { userAgent: string; maxTouchPoints: number; hasTelegram: boolean; uaPlatform?: string }

const IN_APP =
  /FBAN|FBAV|FB_IAB|Instagram|Barcelona|LinkedInApp|Snapchat|musical_ly|Bytedance|Twitter|Line\/|MicroMessenger|\bWAiOS\/|\bWA4A\/|GSA\/|Reddit\//

export const detectCertificateBrowser = ({
  userAgent: ua,
  maxTouchPoints,
  hasTelegram,
  uaPlatform,
}: BrowserEnv): CertificateBrowser => {
  const ipados = /Macintosh/.test(ua) && maxTouchPoints > 1
  const ios = /iPhone|iPod|iPad/.test(ua) || ipados
  const android = /Android/.test(ua) || uaPlatform === 'Android'
  const inApp = IN_APP.test(ua) || hasTelegram || (android && /; wv\)/.test(ua)) || (ios && !/Safari\//.test(ua))
  if (inApp) return { kind: 'in-app', platform: android ? 'android' : ios ? 'ios' : 'other' }
  if (ios && /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Ddg\//.test(ua)) return { kind: 'ios-other-browser' }
  const firefox = android ? /Firefox\/(\d+)/.exec(ua) : null
  if (firefox && Number(firefox[1]) < 138) return { kind: 'old-firefox-android' }
  return { kind: 'supported' }
}

export const readBrowserEnv = (): BrowserEnv => ({
  userAgent: navigator.userAgent,
  maxTouchPoints: navigator.maxTouchPoints ?? 0,
  hasTelegram: 'TelegramWebview' in window || 'TelegramWebviewProxy' in window,
  uaPlatform: (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform,
})
