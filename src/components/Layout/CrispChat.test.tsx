import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockConfigure } = vi.hoisted(() => ({
  mockConfigure: vi.fn(),
}))

vi.mock('crisp-sdk-web', () => ({
  Crisp: {
    configure: mockConfigure,
  },
}))

import CrispChat from './CrispChat'

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

  it('does not configure Crisp until cookie consent is accepted', () => {
    render(<CrispChat />)

    expect(mockConfigure).not.toHaveBeenCalled()
  })

  it('configures Crisp after cookie consent is accepted', async () => {
    render(<CrispChat />)

    localStorage.setItem('vocdoni-cookie-consent', 'accepted')
    act(() => {
      window.dispatchEvent(new Event('vocdoni-cookie-consent-change'))
    })

    await waitFor(() => {
      expect(mockConfigure).toHaveBeenCalledTimes(1)
      expect(mockConfigure).toHaveBeenCalledWith('website-1')
    })
  })

  it('configures Crisp even if a queue already exists on window', async () => {
    ;(window as typeof window & { $crisp?: unknown }).$crisp = []

    render(<CrispChat />)

    localStorage.setItem('vocdoni-cookie-consent', 'accepted')
    act(() => {
      window.dispatchEvent(new Event('vocdoni-cookie-consent-change'))
    })

    await waitFor(() => {
      expect(mockConfigure).toHaveBeenCalledTimes(1)
      expect(mockConfigure).toHaveBeenCalledWith('website-1')
    })

    delete (window as typeof window & { $crisp?: unknown }).$crisp
  })
})
