import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { setCookieConsent } from '~components/Cookies/utils'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'
import CrispChat from './CrispChat'

const { mockConfigure } = vi.hoisted(() => ({
  mockConfigure: vi.fn(),
}))

vi.mock('crisp-sdk-web', () => ({
  Crisp: {
    configure: mockConfigure,
  },
}))

const renderCrispChat = () =>
  render(
    <AppEnvProvider value={{ ...buildAppEnv({}), CRISP_WEBSITE_ID: 'website-1' }}>
      <CrispChat />
    </AppEnvProvider>
  )

describe('CrispChat', () => {
  beforeEach(() => {
    mockConfigure.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    delete (window as typeof window & { $crisp?: unknown }).$crisp
  })

  it('does not configure Crisp until cookie consent is accepted', () => {
    renderCrispChat()

    expect(mockConfigure).not.toHaveBeenCalled()
  })

  it('configures Crisp after cookie consent is accepted', async () => {
    renderCrispChat()

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

    renderCrispChat()

    act(() => {
      setCookieConsent(true)
    })

    await waitFor(() => {
      expect(mockConfigure).toHaveBeenCalledTimes(1)
      expect(mockConfigure).toHaveBeenCalledWith('website-1')
    })
  })
})
