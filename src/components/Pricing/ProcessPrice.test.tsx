import { act } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessPriceResponse } from '@vocdoni/api-types'
import { ErrorCode } from '~components/Auth/api'
import { QueryKeys } from '~queries/keys'
import { Routes } from '~src/router/routes'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { ProcessPriceBreakdown, ProcessQuoteAlert } from './ProcessPrice'

const getPrice = vi.fn()
const walletQuery = vi.fn()
const processId = '6650f0c0c0c0c0c0c0c0c0c0'

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  // The test render mounts the real ApiClientProvider, so only useApiClient is stubbed
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { getPrice } } }),
}))

vi.mock('~queries/wallet', () => ({
  useWallet: () => walletQuery(),
}))

const price = (overrides: Partial<ProcessPriceResponse> = {}): ProcessPriceResponse => ({
  lines: [
    { kind: 'base', description: 'voting process (700 eligible voters)', amountCents: 29000 },
    { kind: 'emailTwoFA', description: 'email 2FA', amountCents: 700 },
  ],
  totalCents: 29700,
  currency: 'eur',
  quoteRecommended: false,
  quoteRequired: false,
  ...overrides,
})

const unpriceableDraft = () =>
  new VocdoniApiError(
    400,
    { error: 'census size must be between 1 and 10000000', code: ErrorCode.MalformedJSONBody },
    'census size must be between 1 and 10000000',
    ErrorCode.MalformedJSONBody
  )

const wallet = (balanceCents: number) => ({ data: { balanceCents, currency: 'eur' } })

const renderWithRouter = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <TestMemoryRouter>{children}</TestMemoryRouter> })

describe('ProcessPriceBreakdown', () => {
  beforeEach(() => {
    getPrice.mockReset()
    walletQuery.mockReturnValue({ data: undefined })
  })

  it("lists the backend's price of the draft, VAT excluded", async () => {
    getPrice.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('Voting process')).toBeInTheDocument()
    expect(getPrice).toHaveBeenCalledWith(processId)
    expect(screen.getByText('€290')).toBeInTheDocument()
    expect(screen.getByText('Email verification code')).toBeInTheDocument()
    expect(screen.getByText('€7')).toBeInTheDocument()
    expect(screen.getByText('€297')).toBeInTheDocument()
    expect(screen.getByText(/Prices exclude VAT, which is added when you top up your wallet/)).toBeInTheDocument()
  })

  it('labels the minimum charge that raises a sub-euro total to one euro', async () => {
    getPrice.mockResolvedValue(
      price({ lines: [{ kind: 'minimumCharge', description: 'minimum charge', amountCents: 100 }], totalCents: 100 })
    )

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('Minimum charge')).toBeInTheDocument()
    expect(screen.getAllByText('€1')).toHaveLength(2)
  })

  it('never calls a quote-only price free, nor offers the wallet for it', async () => {
    walletQuery.mockReturnValue(wallet(50_000))
    getPrice.mockResolvedValue(price({ lines: [], totalCents: 0, quoteRecommended: true, quoteRequired: true }))

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText(/set by a custom quote/)).toBeInTheDocument()
    expect(screen.queryByText(/publishes without payment/)).not.toBeInTheDocument()
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText(/Your wallet/)).not.toBeInTheDocument()
  })

  it('says the wallet balance covers a price it can pay', async () => {
    walletQuery.mockReturnValue(wallet(50_000))
    getPrice.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(
      await screen.findByText('Your wallet balance (€500) covers this total: publishing pays it from your wallet.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Top up wallet' })).not.toBeInTheDocument()
  })

  it('names the shortfall and links to the wallet when the balance does not cover the price', async () => {
    walletQuery.mockReturnValue(wallet(10_000))
    getPrice.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('Your wallet has €100, €197 short of this total.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Top up wallet' })).toHaveAttribute(
      'href',
      Routes.dashboard.settings.wallet
    )
  })

  it('says a paid process costs nothing more, and offers no wallet line', async () => {
    walletQuery.mockReturnValue(wallet(0))
    getPrice.mockResolvedValue(price({ paymentStatus: 'paid' }))

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText(/Paid: publishing this voting process costs nothing more/)).toBeInTheDocument()
    expect(screen.getByText('€297')).toBeInTheDocument()
    expect(screen.queryByText(/Your wallet/)).not.toBeInTheDocument()
  })

  it('says a top-up checkout is open, and offers no wallet line', async () => {
    walletQuery.mockReturnValue(wallet(0))
    getPrice.mockResolvedValue(price({ paymentStatus: 'pending' }))

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('A wallet top-up checkout is open for this draft.')).toBeInTheDocument()
    expect(screen.queryByText(/Your wallet/)).not.toBeInTheDocument()
  })

  it("falls back to the backend's description for a line kind it does not know", async () => {
    getPrice.mockResolvedValue(
      price({ lines: [{ kind: 'liveStreaming', description: 'live streaming', amountCents: 1000 }], totalCents: 1000 })
    )

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('live streaming')).toBeInTheDocument()
  })

  it('says a free process publishes without payment', async () => {
    getPrice.mockResolvedValue(
      price({ lines: [{ kind: 'base', description: 'voting process', amountCents: 0 }], totalCents: 0 })
    )

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText(/publishes without payment/)).toBeInTheDocument()
    expect(screen.queryByText(/exclude VAT/)).not.toBeInTheDocument()
  })

  it('explains when the price shows up before the draft is saved', () => {
    renderWithRouter(<ProcessPriceBreakdown processId={null} />)

    expect(screen.getByText(/price shows up here once the draft is saved/)).toBeInTheDocument()
    expect(getPrice).not.toHaveBeenCalled()
  })

  it('shows the same hint when the backend cannot price the draft yet, without retrying', async () => {
    getPrice.mockRejectedValue(unpriceableDraft())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText(/price shows up here once the draft is saved/)).toBeInTheDocument()
    expect(getPrice).toHaveBeenCalledTimes(1)
  })
})

describe('ProcessPriceBreakdown failures', () => {
  beforeEach(() => {
    getPrice.mockReset()
    walletQuery.mockReturnValue({ data: undefined })
  })

  it('shows no wallet line while the balance cannot be read, such as a managed organization', async () => {
    walletQuery.mockReturnValue({ data: undefined, isError: true })
    getPrice.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('€297')).toBeInTheDocument()
    expect(screen.queryByText(/Your wallet/)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Top up wallet' })).not.toBeInTheDocument()
  })

  it('says the price could not be loaded on any other error, and lets the user retry', async () => {
    getPrice.mockRejectedValueOnce(new VocdoniApiError(500, { error: 'boom' }, 'boom'))
    getPrice.mockResolvedValueOnce(price())

    renderWithRouter(<ProcessPriceBreakdown processId={processId} />)

    expect(await screen.findByText('The price could not be loaded.')).toBeInTheDocument()
    expect(screen.queryByText(/once the draft is saved/)).not.toBeInTheDocument()
    act(() => screen.getByRole('button', { name: 'Try again' }).click())
    expect(await screen.findByText('€297')).toBeInTheDocument()
  })

  it('drops a price the backend no longer stands by when re-reading it fails', async () => {
    getPrice.mockResolvedValueOnce(price({ quoteRecommended: true }))
    getPrice.mockRejectedValueOnce(unpriceableDraft())

    const { queryClient } = renderWithRouter(
      <>
        <ProcessPriceBreakdown processId={processId} />
        <ProcessQuoteAlert processId={processId} />
      </>
    )

    expect(await screen.findByText('€297')).toBeInTheDocument()
    expect(screen.getByText(/we recommend a custom quote/)).toBeInTheDocument()
    await act(() => queryClient.invalidateQueries({ queryKey: QueryKeys.process.price(processId) }))

    expect(await screen.findByText(/once the draft is saved/)).toBeInTheDocument()
    expect(screen.queryByText('€297')).not.toBeInTheDocument()
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it.each(['..', '.', 'x/../../users/me?', 'abc'])('never requests a price for the draft id %j', (id) => {
    renderWithRouter(<ProcessPriceBreakdown processId={id} />)

    expect(getPrice).not.toHaveBeenCalled()
    expect(screen.getByText(/price shows up here once the draft is saved/)).toBeInTheDocument()
  })
})

describe('ProcessQuoteAlert', () => {
  beforeEach(() => {
    getPrice.mockReset()
  })

  it('keeps a quote-only process blocked after a payment, which the backend refuses too', async () => {
    getPrice.mockResolvedValue(price({ quoteRecommended: true, quoteRequired: true, paymentStatus: 'paid' }))

    renderWithRouter(<ProcessQuoteAlert processId={processId} />)

    expect(
      await screen.findByText(/more than 50,000 voters can only be published with a custom quote/)
    ).toBeInTheDocument()
  })

  it('asks nothing more of a paid process that is only recommended a quote', async () => {
    getPrice.mockResolvedValue(price({ quoteRecommended: true, paymentStatus: 'paid' }))

    renderWithRouter(<ProcessQuoteAlert processId={processId} />)

    await waitFor(() => expect(getPrice).toHaveBeenCalled())
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it('renders nothing below the custom-quote thresholds', async () => {
    getPrice.mockResolvedValue(price())

    renderWithRouter(<ProcessQuoteAlert processId={processId} />)

    await waitFor(() => expect(getPrice).toHaveBeenCalled())
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it('recommends a custom quote above 15,000 voters, without blocking publication', async () => {
    getPrice.mockResolvedValue(price({ quoteRecommended: true }))

    renderWithRouter(<ProcessQuoteAlert processId={processId} />)

    expect(await screen.findByText(/more than 15,000 voters we recommend a custom quote/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
      'href',
      Routes.dashboard.settings.support
    )
  })

  it('only offers a custom quote above 50,000 voters', async () => {
    getPrice.mockResolvedValue(price({ quoteRecommended: true, quoteRequired: true }))

    renderWithRouter(<ProcessQuoteAlert processId={processId} />)

    expect(
      await screen.findByText(/more than 50,000 voters can only be published with a custom quote/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/we recommend a custom quote/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
      'href',
      Routes.dashboard.settings.support
    )
  })
})
