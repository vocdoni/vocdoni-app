import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError, BadRequestApiError, ErrorCode } from '~components/Auth/api'
import { render, screen, waitFor } from '~src/test-utils'
import type { PublicationWait } from '~queries/process-checkout'
import { ProcessCheckout, type ProcessCheckoutStart } from './ProcessCheckout'

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const state = vi.hoisted(() => ({
  wallet: undefined as unknown,
  checkout: {} as any,
  stripePromise: Promise.resolve({}) as Promise<any> | null,
}))

const api = vi.hoisted(() => ({
  checkout: vi.fn(),
  cancel: vi.fn(),
  getCheckout: vi.fn(),
  publish: vi.fn(),
  waitForPublication: vi.fn(),
  waitForJob: vi.fn(),
}))

const mockBearedFetch = vi.hoisted(() => vi.fn())

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: mockBearedFetch, currentAddress: '0xabc' }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      elections: { publish: api.publish },
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
    CheckoutProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useCheckout: () => state.checkout,
    BillingAddressElement: () => React.createElement('div', null, 'billing-address'),
    TaxIdElement: () => React.createElement('div', null, 'tax-id'),
    PaymentElement: () => React.createElement('div', null, 'payment-element'),
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

const apiError = (status: number, code?: number, data?: unknown) =>
  new ApiError({ error: 'refused', code, data }, new Response(null, { status }))

const renderView = ({
  start = { kind: 'checkout' } as ProcessCheckoutStart,
  onPublished = vi.fn(),
  onClose = vi.fn(),
}: { start?: ProcessCheckoutStart; onPublished?: () => void; onClose?: () => void } = {}) => {
  render(<ProcessCheckout processId={processId} start={start} onPublished={onPublished} onClose={onClose} />)
  return { onPublished, onClose }
}

// The pay button carries Stripe's VAT-inclusive total when Stripe has one
const payButton = () => screen.findByRole('button', { name: /^Pay .+ and publish$/ })

// The SDK's job wait throws once its limit passed: the clock is moved on as it does
let clockSpy: { mockRestore: () => void } | undefined
const jobWaitTimesOut =
  (message = 'Timed out waiting for job job-1 after 900000ms') =>
  async () => {
    const now = Date.now()
    clockSpy = vi.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000 + 1)
    throw new Error(message)
  }

describe('ProcessCheckout', () => {
  afterEach(() => clockSpy?.mockRestore())

  beforeEach(() => {
    vi.clearAllMocks()
    state.wallet = { balanceCents: 0, currency: 'eur', history: [], pagination: {} }
    state.checkout = readyCheckout()
    state.stripePromise = Promise.resolve({})
    mockBearedFetch.mockReset()
    mockBearedFetch.mockImplementation(async (path: string, init?: { method?: string }) => {
      if (path.endsWith('/price')) {
        return { lines: [], totalCents: 1000, currency: 'eur', quoteRecommended: false, quoteRequired: false }
      }
      if (path.includes('/wallet')) return state.wallet
      if (init?.method === 'POST') return api.checkout()
      if (init?.method === 'DELETE') return api.cancel()
      return api.getCheckout()
    })
    api.checkout.mockResolvedValue(session())
    api.cancel.mockResolvedValue(undefined)
    api.getCheckout.mockResolvedValue({ status: 'pending', amountCents: 1000, currency: 'eur' })
    api.publish.mockResolvedValue({ jobId: 'job' })
    api.waitForPublication.mockResolvedValue('published' as PublicationWait)
    api.waitForJob.mockResolvedValue({ jobId: 'job-1', status: 'completed' })
  })

  describe('summary and payment', () => {
    it('shows the shortfall, the wallet balance and the top-up, with the VAT and total Stripe charges', async () => {
      api.checkout.mockResolvedValue(session({ amountCents: 550 }))
      renderView({ start: { kind: 'checkout', shortfall: { shortfallCents: 550, balanceCents: 450 } } })

      expect(await payButton()).toHaveTextContent('€6.05')
      expect(screen.getByText('Shortfall (VAT excluded)')).toBeInTheDocument()
      expect(screen.queryByText('Draft total (VAT excluded)')).not.toBeInTheDocument()
      expect(screen.getByText('Wallet balance')).toBeInTheDocument()
      expect(screen.getByText('€4.50')).toBeInTheDocument()
      expect(screen.getByText('Top-up (VAT excluded)')).toBeInTheDocument()
      expect(screen.getAllByText('€5.50')).toHaveLength(2)
      expect(screen.getByText('€1.00')).toBeInTheDocument()
      expect(screen.getByText('€6.05', { selector: 'p' })).toBeInTheDocument()
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

    it('renders inline, never in a modal dialog', async () => {
      renderView()

      await payButton()
      expect(screen.getByText('Top up and publish')).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('opens the checkout for the process with the locale and no return URL', async () => {
      renderView()

      await payButton()
      expect(mockBearedFetch).toHaveBeenCalledWith(`processes/${processId}/checkout`, {
        method: 'POST',
        body: { locale: 'en' },
      })
    })
  })

  describe('after the payment', () => {
    it('waits for the publication, then hands off once the process is published', async () => {
      const user = userEvent.setup()
      const { onPublished } = renderView()

      await user.click(await payButton())

      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForPublication).toHaveBeenCalledTimes(1)
      expect(api.publish).not.toHaveBeenCalled()
    })

    it('confirms the payment with a return URL that reopens the wizard on the draft', async () => {
      const user = userEvent.setup()
      const confirm = vi.fn().mockResolvedValue({ type: 'success' })
      state.checkout = readyCheckout(confirm)
      renderView()

      await user.click(await payButton())

      await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1))
      expect(confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          redirect: 'if_required',
          returnUrl: expect.stringContaining(`draftId=${processId}`),
        })
      )
      expect(confirm.mock.calls[0][0].returnUrl).toContain('checkout=return')
    })

    it('shows the waiting state while the publication is awaited, and reads the payment as it waits', async () => {
      const user = userEvent.setup()
      api.waitForPublication.mockReturnValue(new Promise(() => undefined))
      const { onPublished } = renderView()

      await user.click(await payButton())

      expect(await screen.findByText('Payment received. Publishing your voting process…')).toBeInTheDocument()
      expect(onPublished).not.toHaveBeenCalled()
      expect(typeof api.waitForPublication.mock.calls[0][1].readPayment).toBe('function')
    })

    it('says the payment is confirmed only when the payment reads as paid, on timeout', async () => {
      const user = userEvent.setup()
      api.getCheckout.mockResolvedValue({ status: 'paid', amountCents: 1000, currency: 'eur' })
      api.waitForPublication.mockImplementationOnce(async (_isPublished, options) => {
        await options.readPayment()
        return 'timeout'
      })
      renderView()

      await user.click(await payButton())

      expect(
        await screen.findByText(
          'Your payment is confirmed and the voting process publishes shortly. If it does not, publish it again: it is paid from your wallet.'
        )
      ).toBeInTheDocument()
    })

    it('gives neutral timeout copy when the payment is not confirmed as paid', async () => {
      const user = userEvent.setup()
      api.waitForPublication.mockResolvedValueOnce('timeout')
      renderView()

      await user.click(await payButton())

      expect(
        await screen.findByText(
          'The voting process is still being published. If it does not appear shortly, publish it again: it is paid from your wallet.'
        )
      ).toBeInTheDocument()
      expect(screen.queryByText(/Your payment is confirmed/)).not.toBeInTheDocument()
    })

    it('publishes again from the timeout, and waits for the process once more', async () => {
      const user = userEvent.setup()
      api.waitForPublication.mockResolvedValueOnce('timeout').mockResolvedValue('published')
      const { onPublished } = renderView()

      await user.click(await payButton())
      await user.click(await screen.findByRole('button', { name: 'Publish again' }))

      expect(api.publish).toHaveBeenCalledWith(processId)
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    })

    it('says the payment is still being confirmed for a delayed method', async () => {
      const user = userEvent.setup()
      api.waitForPublication.mockResolvedValue('unconfirmed')
      renderView()

      await user.click(await payButton())

      expect(await screen.findByText(/Your payment is still being confirmed/)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Publish again' })).not.toBeInTheDocument()
    })

    it('returns to the checkout with a message when the payment did not go through', async () => {
      const user = userEvent.setup()
      api.waitForPublication.mockResolvedValueOnce('unpaid')
      renderView()

      await user.click(await payButton())

      expect(await screen.findByText('The payment did not go through. You can try again.')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Try again' }))

      expect(api.checkout).toHaveBeenCalledTimes(2)
      expect(await payButton()).toBeInTheDocument()
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

  describe('returning from a redirect', () => {
    it('reopens in the waiting state without opening a new checkout', async () => {
      const { onPublished } = renderView({ start: { kind: 'return' } })

      expect(await screen.findByText('Publishing your voting process…')).toBeInTheDocument()
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.checkout).not.toHaveBeenCalled()
    })

    it('shows the neutral copy on return until a read says the payment is paid', async () => {
      api.getCheckout.mockResolvedValue({ status: 'paid', amountCents: 1000, currency: 'eur' })
      let read: (() => Promise<unknown>) | undefined
      api.waitForPublication.mockImplementation(
        (_isPublished: unknown, options: { readPayment: () => Promise<unknown> }) => {
          read = options.readPayment
          return new Promise(() => undefined)
        }
      )
      renderView({ start: { kind: 'return' } })

      expect(await screen.findByText('Publishing your voting process…')).toBeInTheDocument()
      expect(screen.queryByText('Payment received. Publishing your voting process…')).not.toBeInTheDocument()
      await act(async () => {
        await read?.()
      })
      expect(await screen.findByText('Payment received. Publishing your voting process…')).toBeInTheDocument()
    })
  })

  describe('a process the wizard published', () => {
    it('hands off once its publish job completes, without polling the process', async () => {
      const { onPublished } = renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForJob).toHaveBeenCalledWith('job-1', expect.objectContaining({ timeoutMs: 15 * 60 * 1000 }))
      expect(api.waitForPublication).not.toHaveBeenCalled()
    })

    it('reports a failed publish job at once, with the job error', async () => {
      api.waitForJob.mockRejectedValue(
        new JobFailedError({ jobId: 'job-1', status: 'failed', errors: ['the chain rejected the process'] } as any)
      )
      const { onPublished } = renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      expect(await screen.findByText('the chain rejected the process')).toBeInTheDocument()
      expect(onPublished).not.toHaveBeenCalled()
      expect(screen.queryByText(/still being published/)).not.toBeInTheDocument()
    })

    it('polls the process when reading the job fails transiently, and hands off once it is published', async () => {
      api.waitForJob.mockRejectedValue(new VocdoniApiError(502, null, 'bad gateway'))
      const { onPublished } = renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForPublication).toHaveBeenCalledTimes(1)
      expect(api.waitForPublication.mock.calls[0][1].readPayment).toBeUndefined()
    })

    it('ends in the error step when reading the job is refused for good (404)', async () => {
      api.waitForJob.mockRejectedValue(new VocdoniApiError(404, null, 'no such job'))
      const { onPublished } = renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      expect(await screen.findByText(/no such job/)).toBeInTheDocument()
      expect(onPublished).not.toHaveBeenCalled()
      expect(api.waitForPublication).not.toHaveBeenCalled()
    })

    it('shows the neutral timeout when its publish job is still running after the limit', async () => {
      api.waitForJob.mockImplementation(jobWaitTimesOut())
      renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      expect(await screen.findByText(/The voting process is still being published/)).toBeInTheDocument()
    })

    it('waits on the job of a publish from the timeout, not on the process', async () => {
      const user = userEvent.setup()
      api.waitForJob.mockImplementationOnce(jobWaitTimesOut())
      api.publish.mockResolvedValue({ jobId: 'job-2' })
      const { onPublished } = renderView({ start: { kind: 'publishing', jobId: 'job-1' } })

      await user.click(await screen.findByRole('button', { name: 'Publish again' }))

      await waitFor(() => expect(api.waitForJob).toHaveBeenLastCalledWith('job-2', expect.anything()))
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    })

    it('waits for the process without reading a payment or opening a checkout', async () => {
      const { onPublished } = renderView({ start: { kind: 'publishing' } })

      expect(await screen.findByText('Publishing your voting process…')).toBeInTheDocument()
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForPublication.mock.calls[0][1].readPayment).toBeUndefined()
      expect(api.checkout).not.toHaveBeenCalled()
    })

    it('does not say the payment is confirmed when its wait times out', async () => {
      api.waitForPublication.mockResolvedValueOnce('timeout')
      renderView({ start: { kind: 'publishing' } })

      expect(await screen.findByText(/The voting process is still being published/)).toBeInTheDocument()
    })
  })

  describe('an open top-up that refused the publish', () => {
    it('offers to resume the payment or to cancel it', async () => {
      renderView({ start: { kind: 'conflict' } })

      expect(await screen.findByRole('button', { name: 'Resume payment' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel the open payment' })).toBeInTheDocument()
      expect(api.checkout).not.toHaveBeenCalled()
    })

    it('resumes the open session when asked to', async () => {
      const user = userEvent.setup()
      renderView({ start: { kind: 'conflict' } })

      await user.click(await screen.findByRole('button', { name: 'Resume payment' }))

      expect(api.checkout).toHaveBeenCalledTimes(1)
      expect(await payButton()).toBeInTheDocument()
    })

    it('cancels the open payment, then publishes again from the wallet', async () => {
      const user = userEvent.setup()
      const { onPublished } = renderView({ start: { kind: 'conflict' } })

      await user.click(await screen.findByRole('button', { name: 'Cancel the open payment' }))

      await waitFor(() => expect(api.cancel).toHaveBeenCalledTimes(1))
      expect(api.publish).toHaveBeenCalledWith(processId)
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForPublication).not.toHaveBeenCalled()
    })

    it('publishes from the wallet when there is no open payment left to cancel', async () => {
      const user = userEvent.setup()
      api.cancel.mockRejectedValue(apiError(404))
      const { onPublished } = renderView({ start: { kind: 'conflict' } })

      await user.click(await screen.findByRole('button', { name: 'Cancel the open payment' }))

      await waitFor(() => expect(api.publish).toHaveBeenCalledWith(processId))
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    })
  })

  describe('refusals of the checkout', () => {
    it('publishes once from the wallet when the wallet now covers the price (400)', async () => {
      api.checkout.mockRejectedValue(
        new BadRequestApiError({ error: 'already covered' }, new Response(null, { status: 400 }))
      )
      const { onPublished } = renderView()

      await waitFor(() => expect(api.publish).toHaveBeenCalledWith(processId))
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.waitForPublication).not.toHaveBeenCalled()
    })

    it('shows the refusal, rather than reopening the checkout, when the wallet publish is refused again', async () => {
      api.checkout.mockRejectedValue(
        new BadRequestApiError({ error: 'already covered' }, new Response(null, { status: 400 }))
      )
      api.publish.mockRejectedValue(
        apiError(402, ErrorCode.PaymentRequired, { lines: [], totalCents: 1000, balanceCents: 0, shortfallCents: 1000 })
      )
      renderView()

      expect(await screen.findByText(/needs €10 more/)).toBeInTheDocument()
      expect(api.publish).toHaveBeenCalledTimes(1)
      expect(api.checkout).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('button', { name: /and publish/ })).not.toBeInTheDocument()
    })

    it('reads the payment on a 409 (40177): paid publishes, a completed one waits, anything else is an error', async () => {
      const conflict = apiError(409, ErrorCode.PaymentSessionConflict)
      api.checkout.mockRejectedValue(conflict)
      api.getCheckout.mockResolvedValue({ status: 'paid', amountCents: 1000, currency: 'eur' })
      const { onPublished } = renderView()

      await waitFor(() => expect(api.publish).toHaveBeenCalledWith(processId))
      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    })

    it('ends in the error step, after one publish, when the publish of a paid payment is refused (40178)', async () => {
      api.checkout.mockRejectedValue(apiError(409, ErrorCode.PaymentSessionConflict))
      api.getCheckout.mockResolvedValue({ status: 'paid', amountCents: 1000, currency: 'eur' })
      api.publish.mockRejectedValue(
        apiError(402, ErrorCode.PaymentRequired, { lines: [], totalCents: 1000, balanceCents: 0, shortfallCents: 1000 })
      )
      renderView()

      expect(await screen.findByText(/needs €10 more/)).toBeInTheDocument()
      expect(api.publish).toHaveBeenCalledTimes(1)
      expect(api.checkout).toHaveBeenCalledTimes(1)
    })

    it('waits for the outcome of a completed payment on a 409 (40177), without charging again', async () => {
      api.waitForPublication.mockReturnValue(new Promise(() => undefined))
      api.checkout.mockRejectedValue(apiError(409, ErrorCode.PaymentSessionConflict))
      api.getCheckout.mockResolvedValue({
        status: 'pending',
        amountCents: 1000,
        currency: 'eur',
        sessionStatus: 'complete',
        sessionPaymentStatus: 'paid',
      })
      renderView()

      expect(await screen.findByText('Payment received. Publishing your voting process…')).toBeInTheDocument()
      expect(api.publish).not.toHaveBeenCalled()
    })

    it('shows the backend message when a 409 leaves nothing to wait for', async () => {
      api.checkout.mockRejectedValue(apiError(409, ErrorCode.PaymentSessionConflict))
      api.getCheckout.mockRejectedValue(apiError(404))
      renderView()

      expect(await screen.findByText(/cannot be published right now/)).toBeInTheDocument()
    })

    it('explains a refusal only a custom quote can settle (422 / 40176)', async () => {
      api.checkout.mockRejectedValue(apiError(422, ErrorCode.QuoteRequired))
      renderView()

      expect(
        await screen.findByText(
          'Voting processes with more than 50,000 voters need a custom quote. Contact us to publish this one.'
        )
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /and publish/ })).not.toBeInTheDocument()
    })
  })

  it('goes back to the form from the back button', async () => {
    const user = userEvent.setup()
    const { onClose } = renderView()

    await user.click(await screen.findByRole('button', { name: 'Back' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
