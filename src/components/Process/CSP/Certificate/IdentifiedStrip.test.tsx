import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render } from '~src/test-utils'
import type { CertHolder } from '~src/queries/certificateAuth/types'
import { IdentifiedStrip } from './IdentifiedStrip'

const DNI_HOLDER: CertHolder = { fullName: 'Maria García López', documentType: 'DNI', documentEnding: '678Z' }
const NIE_HOLDER: CertHolder = { fullName: 'Juan Pérez', documentType: 'NIE', documentEnding: '567L' }

const renderStrip = (holder: CertHolder = DNI_HOLDER, onLogout = vi.fn()) =>
  render(<IdentifiedStrip holder={holder} onLogout={onLogout} />, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } })

describe('IdentifiedStrip', () => {
  it('shows the holder name in bold for a DNI holder', () => {
    const { getByText } = renderStrip()
    const bold = getByText('Maria García López')
    expect(bold.tagName).toBe('B')
  })

  it('renders DNI ending in the identification line', () => {
    const { getByText } = renderStrip()
    expect(getByText(/DNI ending in 678Z/)).toBeInTheDocument()
  })

  it('renders NIE ending for a NIE holder', () => {
    const { getByText } = renderStrip(NIE_HOLDER)
    expect(getByText(/NIE ending in 567L/)).toBeInTheDocument()
  })

  it('renders the privacy line', () => {
    const { getByText } = renderStrip()
    expect(
      getByText(/Your certificate was only used to check you're on the voter list; it's not attached to your ballot\./)
    ).toBeInTheDocument()
  })

  it('has role="status" on the strip', () => {
    const { getByRole } = renderStrip()
    expect(getByRole('status')).toBeInTheDocument()
  })

  it('has ph-no-capture class on the strip', () => {
    const { getByRole } = renderStrip()
    expect(getByRole('status')).toHaveClass('ph-no-capture')
  })

  it('"Not you? Log out" is a button, not a link', () => {
    const { getByRole } = renderStrip()
    const btn = getByRole('button', { name: 'Not you? Log out' })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toHaveAttribute('href')
  })

  it('calls onLogout when the button is clicked', async () => {
    const onLogout = vi.fn()
    const { getByRole } = renderStrip(DNI_HOLDER, onLogout)
    await userEvent.setup().click(getByRole('button', { name: 'Not you? Log out' }))
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
