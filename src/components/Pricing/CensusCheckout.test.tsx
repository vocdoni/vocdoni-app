import userEvent from '@testing-library/user-event'
import { ApiError, ErrorCode } from '~components/Auth/api'
import { createTestQueryClient, render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { CensusCheckout, type CensusCheckoutProps } from './CensusCheckout'

const checkoutState = vi.hoisted(() => ({ current: {} as any }))
const stripePromise = vi.hoisted(() => ({ current: Promise.resolve({}) as Promise<any> | null }))
const mutateAsync = vi.hoisted(() => vi.fn())
const readHistory = vi.hoisted(() => vi.fn())
const waitForCensusPayment = vi.hoisted(() => vi.fn())
const access = vi.hoisted(() => ({ canTopUp: true }))

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

vi.mock('~queries/census-checkout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/census-checkout')>()),
  useCensusCheckout: () => ({ mutateAsync }),
  useReadWalletHistory: () => readHistory,
  waitForCensusPayment: (...args: unknown[]) => waitForCensusPayment(...args),
}))

vi.mock('~queries/wallet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/wallet')>()),
  useWallet: () => ({ data: { balanceCents: 1234, currency: 'eur', history: [] } }),
  useWalletAccess: () => ({ canView: true, canTopUp: access.canTopUp }),
}))

const processId = '6650f0c0c0c0c0c0c0c0c0c0'
const PENDING_KEY = 'census-checkout-pending'

const readyCheckout = (confirm = vi.fn().mockResolvedValue({ type: 'success' })) => ({
  type: 'success',
  checkout: {
    confirm,
    total: {
      taxExclusive: { amount: '€2.00', minorUnitsAmount: 200 },
      total: { amount: '€2.42', minorUnitsAmount: 242 },
    },
  },
})

const renderCheckout = (props: Partial<CensusCheckoutProps> = {}, search = '', queryClient = createTestQueryClient()) =>
  render(
    <TestMemoryRouter initialEntries={[`/admin/process/${processId}/census/checkout${search}`]}>
      <CensusCheckout processId={processId} censusSize={1200} dueCents={500} shortfallCents={300} {...props} />
    </TestMemoryRouter>,
    { queryClient }
  )

const buyButton = () => screen.getByRole('button', { name: 'Add voter places' })

describe('CensusCheckout', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    readHistory.mockReset().mockResolvedValue([])
    waitForCensusPayment.mockReset()
    checkoutState.current = readyCheckout()
    stripePromise.current = Promise.resolve({})
    access.canTopUp = true
    sessionStorage.clear()
  })

  it('states what is bought, at what price, against the wallet', () => {
    renderCheckout()

    expect(screen.getByText('Places for 1,200 voters, at €5 more (VAT excluded).')).toBeInTheDocument()
    expect(screen.getByText('Your wallet has €12.34.')).toBeInTheDocument()
    expect(screen.getByText('Your wallet is €3 short.')).toBeInTheDocument()
  })

  it('reports the places as added when the wallet covers it, with no payment to make', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValue({ amountCents: 500, currency: 'eur' })
    renderCheckout()

    await user.click(buyButton())

    expect(
      await screen.findByText('Voter places added: €5 was charged from your wallet. Try adding the members again.')
    ).toBeInTheDocument()
    expect(mutateAsync).toHaveBeenCalledWith({ processId, censusSize: 1200, locale: 'en' })
    expect(screen.queryByText('payment-element')).not.toBeInTheDocument()
    expect(waitForCensusPayment).not.toHaveBeenCalled()
  })

  it('opens the embedded checkout when the wallet falls short, then reports success once the debit is seen', async () => {
    const user = userEvent.setup()
    const confirm = vi.fn().mockResolvedValue({ type: 'success' })
    checkoutState.current = readyCheckout(confirm)
    mutateAsync.mockResolvedValue({
      clientSecret: 'cs_test',
      sessionId: 'cs_session',
      amountCents: 300,
      currency: 'eur',
    })
    readHistory.mockResolvedValue([])
    waitForCensusPayment.mockResolvedValue({
      status: 'paid',
      entry: { id: 'p1', kind: 'payment', processId, amountCents: -300, orgAddress: '0x1234', createdAt: '' },
    })
    renderCheckout()

    await user.click(buyButton())
    await user.click(await screen.findByRole('button', { name: 'Pay €2.42' }))

    await waitFor(() =>
      expect(
        screen.getByText('Voter places added: €3 was charged from your wallet. Try adding the members again.')
      ).toBeInTheDocument()
    )
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        redirect: 'if_required',
        returnUrl: expect.stringContaining('checkout=return'),
      })
    )
    // The snapshot is taken before the payment and the wait looks for a debit that is not in it
    expect(waitForCensusPayment).toHaveBeenCalledWith(expect.any(Function), processId, [], expect.any(Object))
  })

  it('says the payment is confirmed, not that the places are there, when the debit does not show in time', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValue({
      clientSecret: 'cs_test',
      sessionId: 'cs_session',
      amountCents: 300,
      currency: 'eur',
    })
    waitForCensusPayment.mockResolvedValue({ status: 'timeout' })
    renderCheckout()

    await user.click(buyButton())
    await user.click(await screen.findByRole('button', { name: 'Pay €2.42' }))

    expect(
      await screen.findByText(
        'Your payment is confirmed; the places are added as soon as it is processed. Try adding the members again in a moment.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/Voter places added/)).not.toBeInTheDocument()
  })

  it('stays neutral after a redirect return with a snapshot that times out', async () => {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ processId, knownIds: ['old'] }))
    waitForCensusPayment.mockResolvedValue({ status: 'timeout' })
    renderCheckout({}, '?checkout=return')

    expect(
      await screen.findByText(
        'We are still waiting for the places to be added. Try adding the members again in a moment.'
      )
    ).toBeInTheDocument()
    expect(waitForCensusPayment).toHaveBeenCalledWith(expect.any(Function), processId, ['old'], expect.any(Object))
    expect(screen.queryByText(/Voter places added/)).not.toBeInTheDocument()
    expect(screen.queryByText(/payment is confirmed/)).not.toBeInTheDocument()
  })

  it('reports the debit after a redirect return when it is seen', async () => {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ processId, knownIds: [] }))
    waitForCensusPayment.mockResolvedValue({
      status: 'paid',
      entry: { id: 'p1', kind: 'payment', processId, amountCents: -300, orgAddress: '0x1234', createdAt: '' },
    })
    renderCheckout({}, '?checkout=return')

    expect(
      await screen.findByText('Voter places added: €3 was charged from your wallet. Try adding the members again.')
    ).toBeInTheDocument()
    expect(sessionStorage.getItem(PENDING_KEY)).toBeNull()
  })

  it('never claims success after a redirect return without a snapshot', async () => {
    renderCheckout({}, '?checkout=return')

    expect(
      await screen.findByText(
        'We are still waiting for the places to be added. Try adding the members again in a moment.'
      )
    ).toBeInTheDocument()
    expect(waitForCensusPayment).not.toHaveBeenCalled()
    expect(screen.queryByText(/Voter places added/)).not.toBeInTheDocument()
  })

  it('tells a non-admin that only admins can buy, with no button', () => {
    access.canTopUp = false
    renderCheckout()

    expect(screen.getByText('Only admins can add voter places.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add voter places' })).not.toBeInTheDocument()
  })

  it('shows the census growth message for a refusal of the wallet, and keeps the button for a retry', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValue(
      new ApiError(
        { error: 'raw backend message', code: ErrorCode.InsufficientWalletBalance },
        new Response(null, { status: 402 })
      )
    )
    renderCheckout()

    await user.click(buyButton())

    expect(
      await screen.findByText(
        'The integrator wallet does not cover the cost of adding these members to a voting process. The integrator managing this organization must top up its wallet first.'
      )
    ).toBeInTheDocument()
    expect(buyButton()).toBeEnabled()
  })

  it('shows the backend message for a refusal with no copy of its own', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValue(
      new ApiError({ error: 'nothing left to buy', code: 400 }, new Response(null, { status: 400 }))
    )
    renderCheckout()

    await user.click(buyButton())

    expect(await screen.findByText('nothing left to buy')).toBeInTheDocument()
  })

  it('asks for the number of voters when the link does not carry one', () => {
    renderCheckout({ censusSize: undefined })

    expect(screen.getByText(/needs the number of voters/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add voter places' })).not.toBeInTheDocument()
  })
  it('keeps the purchase closed when the ledger cannot be read after the payment', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValue({
      clientSecret: 'cs_test',
      sessionId: 'cs_session',
      amountCents: 300,
      currency: 'eur',
    })
    waitForCensusPayment.mockRejectedValue(
      new ApiError({ error: 'ledger unavailable' }, new Response(null, { status: 403 }))
    )
    renderCheckout()

    await user.click(buyButton())
    await user.click(await screen.findByRole('button', { name: 'Pay €2.42' }))

    expect(await screen.findByText('ledger unavailable')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your payment is confirmed; the places are added as soon as it is processed. Try adding the members again in a moment.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add voter places' })).not.toBeInTheDocument()
  })

  it('reads the wallet again once the places are bought, when the wallet covers them', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    mutateAsync.mockResolvedValue({ amountCents: 500, currency: 'eur' })
    renderCheckout({}, '', queryClient)

    await user.click(buyButton())

    await screen.findByText('Voter places added: €5 was charged from your wallet. Try adding the members again.')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['organizations', 'wallet'] })
  })
})
