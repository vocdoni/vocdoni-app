import userEvent from '@testing-library/user-event'
import { render, screen, within } from '~src/test-utils'
import { VoterSignInPreview } from './VoterSignInPreview'

const preview = () => within(screen.getByTestId('voter-signin-preview'))

describe('VoterSignInPreview', () => {
  it('shows the details voters will type and asks for the code contact', () => {
    render(<VoterSignInPreview credentials={['memberNumber', 'birthDate']} codeMethod='voter_choice' />)

    expect(preview().getByText('Member Number *')).toBeInTheDocument()
    expect(preview().getByText('Birth Date *')).toBeInTheDocument()
    expect(preview().getByText('Email or Phone *')).toBeInTheDocument()
    expect(preview().getByText('Receive Code')).toBeInTheDocument()
  })

  it('identifies straight away when no code is sent', () => {
    render(<VoterSignInPreview credentials={['memberNumber']} codeMethod='none' />)

    expect(preview().getByText('Authenticate')).toBeInTheDocument()
    expect(preview().queryByText('Receive Code')).not.toBeInTheDocument()
    // No code screen to switch to.
    expect(preview().queryByRole('button', { name: 'Second step' })).not.toBeInTheDocument()
  })

  it('switches to the code screen', async () => {
    const user = userEvent.setup()
    render(<VoterSignInPreview credentials={[]} codeMethod='sms' />)

    await user.click(preview().getByRole('button', { name: 'Second step' }))

    expect(preview().getByText('Enter the verification code')).toBeInTheDocument()
  })

  it('shows the first step again after any change to the settings', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<VoterSignInPreview credentials={['memberNumber']} codeMethod='email' />)

    await user.click(preview().getByRole('button', { name: 'Second step' }))
    expect(preview().getByText('Enter the verification code')).toBeInTheDocument()

    rerender(<VoterSignInPreview credentials={['memberNumber', 'name']} codeMethod='email' />)

    expect(preview().getByText('First Name *')).toBeInTheDocument()
    expect(preview().queryByText('Enter the verification code')).not.toBeInTheDocument()
  })

  // The dialog around it is driven by locating inputs by value (the e2e suite
  // does), so the preview must never render real form controls.
  it('renders no form controls', () => {
    render(<VoterSignInPreview credentials={['memberNumber', 'name']} codeMethod='email' />)

    expect(screen.getByTestId('voter-signin-preview').querySelectorAll('input, form')).toHaveLength(0)
  })
})
