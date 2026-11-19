import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { render, screen, waitFor } from '~src/test-utils'
import { cspAuthComponents } from './csp'

const TriggerSlot = cspAuthComponents.CspAuthTrigger!
const LogoutSlot = cspAuthComponents.CspAuthLogout!
const ModalSlot = cspAuthComponents.CspAuthModal!
const IdentifySlot = cspAuthComponents.CspAuthIdentifyForm!
const CodeSlot = cspAuthComponents.CspAuthCodeForm!

describe('cspAuthComponents.CspAuthTrigger', () => {
  it('opens the flow when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<TriggerSlot label='Identify' onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Identify' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks the button busy while an auth request is in flight', () => {
    const { rerender } = render(<TriggerSlot label='Identify' onClick={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: 'Identify' })).toHaveAttribute('aria-busy', 'true')

    rerender(<TriggerSlot label='Identify' onClick={vi.fn()} loading={false} />)
    expect(screen.getByRole('button', { name: 'Identify' })).not.toHaveAttribute('aria-busy')
  })
})

describe('cspAuthComponents.CspAuthLogout', () => {
  it('clears the session when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<LogoutSlot label='Logout' onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('cspAuthComponents.CspAuthModal', () => {
  const modal = (isOpen: boolean, onClose = vi.fn()) => (
    <ModalSlot
      isOpen={isOpen}
      onClose={onClose}
      title='Authentication'
      closeLabel='Close'
      content={<span>step body</span>}
    />
  )

  it('renders its title and step only while open', async () => {
    const { rerender } = render(modal(false))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(modal(true))
    expect(await screen.findByRole('dialog', { name: 'Authentication' })).toBeInTheDocument()
    expect(screen.getByText('step body')).toBeInTheDocument()
  })

  it('reports a close button press through onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(modal(true, onClose))
    await user.click(await screen.findByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('reports Escape through onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(modal(true, onClose))
    await screen.findByRole('dialog')
    // The dialog registers its Escape listener asynchronously after mounting, so keep pressing until it is heard.
    await waitFor(async () => {
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })
  })
})

// Binds the slot to react-hook-form the way CspAuthIdentifyStep does, so the checkbox and the field are real inputs.
const IdentifyHarness = ({
  onValid,
  requireTerms = false,
}: {
  onValid: (values: unknown) => void
  requireTerms?: boolean
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>()

  return (
    <IdentifySlot
      fields={[
        {
          name: 'name',
          label: 'First Name',
          type: 'text',
          required: true,
          error: errors.name ? 'Required field' : undefined,
          inputProps: register('name', { required: true, validate: (value) => String(value ?? '').trim() !== '' }),
        },
        {
          name: 'contact',
          label: 'Email',
          type: 'email',
          required: true,
          helper: 'Must match the one registered in the system',
          inputProps: register('contact', { required: true }),
        },
      ]}
      terms={requireTerms ? 'I accept the terms' : undefined}
      termsField={
        requireTerms
          ? {
              error: errors.terms ? 'You must accept the terms to continue.' : undefined,
              inputProps: register('terms', { required: true }),
            }
          : undefined
      }
      loading={false}
      submitLabel='Receive Code'
      info='A code will be sent to you'
      onSubmit={handleSubmit(onValid)}
    />
  )
}

describe('cspAuthComponents.CspAuthIdentifyForm', () => {
  it('submits the values typed into the labelled fields', async () => {
    const onValid = vi.fn()
    const user = userEvent.setup()

    render(<IdentifyHarness onValid={onValid} />)
    await user.type(screen.getByLabelText('First Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
    expect(onValid.mock.calls[0][0]).toMatchObject({ name: 'Ada', contact: 'ada@example.com' })
  })

  it('shows the field error and blocks the submit while a required field is empty', async () => {
    const onValid = vi.fn()
    const user = userEvent.setup()

    render(<IdentifyHarness onValid={onValid} />)
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    expect(await screen.findByText('Required field')).toBeInTheDocument()
    expect(onValid).not.toHaveBeenCalled()
  })

  it('blocks the submit until the required terms checkbox is ticked', async () => {
    const onValid = vi.fn()
    const user = userEvent.setup()

    render(<IdentifyHarness onValid={onValid} requireTerms />)
    await user.type(screen.getByLabelText('First Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    expect(await screen.findByText('You must accept the terms to continue.')).toBeInTheDocument()
    expect(onValid).not.toHaveBeenCalled()

    await user.click(screen.getByText('I accept the terms'))
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
    expect(onValid.mock.calls[0][0]).toHaveProperty('terms', expect.anything())
  })

  it('leads the contact hint with a bold warning and shows the submit info and the error alert', () => {
    render(
      <IdentifySlot
        fields={[
          {
            name: 'contact',
            label: 'Email',
            type: 'email',
            required: true,
            helper: 'Must match the one registered in the system',
            inputProps: { name: 'contact', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() },
          },
        ]}
        error='The voter is not listed in the census.'
        loading={false}
        submitLabel='Receive Code'
        info='A code will be sent to you'
        onSubmit={vi.fn()}
      />
    )

    // The test i18n has no resources, so the lead-in renders as its key.
    expect(screen.getByText(/important:/i, { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Must match the one registered in the system', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('The voter is not listed in the census.')
    expect(screen.getByText('A code will be sent to you')).toBeInTheDocument()
  })
})

describe('cspAuthComponents.CspAuthCodeForm', () => {
  // Zag looks its inputs up with `input[data-ownedby=<escaped id>]`, an unquoted value jsdom's selector engine does not
  // match. Quoting the escaped id finds the same inputs, so the pin input works under test as it does in a browser.
  beforeEach(() => {
    vi.spyOn(CSS, 'escape').mockImplementation((value) => `"${value}"`)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The step owns the digits, so the form is driven as a controlled input, the way CspAuthCodeStep drives it.
  const CodeHarness = ({
    onCodeChange = vi.fn(),
    ...overrides
  }: { onCodeChange?: (code: string) => void } & Partial<Record<string, unknown>>) => {
    const [code, setCode] = useState('')
    return (
      <CodeSlot
        title='Enter the verification code'
        helper='We sent a code to your email'
        code={code}
        length={6}
        onCodeChange={(next) => {
          onCodeChange(next)
          setCode(next)
        }}
        loading={false}
        submitLabel='Authenticate'
        onSubmit={vi.fn()}
        resendLabel='Resend code'
        onResend={vi.fn()}
        resending={false}
        startOverLabel='Start over'
        onStartOver={vi.fn()}
        actionsDisabled={false}
        {...overrides}
      />
    )
  }
  const codeForm = (overrides: Partial<Record<string, unknown>> = {}) => <CodeHarness {...overrides} />

  it('shows the typed digit in the pin input and reports the code through onCodeChange', async () => {
    const onCodeChange = vi.fn()
    const user = userEvent.setup()

    render(codeForm({ onCodeChange }))
    expect(screen.getByText('Enter the verification code')).toBeInTheDocument()
    const pinInputs = screen.getAllByRole<HTMLInputElement>('textbox')
    expect(pinInputs).toHaveLength(6)
    await user.type(pinInputs[0], '7')

    expect(pinInputs[0]).toHaveValue('7')
    expect(onCodeChange).toHaveBeenLastCalledWith('7')
  })

  it('resends the code and starts the flow over through their handlers', async () => {
    const onResend = vi.fn()
    const onStartOver = vi.fn()
    const user = userEvent.setup()

    render(codeForm({ onResend, onStartOver }))
    await user.click(screen.getByRole('button', { name: 'Resend code' }))
    await user.click(screen.getByRole('button', { name: 'Start over' }))

    expect(onResend).toHaveBeenCalledTimes(1)
    expect(onStartOver).toHaveBeenCalledTimes(1)
  })

  it('disables resend and start over while an auth request is in flight', () => {
    render(codeForm({ actionsDisabled: true }))

    expect(screen.getByRole('button', { name: 'Resend code' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Start over' })).toBeDisabled()
  })

  it('shows the notice and the error', () => {
    render(codeForm({ notice: 'Verification code sent', error: 'The code is not valid or has expired.' }))

    expect(screen.getByRole('status')).toHaveTextContent('Verification code sent')
    expect(screen.getByRole('alert')).toHaveTextContent('The code is not valid or has expired.')
  })
})
