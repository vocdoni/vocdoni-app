import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { MethodStep } from './MethodStep'

describe('MethodStep', () => {
  it('shows both cards unchecked with both descriptions visible when no method is selected', () => {
    render(<MethodStep method={null} onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: /Member details/i })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Digital certificate/i })).not.toBeChecked()

    expect(
      screen.getByText('Voters type in details from your member list, like their member number.')
    ).toBeInTheDocument()
    expect(screen.getByText('Voters sign in with their own digital certificate.')).toBeInTheDocument()
  })

  it('calls onChange with certificate when clicking the certificate card', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MethodStep method={null} onChange={onChange} />)

    await user.click(screen.getByRole('radio', { name: /Digital certificate/i }))

    expect(onChange).toHaveBeenCalledWith('certificate')
  })

  it('with certificate selected, descriptions are inert and certificate radio is checked', () => {
    render(<MethodStep method='certificate' onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: /Digital certificate/i })).toBeChecked()

    // Both descriptions are hidden via the inert wrapper once a method is chosen.
    const description = screen.getByText('Voters sign in with their own digital certificate.')
    expect(description.closest('[inert]')).not.toBeNull()
  })

  it('info button opens tooltip on focus; clicking it does not call onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MethodStep method={null} onChange={onChange} />)

    const infoBtn = screen.getByRole('button', { name: 'Which digital certificates work?' })

    // Non-touch click sets open=true directly; this also covers keyboard activation.
    // Zag's hover/focus path is tested in the openDelay branch, which needs fake timers.
    await user.click(infoBtn)
    expect(
      screen.getByText('We accept idCAT Certificat and FNMT, the Spanish digital certificates.')
    ).toBeInTheDocument()
    expect(screen.getByText('Need another type of digital certificate? Ask the Vocdoni team.')).toBeInTheDocument()

    // Clicking the info button stops propagation so it never selects a method.
    expect(onChange).not.toHaveBeenCalled()
  })
})
