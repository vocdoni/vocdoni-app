import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '~src/test-utils'
import { IdentifyPanel } from './IdentifyPanel'

const onStart = vi.fn()

const renderPanel = (props: Partial<React.ComponentProps<typeof IdentifyPanel>> = {}) =>
  render(<IdentifyPanel ref={createRef()} onStart={onStart} {...props} />, {
    appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
  })

describe('IdentifyPanel', () => {
  it('renders a level-2 heading "Identify to vote"', () => {
    const { getByRole } = renderPanel()
    expect(getByRole('heading', { level: 2, name: 'Identify to vote' })).toBeInTheDocument()
  })

  it('calls onStart when the button is clicked', async () => {
    const { getByRole } = renderPanel()
    await userEvent.setup().click(getByRole('button', { name: /Access with your digital certificate/i }))
    expect(onStart).toHaveBeenCalled()
  })

  it('renders consent text with links to Terms and Privacy Policy', () => {
    const { getByRole } = renderPanel()
    expect(getByRole('link', { name: 'Terms' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('renders the two help lines and no others', () => {
    const { getByText, queryByText } = renderPanel()
    expect(getByText(/Works with idCAT Certificat and FNMT certificates\./)).toBeInTheDocument()
    expect(getByText(/We only use your certificate to check you're on the voter list\./)).toBeInTheDocument()
    expect(queryByText(/open a window to choose your certificate/i)).toBeNull()
    expect(queryByText(/I don't have a certificate|on my computer/i)).toBeNull()
  })

  it('shows the resume line above the button when resume is true', () => {
    const { getByText } = renderPanel({ resume: true })
    expect(getByText(/Let's finish identifying you\. Press the button to continue\./i)).toBeInTheDocument()
  })

  it('does not show the resume line when resume is false', () => {
    const { queryByText } = renderPanel({ resume: false })
    expect(queryByText(/Let's finish identifying you/i)).toBeNull()
  })
})
