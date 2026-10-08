import userEvent from '@testing-library/user-event'
import { VocdoniApiError } from '@vocdoni/api-client'
import { ApiError, ErrorCode } from '~components/Auth/api'
import type { ProcessCheckoutStatus } from '~queries/process-checkout'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { ProcessCheckoutDialog, ProcessCheckoutStart } from './ProcessCheckout'

const processId = '6650f0c0c0c0c0c0c0c0c0c0'
const checkoutPath = `processes/${processId}/checkout`
const pricePath = `processes/${processId}/price`

const bearedFetch = vi.fn()
const publishAndWait = vi.fn()
const confirm = vi.fn()
let canConfirm = true
let taxReady = false

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { publishAndWait } } }),
}))

vi.mock('./stripe', () => ({
  useStripePromise: () => Promise.resolve({}),
  useCheckoutElementsOptions: () => ({}),
}))

// Stripe's elements are iframes it renders itself; the session they belong to is what matters here
vi.mock('@stripe/react-stripe-js/checkout', () => ({
  CheckoutProvider: ({ children }: { children: React.ReactNode }) => children,
  BillingAddressElement: () => null,
  TaxIdElement: () => null,
  PaymentElement: () => null,
  useCheckout: () => ({
    type: 'success',
    checkout: {
      canConfirm,
      confirm,
      tax: { status: taxReady ? 'ready' : 'requires_billing_address' },
      lineItems: [
        { id: 'li_1', name: 'voting process (700 eligible voters)', subtotal: { amount: '€290.00' } },
        { id: 'li_2', name: 'email 2FA', subtotal: { amount: '€7.00' } },
      ],
      total: {
        subtotal: { amount: '€297.00' },
        taxExclusive: { amount: '€62.37' },
        total: { amount: taxReady ? '€359.37' : '€297.00' },
      },
    },
  }),
}))

const status = (overrides: Partial<ProcessCheckoutStatus> = {}): ProcessCheckoutStatus => ({
  status: 'pending',
  amountCents: 29700,
  currency: 'eur',
  ...overrides,
})

// Routes the app's requests: the checkout session, its status, and the draft's price
const backend = ({
  open = () => Promise.resolve({ clientSecret: 'cs_secret', sessionId: 'cs_1', amountCents: 29700, currency: 'eur' }),
  statuses = [status({ status: 'paid' })],
}: {
  open?: () => Promise<unknown>
  statuses?: ProcessCheckoutStatus[]
} = {}) => {
  bearedFetch.mockImplementation((path: string, params?: { method?: string }) => {
    if (path === checkoutPath && params?.method === 'POST') return open()
    if (path === checkoutPath) return Promise.resolve(statuses.length > 1 ? statuses.shift() : statuses[0])
    if (path === pricePath) {
      return Promise.resolve({
        lines: [
          { kind: 'base', description: 'voting process (700 eligible voters)', amountCents: 29000 },
          { kind: 'emailTwoFA', description: 'email 2FA', amountCents: 700 },
        ],
        totalCents: 29700,
        currency: 'eur',
        quoteRecommended: false,
        quoteRequired: false,
      })
    }
    return Promise.reject(new Error(`unexpected request ${path}`))
  })
}

const openedSessions = () =>
  bearedFetch.mock.calls.filter(([path, params]) => path === checkoutPath && params?.method === 'POST')

const renderDialog = (start: ProcessCheckoutStart = 'checkout') => {
  const onPublished = vi.fn()
  const onClose = vi.fn()
  render(<ProcessCheckoutDialog processId={processId} start={start} onClose={onClose} onPublished={onPublished} />, {
    wrapper: ({ children }) => <TestMemoryRouter>{children}</TestMemoryRouter>,
  })
  return { onPublished, onClose }
}

describe('ProcessCheckoutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canConfirm = true
    taxReady = false
    confirm.mockResolvedValue({ type: 'success' })
    publishAndWait.mockResolvedValue({ address: '0xabc', status: 'READY' })
  })

  it('summarises the one-time purchase, with VAT pending until the billing address is in', async () => {
    backend()
    renderDialog()

    expect(await screen.findByText('Order summary')).toBeInTheDocument()
    expect(screen.getByText('One-time payment for this voting process')).toBeInTheDocument()
    // The session's lines are the backend's English descriptions, translated through the price
    expect(await screen.findByText('Voting process')).toBeInTheDocument()
    expect(screen.getByText('Email verification code')).toBeInTheDocument()
    expect(screen.getByText('Calculated from your billing address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay €297.00 and publish' })).toBeInTheDocument()
    expect(openedSessions()).toHaveLength(1)
    expect(openedSessions()[0][1]).toMatchObject({ method: 'POST', body: { locale: 'en' } })
  })

  it('shows the VAT Stripe calculated and charges the total with it', async () => {
    taxReady = true
    backend()
    renderDialog()

    expect(await screen.findByText('€62.37')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay €359.37 and publish' })).toBeInTheDocument()
  })

  it('publishes once the backend confirms the payment', async () => {
    // How long it waits for the backend to settle is waitForPaymentOutcome's, tested on its own
    backend({ statuses: [status({ status: 'paid' })] })
    const { onPublished } = renderDialog()

    await userEvent.click(await screen.findByRole('button', { name: /Pay .* and publish/ }))

    await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ redirect: 'if_required' }))
    // Back to this draft in the wizard, to wait for the payment, when a payment method leaves the page
    const { returnUrl } = confirm.mock.calls[0][0]
    expect(new URL(returnUrl).searchParams.get('draftId')).toBe(processId)
    expect(new URL(returnUrl).searchParams.get('checkout')).toBe('return')
    expect(publishAndWait).toHaveBeenCalledWith(processId)
  })

  it('keeps the form when Stripe refuses the payment, and asks the backend nothing', async () => {
    backend()
    confirm.mockResolvedValue({ type: 'error', error: { message: 'Your card was declined.' } })
    const { onPublished } = renderDialog()

    await userEvent.click(await screen.findByRole('button', { name: /Pay .* and publish/ }))

    expect(await screen.findByText('Your card was declined.')).toBeInTheDocument()
    expect(bearedFetch.mock.calls.some(([path, params]) => path === checkoutPath && !params)).toBe(false)
    expect(onPublished).not.toHaveBeenCalled()
  })

  it('offers to pay again with a new session after a failed payment', async () => {
    backend({ statuses: [status({ status: 'failed' })] })
    renderDialog()

    await userEvent.click(await screen.findByRole('button', { name: /Pay .* and publish/ }))
    expect(await screen.findByText(/The payment did not go through/)).toBeInTheDocument()
    expect(publishAndWait).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Try paying again' }))

    expect(await screen.findByRole('button', { name: /Pay .* and publish/ })).toBeInTheDocument()
    expect(openedSessions()).toHaveLength(2)
  })

  it('waits for a processing payment without offering a new one', async () => {
    backend({ statuses: [status({ status: 'processing' })] })
    renderDialog()

    await userEvent.click(await screen.findByRole('button', { name: /Pay .* and publish/ }))

    expect(await screen.findByText(/Your payment is being processed/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pay/ })).not.toBeInTheDocument()
    expect(publishAndWait).not.toHaveBeenCalled()
  })

  it('waits for the payment already under way instead of charging again', async () => {
    backend({
      open: () =>
        Promise.reject(new ApiError({ error: 'payment already processing', code: ErrorCode.PaymentSessionConflict })),
      statuses: [status({ status: 'processing' })],
    })
    renderDialog()

    expect(await screen.findByText(/Your payment is being processed/)).toBeInTheDocument()
    expect(openedSessions()).toHaveLength(1)
  })

  it('returning from a payment that left the page only waits for its outcome', async () => {
    backend({ statuses: [status({ status: 'paid' })] })
    const { onPublished } = renderDialog('confirming')

    await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    expect(openedSessions()).toHaveLength(0)
  })

  it('explains that only a custom quote can publish a process above the self-service limit', async () => {
    backend({
      open: () => Promise.reject(new ApiError({ error: 'quote required', code: ErrorCode.QuoteRequired })),
    })
    renderDialog()

    expect(await screen.findByText(/need a custom quote/)).toBeInTheDocument()
  })

  it('lets a paid process that failed to publish be published again, for free', async () => {
    backend({ statuses: [status({ status: 'paid' })] })
    publishAndWait.mockRejectedValueOnce(new VocdoniApiError(500, {}, 'the tx queue is full', 50001))
    const { onPublished } = renderDialog('confirming')

    expect(await screen.findByText(/Your payment went through/)).toBeInTheDocument()
    expect(screen.getByText('the tx queue is full')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    expect(publishAndWait).toHaveBeenCalledTimes(2)
    expect(openedSessions()).toHaveLength(0)
  })
})
