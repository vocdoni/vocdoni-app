import { useLocation } from 'react-router'
import { act, fireEvent, render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import type { Wallet, WalletEntry } from '~queries/wallet'
import WalletPanel from './Wallet'

const walletState = vi.hoisted(() => ({ current: {} as any }))
const walletAccess = vi.hoisted(() => ({ current: { canView: true, canTopUp: true } }))
const topUpAmount = vi.hoisted(() => ({ current: 5000 }))
const toast = vi.hoisted(() => vi.fn())

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => toast,
}))

vi.mock('~queries/wallet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/wallet')>()),
  useWallet: () => walletState.current,
  useWalletAccess: () => walletAccess.current,
  isManagedOrgWalletError: (error: unknown) => (error as { managed?: boolean } | null)?.managed === true,
}))

// The real checkout needs Stripe. The mock reports a payment the way WalletTopUp does: submitted (onStart),
// then confirmed (onDone) with the requested amount.
vi.mock('./TopUp', async () => {
  const React = await import('react')
  return {
    WalletTopUp: ({
      onStart,
      onDone,
      onCancel,
    }: {
      onStart?: (amountCents: number) => void
      onDone: (amountCents: number) => void
      onCancel: () => void
    }) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'button',
          {
            onClick: () => {
              onStart?.(topUpAmount.current)
              onDone(topUpAmount.current)
            },
          },
          'finish-topup'
        ),
        React.createElement('button', { onClick: onCancel }, 'cancel-topup')
      ),
  }
})

const entry = (overrides: Partial<WalletEntry>): WalletEntry => ({
  id: 'e1',
  orgAddress: '0x1234',
  amountCents: 1000,
  kind: 'topup',
  createdAt: '2026-10-01T10:00:00Z',
  ...overrides,
})

const pageOf = (history: WalletEntry[]): Wallet['pagination'] => ({
  currentPage: 1,
  lastPage: 1,
  nextPage: null,
  previousPage: null,
  totalItems: history.length,
})

const mockWallet = (data: Partial<Wallet> = {}, extra: Record<string, unknown> = {}) => {
  const history = data.history ?? []
  walletState.current = {
    isLoading: false,
    error: null,
    data: {
      balanceCents: 12345,
      currency: 'eur',
      history,
      pagination: pageOf(history),
      ...data,
    },
    ...extra,
  }
}

const LocationProbe = () => <div data-testid='location'>{useLocation().search}</div>

const panel = (props: { processLinks?: boolean } = {}, initialEntry = '/admin/settings/wallet') => (
  <TestMemoryRouter initialEntries={[initialEntry]}>
    <WalletPanel {...props} />
    <LocationProbe />
  </TestMemoryRouter>
)

const renderPanel = (props?: { processLinks?: boolean }, initialEntry?: string) => render(panel(props, initialEntry))

const PROCESSING = 'Payment received. Your balance updates as soon as it is confirmed.'
const TIMED_OUT =
  'This is taking longer than expected. Your balance updates once the payment is confirmed; check back later.'
const CHECKING = 'Checking your payment. Your balance updates as soon as Stripe confirms it.'
const REDIRECT_TIMED_OUT =
  'We could not confirm a top-up yet. If you paid, it will appear here shortly; if the payment did not go through, you can top up again.'
const TOPPED_UP = 'Your wallet was topped up'
const SNAPSHOT_KEY = 'wallet-topup-pending'

// Opens the inline top-up and reports a finished payment through the mocked WalletTopUp.
const finishTopUp = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Top up' }))
  fireEvent.click(await screen.findByRole('button', { name: 'finish-topup' }))
}

describe('WalletPanel', () => {
  beforeEach(() => {
    walletAccess.current = { canView: true, canTopUp: true }
    topUpAmount.current = 5000
    toast.mockClear()
    mockWallet()
  })

  it('shows the balance in the wallet currency', () => {
    renderPanel()

    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('€123.45')).toBeInTheDocument()
    expect(screen.getByText(/Prepaid credit, VAT excluded/)).toBeInTheDocument()
  })

  it('lists movements with their kind and signed amount', () => {
    mockWallet({
      history: [
        entry({ id: 'a', kind: 'topup', amountCents: 1000 }),
        entry({ id: 'b', kind: 'payment', amountCents: -575 }),
        entry({ id: 'c', kind: 'creditBack', amountCents: 2000 }),
        entry({ id: 'd', kind: 'refund', amountCents: -500 }),
      ],
    })

    renderPanel()

    expect(screen.getByText('Top-up')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Credit back')).toBeInTheDocument()
    expect(screen.getByText('Stripe refund')).toBeInTheDocument()
    expect(screen.getByText('+€10')).toBeInTheDocument()
    expect(screen.getByText('−€5.75')).toBeInTheDocument()
    expect(screen.getByText('+€20')).toBeInTheDocument()
    expect(screen.getByText('−€5')).toBeInTheDocument()
  })

  it('shows the raw kind for an unknown kind', () => {
    mockWallet({ history: [entry({ kind: 'adjustment' as WalletEntry['kind'] })] })

    renderPanel()

    expect(screen.getByText('adjustment')).toBeInTheDocument()
  })

  it('says there are no movements yet', () => {
    renderPanel()

    expect(screen.getByText('No movements yet.')).toBeInTheDocument()
  })

  it('warns when the balance is negative after a refund', () => {
    mockWallet({ balanceCents: -500 })

    renderPanel()

    expect(
      screen.getByText('Your balance is negative after a refund. Top up to pay for new voting processes.')
    ).toBeInTheDocument()
  })

  it('does not warn when the balance is not negative', () => {
    renderPanel()

    expect(screen.queryByText(/balance is negative/)).not.toBeInTheDocument()
  })

  it('explains that an integrator pays for a managed organization', () => {
    mockWallet({}, { error: { managed: true }, data: undefined })

    renderPanel()

    expect(
      screen.getByText("This organization's voting processes are paid by the integrator that manages it.")
    ).toBeInTheDocument()
  })

  it('shows the error message for any other failure', () => {
    mockWallet({}, { error: new Error('Network down'), data: undefined })

    renderPanel()

    expect(screen.getByText('Unable to load the wallet')).toBeInTheDocument()
    expect(screen.getByText('Network down')).toBeInTheDocument()
  })

  it('links process movements only when processLinks is set', () => {
    mockWallet({
      history: [entry({ kind: 'payment', amountCents: -100, processId: 'abcdef1234567890' })],
    })

    const { unmount } = renderPanel()

    expect(screen.getByText('abcdef12…7890')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    unmount()

    renderPanel({ processLinks: true })

    expect(screen.getByRole('link', { name: 'abcdef12…7890' })).toHaveAttribute(
      'href',
      '/admin/process/abcdef1234567890'
    )
  })

  describe('role gating', () => {
    it('offers the top-up to admins', () => {
      renderPanel()

      expect(screen.getByRole('button', { name: 'Top up' })).toBeInTheDocument()
      expect(screen.queryByText('Only admins can top up the wallet.')).not.toBeInTheDocument()
    })

    it('hides the top-up from managers and says why', () => {
      walletAccess.current = { canView: true, canTopUp: false }

      renderPanel()

      expect(screen.queryByRole('button', { name: 'Top up' })).not.toBeInTheDocument()
      expect(screen.getByText('Only admins can top up the wallet.')).toBeInTheDocument()
      expect(screen.getByText('€123.45')).toBeInTheDocument()
    })
  })

  describe('inline top-up', () => {
    it('shows the top-up in place of the balance instead of opening a dialog', async () => {
      renderPanel()

      fireEvent.click(screen.getByRole('button', { name: 'Top up' }))

      expect(await screen.findByRole('button', { name: 'finish-topup' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Balance')).not.toBeInTheDocument()
    })

    it('returns to the balance when the top-up is cancelled', async () => {
      renderPanel()

      fireEvent.click(screen.getByRole('button', { name: 'Top up' }))
      fireEvent.click(await screen.findByRole('button', { name: 'cancel-topup' }))

      expect(screen.getByText('Balance')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'finish-topup' })).not.toBeInTheDocument()
    })

    it('shows the processing notice once a payment is confirmed', async () => {
      renderPanel()

      await finishTopUp()

      expect(await screen.findByText(PROCESSING)).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    const paged = {
      currentPage: 2,
      lastPage: 3,
      nextPage: 3,
      previousPage: 1,
      totalItems: 25,
    }

    it('disables Previous and Next while the page on screen is placeholder data', () => {
      mockWallet({ history: [entry({ id: 'a' })], pagination: paged }, { isPlaceholderData: true })

      renderPanel()

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    })

    it('enables the buttons once the requested page has loaded', () => {
      mockWallet({ history: [entry({ id: 'a' })], pagination: paged }, { isPlaceholderData: false })

      renderPanel()

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    })
  })

  describe('top-up confirmation', () => {
    beforeEach(() => {
      sessionStorage.clear()
      mockWallet({ balanceCents: 12345 })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('credits a new top-up entry that has the requested amount', async () => {
      mockWallet({ history: [entry({ id: 'old', amountCents: 2000 })] })
      const result = renderPanel()
      await finishTopUp()

      mockWallet({ history: [entry({ id: 'new', amountCents: 5000 }), entry({ id: 'old', amountCents: 2000 })] })
      result.rerender(panel())

      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
      expect(screen.queryByText(PROCESSING)).not.toBeInTheDocument()
    })

    it('does not let a concurrent debit hide the credit', async () => {
      mockWallet({ history: [entry({ id: 'old', amountCents: 2000 })] })
      const result = renderPanel()
      await finishTopUp()

      mockWallet({
        balanceCents: 12345 + 5000 - 575,
        history: [
          entry({ id: 'pay', kind: 'payment', amountCents: -575 }),
          entry({ id: 'new', amountCents: 5000 }),
          entry({ id: 'old', amountCents: 2000 }),
        ],
      })
      result.rerender(panel())

      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
    })

    it('does not let an older top-up confirm the new payment', async () => {
      mockWallet({ history: [entry({ id: 'old', amountCents: 5000 })] })
      const result = renderPanel()
      await finishTopUp()

      mockWallet({ balanceCents: 17345, history: [entry({ id: 'old', amountCents: 5000 })] })
      result.rerender(panel())

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()
      expect(toast).not.toHaveBeenCalled()
    })

    it('ignores a new top-up for another amount', async () => {
      mockWallet({ history: [] })
      const result = renderPanel()
      await finishTopUp()

      mockWallet({ history: [entry({ id: 'new', amountCents: 2000 })] })
      result.rerender(panel())

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()
      expect(toast).not.toHaveBeenCalled()
    })

    it('switches to the timed-out message after two minutes without a credit', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      renderPanel()
      await finishTopUp()

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      expect(screen.getByText(TIMED_OUT)).toBeInTheDocument()
      expect(screen.queryByText(PROCESSING)).not.toBeInTheDocument()
    })

    it('restarts the two-minute wait when a second payment is reported', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      renderPanel()
      await finishTopUp()
      act(() => {
        vi.advanceTimersByTime(100 * 1000)
      })
      await finishTopUp()
      act(() => {
        vi.advanceTimersByTime(60 * 1000)
      })

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(60 * 1000)
      })
      expect(screen.getByText(TIMED_OUT)).toBeInTheDocument()
    })

    it('credits a redirect return against the snapshot stored before the payment', async () => {
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ knownTopupIds: ['old'], amountCents: 5000 }))
      mockWallet({ history: [entry({ id: 'old' })] })
      const result = renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_1')

      expect(screen.getByText(CHECKING)).toBeInTheDocument()
      expect(sessionStorage.getItem(SNAPSHOT_KEY)).toBeNull()

      mockWallet({ history: [entry({ id: 'new', amountCents: 5000 }), entry({ id: 'old' })] })
      result.rerender(panel({}, '/admin/settings/wallet'))

      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
    })

    it('uses the neutral message on a redirect return, never "Payment received"', () => {
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ knownTopupIds: [], amountCents: 5000 }))

      renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_1')

      expect(screen.getByText(CHECKING)).toBeInTheDocument()
      expect(screen.queryByText(PROCESSING)).not.toBeInTheDocument()
    })

    it('shows the redirect timeout message after two minutes', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ knownTopupIds: [], amountCents: 5000 }))

      renderPanel({}, '/admin/settings/wallet?topup=return')
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      expect(screen.getByText(REDIRECT_TIMED_OUT)).toBeInTheDocument()
      expect(toast).not.toHaveBeenCalled()
    })

    it('never toasts a redirect return without a stored snapshot', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      mockWallet({ history: [entry({ id: 'old' })] })
      const result = renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_1')

      expect(screen.getByText(CHECKING)).toBeInTheDocument()

      mockWallet({ history: [entry({ id: 'new', amountCents: 5000 }), entry({ id: 'old' })] })
      result.rerender(panel({}, '/admin/settings/wallet'))
      expect(toast).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      expect(screen.getByText(REDIRECT_TIMED_OUT)).toBeInTheDocument()
      expect(toast).not.toHaveBeenCalled()
    })

    it('removes the redirect params when returning from checkout', () => {
      renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_123')

      expect(screen.getByTestId('location')).toHaveTextContent('')
    })
  })
})
