import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '~src/test-utils'
import { CheckingPanel, OpeningPanel, StalledPanel } from './ProgressPanels'

describe('OpeningPanel', () => {
  it('renders the opening heading and body', () => {
    const { getByRole, getByText } = render(<OpeningPanel ref={createRef()} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })
    expect(getByRole('heading', { level: 2, name: 'Opening the certificate window...' })).toBeInTheDocument()
    expect(getByText('Choose the certificate with your name and press OK.')).toBeInTheDocument()
  })
})

describe('CheckingPanel', () => {
  it('renders the default checking copy', () => {
    const { getByRole, getByText } = render(<CheckingPanel ref={createRef()} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })
    expect(getByRole('heading', { level: 2, name: 'Checking your certificate...' })).toBeInTheDocument()
    expect(getByText('This can take up to 30 seconds.')).toBeInTheDocument()
  })

  it('renders the slow copy when slow is true', () => {
    const { getByRole, getByText } = render(<CheckingPanel ref={createRef()} slow />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })
    expect(
      getByRole('heading', { level: 2, name: 'Still checking with your certificate provider...' })
    ).toBeInTheDocument()
    expect(getByText('Keep this page open. It can take up to 30 seconds.')).toBeInTheDocument()
  })
})

describe('StalledPanel', () => {
  it('renders the stalled heading, body, and Try again button', async () => {
    const onRetry = vi.fn()
    const { getByRole, getByText } = render(<StalledPanel ref={createRef()} onRetry={onRetry} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })
    expect(getByRole('heading', { level: 2, name: "The check didn't finish" })).toBeInTheDocument()
    expect(
      getByText("This is usually a slow connection. Press Try again: you won't need to choose your certificate again.")
    ).toBeInTheDocument()
    await userEvent.setup().click(getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
