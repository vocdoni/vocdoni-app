import { ApiErrorCode, VocdoniApiError } from '@vocdoni/api-client'
import userEvent from '@testing-library/user-event'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { defaultProcessValues, type Process } from '../common'
import { PublishDialog, type PublishDialogProps } from './PublishDialog'

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const state = vi.hoisted(() => ({ wallet: undefined as unknown, walletError: undefined as unknown }))

const api = vi.hoisted(() => ({
  checkout: vi.fn(),
  getCheckout: vi.fn(),
  getPrice: vi.fn(),
  publish: vi.fn(),
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
        publish: (...args: unknown[]) => api.publish(...args),
        checkout: (...args: unknown[]) => api.checkout(...args),
        getCheckout: (...args: unknown[]) => api.getCheckout(...args),
        cancelCheckout: vi.fn(),
        getPrice: (...args: unknown[]) => api.getPrice(...args),
      },
      organizations: {
        getWallet: async () => {
          if (state.walletError) throw state.walletError
          return state.wallet
        },
      },
      jobs: { waitFor: (...args: unknown[]) => api.waitForJob(...args) },
    },
  }),
}))

vi.mock('@stripe/react-stripe-js/checkout', async () => {
  const React = await import('react')
  return {
    CheckoutElementsProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useCheckoutElements: () => ({
      type: 'success',
      checkout: {
        confirm: vi.fn(),
        total: {
          taxExclusive: { amount: '€1.26', minorUnitsAmount: 126 },
          total: { amount: '€7.26', minorUnitsAmount: 726 },
        },
      },
    }),
    BillingAddressElement: () => null,
    TaxIdElement: () => null,
    PaymentElement: () => null,
  }
})

vi.mock('~components/Pricing/stripe', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Pricing/stripe')>()),
  useStripePromise: () => Promise.resolve({}),
}))

const form: Process = {
  ...defaultProcessValues,
  title: 'General assembly',
  autoStart: true,
  endDate: '2026-03-12',
  endTime: '20:00',
  questions: [{ ...defaultProcessValues.questions[0], title: 'Approve the accounts?' }],
  census: { credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' },
}

const priced = (totalCents: number) => ({
  lines: [{ kind: 'base', description: 'base', amountCents: totalCents }],
  totalCents,
  currency: 'eur',
  quoteRecommended: false,
  quoteRequired: false,
})

const refusal = (status: number, code: number, data?: unknown) =>
  new VocdoniApiError(status, { error: 'refused', code, data }, 'refused', code, data)

const shortRefusal = refusal(402, ApiErrorCode.PaymentRequired, {
  lines: [],
  totalCents: 5000,
  balanceCents: 1000,
  shortfallCents: 4000,
})

const renderDialog = (props: Partial<PublishDialogProps> = {}) => {
  const handlers = { onPublished: vi.fn(), onClose: vi.fn() }
  render(
    <TestMemoryRouter>
      <button type='button'>outside</button>
      <PublishDialog processId={processId} form={form} start={{ kind: 'summary' }} canTopUp {...handlers} {...props} />
    </TestMemoryRouter>
  )
  return { ...handlers, user: userEvent.setup() }
}

// A primary waits for the price before it is enabled
const primary = async (name: string | RegExp) => {
  const button = await screen.findByRole('button', { name })
  await waitFor(() => expect(button).toBeEnabled())
  return button
}

describe('PublishDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.wallet = { balanceCents: 0, currency: 'eur', history: [], pagination: {} }
    state.walletError = undefined
    api.getPrice.mockResolvedValue(priced(0))
    api.checkout.mockResolvedValue({ clientSecret: 'cs', sessionId: 's', amountCents: 600, currency: 'eur' })
    api.publish.mockResolvedValue({ jobId: 'job-1' })
    api.waitForJob.mockResolvedValue({ jobId: 'job-1', status: 'completed' })
  })

  it('opens on the summary, named by its eyebrow and modal over the page', async () => {
    renderDialog()

    expect(await screen.findByRole('dialog', { name: 'Review before publishing' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'outside' })).not.toBeInTheDocument())
  })

  it('publishes a free vote once, however often it is clicked, and hands off when its job completes', async () => {
    const { user, onPublished } = renderDialog()

    const publish = await primary('Publish')
    await user.dblClick(publish)

    await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
    expect(api.publish).toHaveBeenCalledTimes(1)
    expect(api.waitForJob).toHaveBeenCalledWith('job-1', expect.anything())
    expect(api.checkout).not.toHaveBeenCalled()
  })

  it('closes from "Keep editing"', async () => {
    const { user, onClose } = renderDialog()

    await user.click(await screen.findByRole('button', { name: 'Keep editing' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('cannot be dismissed while the publish is under way', async () => {
    api.waitForJob.mockReturnValue(new Promise(() => undefined))
    const { user, onClose } = renderDialog()

    await user.click(await primary('Publish'))

    expect(await screen.findByText('Publishing your voting process…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  describe('when the wallet covers the price', () => {
    beforeEach(() => {
      api.getPrice.mockResolvedValue(priced(1000))
      state.wallet = { balanceCents: 5000, currency: 'eur', history: [], pagination: {} }
    })

    it('shows the wallet step, then publishes from the balance without a card', async () => {
      const { user, onPublished } = renderDialog()

      await user.click(await primary('Publish and pay €10'))

      expect(await screen.findByText('Pay €10 from the balance and the vote is published.')).toBeInTheDocument()
      expect(screen.getByText('After publishing, the balance will have €40 left.')).toBeInTheDocument()
      expect(
        screen.getByText("The organization's balance covers the whole cost. No card is needed.")
      ).toBeInTheDocument()
      expect(screen.getByText('Total to pay now').nextElementSibling).toHaveTextContent('€0')
      expect(api.publish).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Pay from the balance and publish' }))

      await waitFor(() => expect(onPublished).toHaveBeenCalledWith(processId))
      expect(api.publish).toHaveBeenCalledTimes(1)
      expect(api.checkout).not.toHaveBeenCalled()
    })

    it('goes back to the summary from the wallet step', async () => {
      const { user } = renderDialog()

      await user.click(await primary('Publish and pay €10'))
      const backs = await screen.findAllByRole('button', { name: 'Back to the summary' })
      await user.click(backs[0])

      expect(await screen.findByText('Review before publishing')).toBeInTheDocument()
    })
  })

  describe('when the wallet is short', () => {
    beforeEach(() => {
      api.getPrice.mockResolvedValue(priced(1000))
      state.wallet = { balanceCents: 400, currency: 'eur', history: [], pagination: {} }
    })

    it('opens the card step for what is short, and goes back to the summary from it', async () => {
      const { user } = renderDialog()

      await user.click(await primary('Add €6 and publish'))

      expect(await screen.findByRole('button', { name: 'Pay €7.26 and publish' })).toBeInTheDocument()
      expect(screen.getByText('Short').nextElementSibling).toHaveTextContent('€6')
      expect(screen.getByText('Organization balance').nextElementSibling).toHaveTextContent('-€4')
      expect(api.checkout).toHaveBeenCalledTimes(1)
      expect(api.publish).not.toHaveBeenCalled()

      const backs = screen.getAllByRole('button', { name: 'Back to the summary' })
      await user.click(backs.at(-1)!)

      expect(await screen.findByText('Review before publishing')).toBeInTheDocument()
    })

    it('lets the page around the card step take focus and pointer, for Stripe 3D Secure', async () => {
      const { user } = renderDialog()

      await user.click(await primary('Add €6 and publish'))
      await screen.findByRole('button', { name: 'Pay €7.26 and publish' })

      await waitFor(() => expect(screen.getByRole('button', { name: 'outside' })).toBeInTheDocument())
    })
  })

  describe('a refused publish', () => {
    beforeEach(() => {
      api.getPrice.mockResolvedValue(priced(5000))
      // Unreadable (as for a managed organization): the summary leaves it to the backend
      state.walletError = new VocdoniApiError(403, null, 'forbidden')
    })

    it('opens the card step with the refusal shortfall for who can top up', async () => {
      api.publish.mockRejectedValue(shortRefusal)
      const { user } = renderDialog()

      await user.click(await primary('Publish'))

      expect(await screen.findByRole('button', { name: 'Pay €7.26 and publish' })).toBeInTheDocument()
      expect(screen.getByText('Short').nextElementSibling).toHaveTextContent('€40')
      expect(screen.getByText('Organization balance').nextElementSibling).toHaveTextContent('-€10')
      expect(api.publish).toHaveBeenCalledTimes(1)
    })

    it('explains the shortfall to who cannot top up, with the way to the wallet and back to the summary', async () => {
      api.publish.mockRejectedValue(shortRefusal)
      const { user } = renderDialog({ canTopUp: false })

      await user.click(await primary('Publish'))

      expect(await screen.findByText(/needs €40 more/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Open wallet' })).toHaveAttribute('href', '/admin/settings/billing')
      expect(api.checkout).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Back to the summary' }))
      expect(await screen.findByText('Review before publishing')).toBeInTheDocument()
    })

    it('offers to resume or cancel an open top-up (40177)', async () => {
      api.publish.mockRejectedValue(refusal(409, ApiErrorCode.PaymentSessionConflict))
      const { user } = renderDialog()

      await user.click(await primary('Publish'))

      expect(await screen.findByRole('button', { name: 'Resume payment' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel the open payment' })).toBeInTheDocument()
    })
  })
})
