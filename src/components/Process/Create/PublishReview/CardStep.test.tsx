import userEvent from '@testing-library/user-event'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import type { PublicationWait } from '~queries/process-checkout'
import type { ProcessCheckoutStart } from '~components/Pricing/ProcessCheckout'
import { PublishDialog } from './PublishDialog'

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const state = vi.hoisted(() => ({
  wallet: undefined as unknown,
  checkout: {} as any,
  stripePromise: Promise.resolve({}) as Promise<any> | null,
  providerOptions: undefined as any,
  // Whether the Stripe elements say they painted (onReady)
  elementsReady: true,
}))

const api = vi.hoisted(() => ({
  checkout: vi.fn(),
  cancel: vi.fn(),
  getCheckout: vi.fn(),
  getPrice: vi.fn(),
  publish: vi.fn(),
  waitForPublication: vi.fn(),
  waitForJob: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc' }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      elections: {
        publish: api.publish,
        checkout: (...args: unknown[]) => api.checkout(...args),
        getCheckout: (...args: unknown[]) => api.getCheckout(...args),
        cancelCheckout: (...args: unknown[]) => api.cancel(...args),
        getPrice: (...args: unknown[]) => api.getPrice(...args),
      },
      organizations: { getWallet: async () => state.wallet },
      jobs: { waitFor: (...args: unknown[]) => api.waitForJob(...args) },
    },
  }),
}))

vi.mock('~queries/process-checkout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/process-checkout')>()),
  // The real wait runs seconds of backoff; its own behaviour is covered in process-checkout.test.ts
  waitForPublication: (...args: unknown[]) => api.waitForPublication(...args),
}))

vi.mock('@stripe/react-stripe-js/checkout', async () => {
  const React = await import('react')
  return {
    CheckoutElementsProvider: ({ children, options }: { children: React.ReactNode; options: any }) => {
      state.providerOptions = options
      return React.createElement(React.Fragment, null, children)
    },
    useCheckoutElements: () => state.checkout,
    BillingAddressElement: ({ onReady }: { onReady?: () => void }) => {
      React.useEffect(() => {
        if (state.elementsReady) onReady?.()
      }, [onReady])
      return React.createElement('div', null, 'billing-address')
    },
    TaxIdElement: () => React.createElement('div', null, 'tax-id'),
    PaymentElement: ({ onReady }: { onReady?: () => void }) => {
      React.useEffect(() => {
        if (state.elementsReady) onReady?.()
      }, [onReady])
      return React.createElement('div', null, 'payment-element')
    },
  }
})

vi.mock('~components/Pricing/stripe', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Pricing/stripe')>()),
  useStripePromise: () => state.stripePromise,
}))

const session = (overrides: Record<string, unknown> = {}) => ({
  clientSecret: 'cs_test',
  sessionId: 'cs_session',
  amountCents: 1000,
  currency: 'eur',
  ...overrides,
})

// Stripe's own total is VAT-inclusive: the pay button shows this figure
const readyCheckout = (confirm = vi.fn().mockResolvedValue({ type: 'success' })) => ({
  type: 'success',
  checkout: {
    confirm,
    total: {
      taxExclusive: { amount: '€1.00', minorUnitsAmount: 100 },
      total: { amount: '€6.05', minorUnitsAmount: 605 },
    },
  },
})

// The card step lives in the publish dialog; with no form (as on a return) it has no summary to go back to
const renderView = ({
  start = { kind: 'checkout' } as ProcessCheckoutStart,
  onPublished = vi.fn(),
  onClose = vi.fn(),
}: { start?: ProcessCheckoutStart; onPublished?: () => void; onClose?: () => void } = {}) => {
  render(
    <TestMemoryRouter>
      <button type='button'>outside</button>
      <PublishDialog
        processId={processId}
        form={null}
        start={start}
        canTopUp
        onPublished={onPublished}
        onClose={onClose}
      />
    </TestMemoryRouter>
  )
  return { onPublished, onClose }
}

// The pay button carries Stripe's VAT-inclusive total when Stripe has one
const payButton = () => screen.findByRole('button', { name: /^Pay .+ and publish$/ })

describe('CardStep', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    state.wallet = { balanceCents: 0, currency: 'eur', history: [], pagination: {} }
    state.checkout = readyCheckout()
    state.stripePromise = Promise.resolve({})
    state.elementsReady = true
    api.getPrice.mockResolvedValue({
      lines: [],
      totalCents: 1000,
      currency: 'eur',
      quoteRecommended: false,
      quoteRequired: false,
    })
    api.checkout.mockResolvedValue(session())
    api.cancel.mockResolvedValue(undefined)
    api.getCheckout.mockResolvedValue({ status: 'pending', amountCents: 1000, currency: 'eur' })
    api.publish.mockResolvedValue({ jobId: 'job' })
    api.waitForPublication.mockResolvedValue('published' as PublicationWait)
    api.waitForJob.mockResolvedValue({ jobId: 'job-1', status: 'completed' })
  })

  describe('the card form', () => {
    it('shows the price, the balance and the shortfall, with the VAT and total Stripe charges', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 550 }))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 550, balanceCents: 450 } } })

      expect(await payButton()).toHaveTextContent('€6.05')
      expect(screen.getByText('Pay €6.05 and the vote is published.')).toBeInTheDocument()
      expect(
        screen.getByText("The organization's balance covers €4.50. The rest is paid now, with VAT.")
      ).toBeInTheDocument()
      const amount = (label: string) => screen.getByText(label).nextElementSibling
      // Amount columns keep both cent digits, with a real minus sign
      expect(amount('This vote')).toHaveTextContent(/^€10\.00$/)
      expect(amount('Organization balance')).toHaveTextContent(/^\u2212€4\.50$/)
      expect(amount('Short')).toHaveTextContent(/^€5\.50$/)
      // The top-up is exactly the shortfall, so it is not repeated
      expect(screen.queryByText('Top-up, VAT excluded')).not.toBeInTheDocument()
      expect(amount('VAT')).toHaveTextContent('€1.00')
      expect(amount('Total to pay now')).toHaveTextContent('€6.05')
      expect(screen.getByText('After publishing, the balance is left at zero.')).toBeInTheDocument()
    })

    it('lists the top-up apart when it is not the shortfall', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 100 }))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 50, balanceCents: 950 } } })

      await payButton()
      expect(screen.getByText('Top-up, VAT excluded').nextElementSibling).toHaveTextContent(/^€1\.00$/)
    })

    it('shows the billing details and the payment form, with the secure payment note', async () => {
      renderView()

      await payButton()
      expect(screen.getByText('Billing details')).toBeInTheDocument()
      expect(screen.getByText('billing-address')).toBeInTheDocument()
      expect(screen.getByText('tax-id')).toBeInTheDocument()
      expect(screen.getByText('How you pay')).toBeInTheDocument()
      expect(screen.getByText('payment-element')).toBeInTheDocument()
      expect(screen.getByText(/^Secure payment processed by Stripe/)).toBeInTheDocument()
    })

    it('says the whole vote is paid now when the balance is empty', async () => {
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 1000, balanceCents: 0 } } })

      await payButton()
      expect(screen.getByText('You pay the whole vote now, with VAT.')).toBeInTheDocument()
      expect(screen.queryByText('Organization balance')).not.toBeInTheDocument()
    })

    it('holds the amounts and the pay button until Stripe has loaded', async () => {
      state.checkout = { type: 'loading' }
      renderView()

      // Its label waits for Stripe's total, so it names no amount yet; disabled, but no spinner, since
      // nothing is being paid
      const pay = await screen.findByRole('button', { name: 'Pay and publish' })
      expect(pay).toBeDisabled()
      expect(pay).not.toHaveAttribute('data-loading')
      expect(screen.queryByText('payment-element')).not.toBeInTheDocument()
      expect(screen.queryByText(/and the vote is published/)).not.toBeInTheDocument()
    })

    it('keeps a skeleton over each Stripe element until it has painted', async () => {
      state.elementsReady = false
      renderView()

      await payButton()
      // Mounted, so they can load, but still under their skeletons
      expect(screen.getByText('billing-address')).toBeInTheDocument()
      expect(screen.getByText('payment-element')).toBeInTheDocument()
      expect(document.querySelectorAll('.publish-review__skeleton[data-kind=field]')).toHaveLength(2)
    })

    it('drops the skeletons once the Stripe elements have painted', async () => {
      renderView()

      await payButton()
      await waitFor(() =>
        expect(document.querySelectorAll('.publish-review__skeleton[data-kind=field]')).toHaveLength(0)
      )
    })

    it("shows the card step's frame while its session opens, not a bare spinner", async () => {
      api.checkout.mockReturnValue(new Promise(() => undefined))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 550, balanceCents: 450 } } })

      expect(await screen.findByRole('button', { name: 'Pay and publish' })).toBeDisabled()
      expect(screen.getByText('What you pay now')).toBeInTheDocument()
      expect(screen.getByText('Short').nextElementSibling).toHaveTextContent('€5.50')
      expect(screen.getByText('Billing details')).toBeInTheDocument()
      expect(screen.getByText('How you pay')).toBeInTheDocument()
      expect(screen.queryByText('payment-element')).not.toBeInTheDocument()
    })

    it('pays the net top-up when Stripe gives no total', async () => {
      state.checkout = { type: 'success', checkout: { confirm: vi.fn() } }
      renderView()

      expect(await screen.findByRole('button', { name: 'Pay €10 and publish' })).toBeInTheDocument()
    })

    it('explains that the rest stays in the wallet when the €1 minimum is above the shortfall', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 100 }))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 50, balanceCents: 950 } } })

      expect(await payButton()).toBeInTheDocument()
      expect(screen.getByText('The rest stays in your wallet.')).toBeInTheDocument()
    })

    it('does not explain the rest when the top-up is exactly the shortfall', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 1000 }))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 1000, balanceCents: 0 } } })

      expect(await payButton()).toBeInTheDocument()
      expect(screen.queryByText('The rest stays in your wallet.')).not.toBeInTheDocument()
    })

    it('does not explain the rest on the conflict path, where there is no shortfall', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 100 }))
      renderView({ start: { kind: 'conflict' } })

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Resume payment' }))

      expect(await payButton()).toBeInTheDocument()
      expect(screen.queryByText('The rest stays in your wallet.')).not.toBeInTheDocument()
    })

    // A modal focus trap and pointer blocking break Stripe's 3D Secure lightbox
    it('renders in the dialog without making it modal, so the page around stays reachable', async () => {
      renderView()

      await payButton()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await waitFor(() => expect(screen.getByRole('button', { name: 'outside' })).toBeInTheDocument())
    })
  })

  describe('paying', () => {
    it('says the payment is being processed while Stripe confirms it', async () => {
      const user = userEvent.setup()
      state.checkout = readyCheckout(vi.fn(() => new Promise(() => undefined)))
      renderView()

      await user.click(await payButton())

      const pay = await screen.findByRole('button', { name: /Processing the payment…/ })
      expect(pay).toBeDisabled()
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    })

    it('stores the draft right before confirming, so a redirect back can reopen it', async () => {
      const user = userEvent.setup()
      let stored: string | null = null
      const confirm = vi.fn(async () => {
        stored = sessionStorage.getItem('process-checkout-pending')
        return { type: 'success' }
      })
      state.checkout = readyCheckout(confirm)
      renderView()

      await user.click(await payButton())

      await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1))
      // The return URL comes from the session: confirm() is not given one
      expect(confirm).toHaveBeenCalledWith({ redirect: 'if_required' })
      expect(JSON.parse(stored ?? 'null')).toEqual({ draftId: processId })
    })

    it('forgets the stored draft when Stripe refuses the payment, since no redirect is coming', async () => {
      const user = userEvent.setup()
      state.checkout = readyCheckout(vi.fn().mockResolvedValue({ type: 'error', error: { message: 'Card declined' } }))
      renderView()

      await user.click(await payButton())

      // Announced, and next to the pay button rather than under the form
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Card declined')
      expect(alert.closest('.publish-review__footer')).not.toBeNull()
      expect(sessionStorage.getItem('process-checkout-pending')).toBeNull()
    })

    it('forgets the stored draft when confirming throws, since no redirect is coming', async () => {
      const user = userEvent.setup()
      state.checkout = readyCheckout(vi.fn().mockRejectedValue(new Error('network down')))
      renderView()

      await user.click(await payButton())

      expect(await screen.findByText('network down')).toBeInTheDocument()
      expect(sessionStorage.getItem('process-checkout-pending')).toBeNull()
    })

    it('keeps the form and shows the message when Stripe refuses the payment', async () => {
      const user = userEvent.setup()
      state.checkout = readyCheckout(vi.fn().mockResolvedValue({ type: 'error', error: { message: 'Card declined' } }))
      const { onPublished } = renderView()

      await user.click(await payButton())

      expect(await screen.findByText('Card declined')).toBeInTheDocument()
      expect(await payButton()).toBeEnabled()
      expect(api.waitForPublication).not.toHaveBeenCalled()
      expect(onPublished).not.toHaveBeenCalled()
    })
  })

  it('offers a way out when payments are unavailable', async () => {
    state.stripePromise = null
    const { onClose } = renderView()

    expect(await screen.findByText(/Payments are temporarily unavailable/)).toBeInTheDocument()
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Close' }).at(-1)!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the close button', async () => {
    const user = userEvent.setup()
    const { onClose } = renderView()

    await payButton()
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
