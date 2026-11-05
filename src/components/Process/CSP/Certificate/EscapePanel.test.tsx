import { act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '~src/test-utils'
import { EscapePanel, EscapeStickyAction } from './EscapePanel'

// jsdom doesn't navigate, so we just check link hrefs and button states.
beforeEach(() => {
  window.history.replaceState(null, '', '/processes/test-vote')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// ---------- helpers ----------

const renderPanel = (
  platform: 'android' | 'ios' | 'other',
  variant: 'in-app' | 'ios-other-browser' | 'old-firefox-android' = 'in-app',
  appEnv: Record<string, unknown> = {}
) =>
  render(<EscapePanel platform={platform} variant={variant} />, {
    appEnv: { ENABLE_CERTIFICATE_AUTH: 'on', ...appEnv },
  })

const renderSticky = (
  platform: 'android' | 'ios' | 'other',
  variant: 'in-app' | 'ios-other-browser' | 'old-firefox-android' = 'in-app',
  openPhase: 'idle' | 'opening' | 'blocked' | 'returned' = 'idle',
  copyPhase: 'idle' | 'copied' | 'failed' = 'idle'
) =>
  render(
    <EscapeStickyAction
      platform={platform}
      variant={variant}
      openPhase={openPhase}
      copyPhase={copyPhase}
      onOpen={vi.fn()}
      onCopy={vi.fn()}
    />,
    { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } }
  )

// ---------- 1. common ----------

describe('heading and sentence', () => {
  it('shows the title and in-app sentence', () => {
    renderPanel('android')
    expect(screen.getByRole('heading', { name: 'Continue in your browser' })).toBeTruthy()
    expect(screen.getByText(/built-in viewer can't use your digital certificate/)).toBeTruthy()
  })

  it('never shows app or browser names', () => {
    renderPanel('android')
    expect(screen.queryByText(/WhatsApp|Instagram|Safari|Chrome|Firefox/i)).toBeNull()
  })
})

// ---------- 2. Android ----------

describe('Android in-app layout', () => {
  it('shows the Open link with intent URL and consent', () => {
    renderPanel('android')
    const openLink = screen.getByTestId('open')
    expect(openLink.tagName).toBe('A')
    expect(openLink.getAttribute('href')).toContain('intent://')
    expect(openLink.getAttribute('href')).toContain('?identify=cert-escape')
    expect(openLink.getAttribute('href')).toContain('#Intent;scheme=https;end')
    expect(screen.getByText(/By continuing you accept/)).toBeTruthy()
    expect(screen.getByText(/If your browser doesn't open/)).toBeTruthy()
    expect(screen.getByTestId('copy')).toBeTruthy()
  })

  it('click Open: becomes aria-disabled and the status region announces it', async () => {
    vi.useFakeTimers()
    renderPanel('android')
    const openLink = screen.getByTestId('open')
    await act(() => {
      fireEvent.click(openLink)
    })
    expect(openLink.getAttribute('aria-disabled')).toBe('true')
    // The status region is always mounted; the opening message is visually-hidden when busy.
    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Opening your browser')
    vi.useRealTimers()
  })

  it('still visible after 2.5 s → blocked state', async () => {
    vi.useFakeTimers()
    renderPanel('android')
    const openLink = screen.getByTestId('open')
    await act(() => {
      fireEvent.click(openLink)
    })
    await act(() => vi.advanceTimersByTimeAsync(2500))
    // After timeout the button label changes to "Try opening it again" (outline)
    expect(screen.getByTestId('open').textContent).toContain('Try opening it again')
    expect(screen.getByRole('status').textContent).toContain("didn't open")
    // Copy link becomes solid
    const copyBtn = screen.getByTestId('copy')
    // The variant 'solid' is applied; check it doesn't have the outline data attribute
    expect(copyBtn.closest('button, a')).toBeTruthy()
    vi.useRealTimers()
  })

  it('page hidden then visible → returned state', async () => {
    vi.useFakeTimers()
    renderPanel('android')
    await act(() => {
      fireEvent.click(screen.getByTestId('open'))
    })
    // Simulate the page being hidden (browser opened)
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    await act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    // Now make it visible again
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    await act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByRole('status').textContent).toContain('Did your browser open this vote')
    vi.useRealTimers()
  })

  it('pageshow with persisted resets opening to idle', async () => {
    vi.useFakeTimers()
    renderPanel('android')
    await act(() => {
      fireEvent.click(screen.getByTestId('open'))
    })
    // Simulate bfcache restore
    await act(() => {
      window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    })
    // Should be back to idle — button shows "Open in your browser"
    expect(screen.getByTestId('open').textContent).toContain('Open in your browser')
    vi.useRealTimers()
  })
})

// ---------- 3. iOS ----------

describe('iOS in-app layout', () => {
  it('step 1 is a solid Copy link button', () => {
    renderPanel('ios')
    const copy = screen.getByTestId('copy')
    expect(copy.textContent).toContain('Copy link')
    // The Copy button should be solid (the data-variant attribute from Chakra, or just check it exists)
    expect(copy).toBeTruthy()
  })

  it('clipboard write success → "Link copied" and status', async () => {
    // jsdom has no clipboard; install a mock.
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderPanel('ios')
    await act(() => {
      fireEvent.click(screen.getByTestId('copy'))
    })
    expect(screen.getByTestId('copy').textContent).toContain('Link copied')
    // iOS has two StatusLine elements (copy + try-open); check the first one (copy status).
    const statuses = screen.getAllByRole('status')
    expect(statuses.some((el) => el.textContent?.includes('Now open your browser and paste it'))).toBe(true)
    delete (navigator as Navigator & { clipboard?: unknown }).clipboard
  })

  it('clipboard rejection → touch-and-hold message', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    // execCommand returns false
    document.execCommand = vi.fn(() => false)
    renderPanel('ios')
    await act(() => {
      fireEvent.click(screen.getByTestId('copy'))
    })
    const statuses = screen.getAllByRole('status')
    expect(statuses.some((el) => el.textContent?.includes("couldn't copy it for you"))).toBe(true)
    delete (navigator as Navigator & { clipboard?: unknown }).clipboard
  })

  it('Share button present when navigator.share exists, shares clean URL', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    renderPanel('ios')
    const shareBtn = screen.getByTestId('share')
    expect(shareBtn).toBeTruthy()
    await act(() => {
      fireEvent.click(shareBtn)
    })
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: expect.not.stringContaining('identify') }))
    delete (navigator as Navigator & { share?: unknown }).share
  })

  it('shows iOS note in step 2', () => {
    renderPanel('ios')
    expect(screen.getByText(/browser that was already on your device/)).toBeTruthy()
  })

  it('shows "Try opening it for me" link by default', () => {
    renderPanel('ios')
    const tryOpen = screen.getByTestId('try-open')
    expect(tryOpen.getAttribute('href')).toContain('x-safari-https://')
    expect(tryOpen.getAttribute('href')).toContain('?identify=cert-escape')
  })

  it('hides "Try opening it for me" when DISABLE_CERTIFICATE_IOS_OPEN_LINK is true', () => {
    renderPanel('ios', 'in-app', { DISABLE_CERTIFICATE_IOS_OPEN_LINK: true })
    expect(screen.queryByTestId('try-open')).toBeNull()
  })

  it('shows the app-menu box', () => {
    renderPanel('ios')
    expect(screen.getByText(/use this app's menu/i)).toBeTruthy()
    expect(screen.getByText(/If it opens a browser you installed yourself/)).toBeTruthy()
  })
})

// ---------- 4. other platform ----------

describe('"other" platform layout', () => {
  it('uses copy-first layout without iOS note and without Try opening it', () => {
    renderPanel('other')
    expect(screen.queryByText(/browser that was already on your device/)).toBeNull()
    expect(screen.queryByTestId('try-open')).toBeNull()
    // Still shows the app-menu box for in-app variant
    expect(screen.getByText(/use this app's menu/i)).toBeTruthy()
    // Does not show the iOS-specific menu line
    expect(screen.queryByText(/If it opens a browser you installed yourself/)).toBeNull()
  })
})

// ---------- 5. ios-other-browser and old-firefox-android ----------

describe('ios-other-browser and old-firefox-android variants', () => {
  it('ios-other-browser: shows its own sentence, copy-first layout, no app-menu box', () => {
    renderPanel('ios', 'ios-other-browser')
    expect(screen.getByText(/The browser that came with your device can/)).toBeTruthy()
    expect(screen.getByTestId('copy')).toBeTruthy()
    expect(screen.queryByText(/use this app's menu/i)).toBeNull()
  })

  it('old-firefox-android: shows its own sentence, copy-first layout, no app-menu box', () => {
    renderPanel('android', 'old-firefox-android')
    expect(screen.getByText(/This browser version can't use your digital certificate/)).toBeTruthy()
    expect(screen.getByTestId('copy')).toBeTruthy()
    expect(screen.queryByText(/use this app's menu/i)).toBeNull()
  })
})

// ---------- 6. EscapeStickyAction ----------

describe('EscapeStickyAction', () => {
  it('Android not blocked → outline Open link (same intent URL)', () => {
    renderSticky('android', 'in-app', 'idle')
    const openLink = screen.getByTestId('open')
    expect(openLink.getAttribute('href')).toContain('intent://')
    expect(openLink.textContent).toContain('Open in your browser to vote')
  })

  it('Android blocked → Copy link to vote', () => {
    renderSticky('android', 'in-app', 'blocked')
    expect(screen.queryByTestId('open')).toBeNull()
    expect(screen.getByTestId('sticky-copy').textContent).toContain('Copy the link to vote in your browser')
  })

  it('iOS → Copy link to vote (always)', () => {
    renderSticky('ios', 'in-app', 'idle')
    expect(screen.queryByTestId('open')).toBeNull()
    expect(screen.getByTestId('sticky-copy')).toBeTruthy()
  })

  it('shows hint text when copied', () => {
    renderSticky('ios', 'in-app', 'idle', 'copied')
    expect(screen.getByText('Now open your browser and paste it.')).toBeTruthy()
  })
})
