import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { WalletTopUp } from './TopUp'

const checkoutState = vi.hoisted(() => ({ current: {} as any }))
const stripePromise = vi.hoisted(() => ({ current: Promise.resolve({}) as Promise<any> | null }))
const mutateAsync = vi.hoisted(() => vi.fn())

vi.mock('@stripe/react-stripe-js/checkout', async () => {
  const React = await import('react')
  return {
    // Like Stripe, the client secret is requested once when the checkout mounts
    CheckoutProvider: ({ children, options }: { children: React.ReactNode; options: any }) => {
      React.useEffect(() => {
        options.fetchClientSecret().catch(() => undefined)
      }, [])
      return React.createElement(React.Fragment, null, children)
    },
    useCheckout: () => checkoutState.current,
    BillingAddressElement: () => React.createElement('div', null, 'billing-address'),
    TaxIdElement: () => React.createElement('div', null, 'tax-id'),
    PaymentElement: () => React.createElement('div', null, 'payment-element'),
  }
})

vi.mock('~components/Pricing/stripe', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Pricing/stripe')>()),
  useStripePromise: () => stripePromise.current,
}))

vi.mock('~queries/wallet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/wallet')>()),
  useWalletTopUp: () => ({ mutateAsync }),
}))

const readyCheckout = (confirm = vi.fn().mockResolvedValue({ type: 'success' })) => ({
  type: 'success',
  checkout: {
    confirm,
    total: {
      taxExclusive: { amount: '€10.00', minorUnitsAmount: 1000 },
      total: { amount: '€60.50', minorUnitsAmount: 6050 },
    },
  },
})

const amountInput = () => screen.getByLabelText(/amount/i)

const continueToPayment = async (user: ReturnType<typeof userEvent.setup>, amount: string) => {
  await user.clear(amountInput())
  await user.type(amountInput(), amount)
  await user.click(screen.getByRole('button', { name: /continue to payment/i }))
}

describe('WalletTopUp', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({
      clientSecret: 'cs_test',
      sessionId: 'cs_session',
      amountCents: 5000,
      currency: 'eur',
    })
    checkoutState.current = readyCheckout()
    stripePromise.current = Promise.resolve({})
  })

  describe('amount step', () => {
    it('keeps Continue disabled below the minimum', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await user.type(amountInput(), '0.99')

      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeDisabled()
      expect(screen.getByText('Enter an amount between €1 and €100,000.')).toBeInTheDocument()
    })

    it('keeps Continue disabled above the maximum', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await user.type(amountInput(), '100000.01')

      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeDisabled()
    })

    it('rejects more than two decimals', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await user.type(amountInput(), '10.555')

      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeDisabled()
      expect(screen.getByText('Use at most 2 decimals.')).toBeInTheDocument()
    })

    it('converts a decimal amount to cents exactly', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await continueToPayment(user, '19.99')

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 1999 })))
    })

    it('accepts whole amounts and amounts with two decimals', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await user.type(amountInput(), '12.5')
      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeEnabled()

      await user.clear(amountInput())
      await user.type(amountInput(), '12.50')
      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeEnabled()
    })

    it('fills the input from the preset buttons', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: '€500' }))

      expect(amountInput()).toHaveValue(500)
      expect(screen.getByRole('button', { name: /continue to payment/i })).toBeEnabled()
    })

    it('calls onCancel from the Cancel button', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      render(<WalletTopUp onDone={vi.fn()} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('payment step', () => {
    it('requests a top-up for the entered amount and locale', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await continueToPayment(user, '50')

      expect(await screen.findByText('payment-element')).toBeInTheDocument()
      await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
      expect(mutateAsync).toHaveBeenCalledWith({
        amountCents: 5000,
        locale: 'en',
        returnURL: expect.stringMatching(/\/return$/),
      })
    })

    it('shows the net amount and the checkout VAT and total', async () => {
      const user = userEvent.setup()
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await continueToPayment(user, '50')

      expect(await screen.findByText('€10.00')).toBeInTheDocument()
      expect(screen.getByText('€60.50')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pay €50' })).toBeInTheDocument()
    })

    it('confirms the payment and reports the amount when it succeeds', async () => {
      const user = userEvent.setup()
      const confirm = vi.fn().mockResolvedValue({ type: 'success' })
      checkoutState.current = readyCheckout(confirm)
      const onDone = vi.fn()
      render(<WalletTopUp onDone={onDone} onCancel={vi.fn()} />)

      await continueToPayment(user, '50')
      await user.click(await screen.findByRole('button', { name: 'Pay €50' }))

      await waitFor(() => expect(onDone).toHaveBeenCalledWith(5000))
      expect(confirm).toHaveBeenCalledWith({ redirect: 'if_required' })
    })

    it('shows the error and stays when the payment is rejected', async () => {
      const user = userEvent.setup()
      const confirm = vi.fn().mockResolvedValue({ type: 'error', error: { message: 'Card declined' } })
      checkoutState.current = readyCheckout(confirm)
      const onDone = vi.fn()
      render(<WalletTopUp onDone={onDone} onCancel={vi.fn()} />)

      await continueToPayment(user, '50')
      await user.click(await screen.findByRole('button', { name: 'Pay €50' }))

      expect(await screen.findByText('Card declined')).toBeInTheDocument()
      expect(onDone).not.toHaveBeenCalled()
    })

    it('shows the checkout error with a way back to the amount step', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      checkoutState.current = { type: 'error', error: { message: 'Session failed' } }
      render(<WalletTopUp onDone={vi.fn()} onCancel={onCancel} />)

      await continueToPayment(user, '50')

      expect(await screen.findByText('Session failed')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /back/i }))

      expect(amountInput()).toHaveValue(50)
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('shows the unavailable message when Stripe is not configured', async () => {
      const user = userEvent.setup()
      stripePromise.current = null
      render(<WalletTopUp onDone={vi.fn()} onCancel={vi.fn()} />)

      await continueToPayment(user, '50')

      expect(
        await screen.findByText('Payments are temporarily unavailable. Please try again later.')
      ).toBeInTheDocument()
      expect(mutateAsync).not.toHaveBeenCalled()
    })
  })
})
