import { act } from '@testing-library/react'
import { ApiError, BadRequestApiError } from '~components/Auth/api'
import { QueryKeys } from '~queries/keys'
import type { ProcessPrice } from '~queries/process-price'
import { Routes } from '~src/router/routes'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { ProcessPriceBreakdown, ProcessQuoteAlert } from './ProcessPrice'

const bearedFetch = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

const price = (overrides: Partial<ProcessPrice> = {}): ProcessPrice => ({
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

const renderWithRouter = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <TestMemoryRouter>{children}</TestMemoryRouter> })

describe('ProcessPriceBreakdown', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
  })

  it("lists the backend's price of the draft, VAT excluded", async () => {
    bearedFetch.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId='draft-1' />)

    expect(await screen.findByText('Voting process')).toBeInTheDocument()
    expect(bearedFetch).toHaveBeenCalledWith('processes/draft-1/price')
    expect(screen.getByText('€290')).toBeInTheDocument()
    expect(screen.getByText('Email verification code')).toBeInTheDocument()
    expect(screen.getByText('€7')).toBeInTheDocument()
    expect(screen.getByText('€297')).toBeInTheDocument()
    expect(screen.getByText(/VAT excluded/)).toBeInTheDocument()
  })

  it("falls back to the backend's description for a line kind it does not know", async () => {
    bearedFetch.mockResolvedValue(
      price({ lines: [{ kind: 'liveStreaming', description: 'live streaming', amountCents: 1000 }], totalCents: 1000 })
    )

    renderWithRouter(<ProcessPriceBreakdown processId='draft-1' />)

    expect(await screen.findByText('live streaming')).toBeInTheDocument()
  })

  it('says a free process publishes without payment', async () => {
    bearedFetch.mockResolvedValue(
      price({ lines: [{ kind: 'base', description: 'voting process', amountCents: 0 }], totalCents: 0 })
    )

    renderWithRouter(<ProcessPriceBreakdown processId='draft-1' />)

    expect(await screen.findByText(/publishes without payment/)).toBeInTheDocument()
    expect(screen.queryByText(/VAT excluded/)).not.toBeInTheDocument()
  })

  it('explains when the price shows up before the draft is saved', () => {
    renderWithRouter(<ProcessPriceBreakdown processId={null} />)

    expect(screen.getByText(/price shows up here once the draft is saved/)).toBeInTheDocument()
    expect(bearedFetch).not.toHaveBeenCalled()
  })

  it('shows the same hint when the backend cannot price the draft yet, without retrying', async () => {
    bearedFetch.mockRejectedValue(new BadRequestApiError({ error: 'census size must be between 1 and 10000000' }))

    renderWithRouter(<ProcessPriceBreakdown processId='draft-1' />)

    expect(await screen.findByText(/price shows up here once the draft is saved/)).toBeInTheDocument()
    expect(bearedFetch).toHaveBeenCalledTimes(1)
  })
})

describe('ProcessPriceBreakdown failures', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
  })

  it('says the price could not be loaded on any other error, and lets the user retry', async () => {
    bearedFetch.mockRejectedValueOnce(new ApiError({ error: 'boom' }, new Response(null, { status: 500 })))
    bearedFetch.mockResolvedValueOnce(price())

    renderWithRouter(<ProcessPriceBreakdown processId='draft-1' />)

    expect(await screen.findByText('The price could not be loaded.')).toBeInTheDocument()
    expect(screen.queryByText(/once the draft is saved/)).not.toBeInTheDocument()
    act(() => screen.getByRole('button', { name: 'Try again' }).click())
    expect(await screen.findByText('€297')).toBeInTheDocument()
  })

  it('drops a price the backend no longer stands by when re-reading it fails', async () => {
    bearedFetch.mockResolvedValueOnce(price({ quoteRecommended: true, quoteRequired: true }))
    bearedFetch.mockRejectedValueOnce(new BadRequestApiError({ error: 'census size must be between 1 and 10000000' }))

    const { queryClient } = renderWithRouter(
      <>
        <ProcessPriceBreakdown processId='draft-1' />
        <ProcessQuoteAlert processId='draft-1' />
      </>
    )

    expect(await screen.findByText('€297')).toBeInTheDocument()
    expect(screen.getByText(/can only be published with a custom quote/)).toBeInTheDocument()
    await act(() => queryClient.invalidateQueries({ queryKey: QueryKeys.process.price('draft-1') }))

    expect(await screen.findByText(/once the draft is saved/)).toBeInTheDocument()
    expect(screen.queryByText('€297')).not.toBeInTheDocument()
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it('keeps the draft id from pointing the request at another endpoint', async () => {
    bearedFetch.mockResolvedValue(price())

    renderWithRouter(<ProcessPriceBreakdown processId='x/../../users/me?' />)

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledWith('processes/x%2F..%2F..%2Fusers%2Fme%3F/price'))
  })
})

describe('ProcessQuoteAlert', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
  })

  it('asks nothing of a process whose quote is already paid', async () => {
    bearedFetch.mockResolvedValue(price({ quoteRecommended: true, quoteRequired: true, paymentStatus: 'paid' }))

    renderWithRouter(<ProcessQuoteAlert processId='draft-1' />)

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it('renders nothing below the custom-quote thresholds', async () => {
    bearedFetch.mockResolvedValue(price())

    renderWithRouter(<ProcessQuoteAlert processId='draft-1' />)

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(screen.queryByText(/custom quote/)).not.toBeInTheDocument()
  })

  it('recommends a custom quote above 15,000 voters, without blocking publication', async () => {
    bearedFetch.mockResolvedValue(price({ quoteRecommended: true }))

    renderWithRouter(<ProcessQuoteAlert processId='draft-1' />)

    expect(await screen.findByText(/more than 15,000 voters we recommend a custom quote/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
      'href',
      Routes.dashboard.settings.support
    )
  })

  it('only offers a custom quote above 50,000 voters', async () => {
    bearedFetch.mockResolvedValue(price({ quoteRecommended: true, quoteRequired: true }))

    renderWithRouter(<ProcessQuoteAlert processId='draft-1' />)

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
