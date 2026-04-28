import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { setCookieConsent } from '~components/Cookies/utils'

const { mockConfigure } = vi.hoisted(() => ({
  mockConfigure: vi.fn(),
}))

vi.mock('crisp-sdk-web', () => ({
  Crisp: {
    configure: mockConfigure,
  },
}))

describe('CrispChat', () => {
  beforeEach(() => {
    vi.resetModules()
    mockConfigure.mockClear()
    localStorage.clear()
    import.meta.env.CRISP_WEBSITE_ID = 'website-1'
  })

  afterEach(() => {
    import.meta.env.CRISP_WEBSITE_ID = ''
  })

  it('does not configure Crisp until cookie consent is accepted', async () => {
    const { default: CrispChat } = await import('./CrispChat')

    render(<CrispChat />)

    expect(mockConfigure).not.toHaveBeenCalled()
  })

  it('configures Crisp after cookie consent is accepted', async () => {
    const { default: CrispChat } = await import('./CrispChat')

    render(<CrispChat />)

    act(() => {
      setCookieConsent(true)
    })

    await waitFor(() => {
      expect(mockConfigure).toHaveBeenCalledTimes(1)
      expect(mockConfigure).toHaveBeenCalledWith('website-1')
    })
  })

  it('configures Crisp even if a queue already exists on window', async () => {
    ;(window as typeof window & { $crisp?: unknown }).$crisp = []

    const { default: CrispChat } = await import('./CrispChat')

    render(<CrispChat />)

    act(() => {
      setCookieConsent(true)
    })

    await waitFor(() => {
      expect(mockConfigure).toHaveBeenCalledTimes(1)
      expect(mockConfigure).toHaveBeenCalledWith('website-1')
    })

    delete (window as typeof window & { $crisp?: unknown }).$crisp
  })
})
