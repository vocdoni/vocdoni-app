import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'
import { act, fireEvent, render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import type { Wallet, WalletEntry } from '~queries/wallet'
import WalletPanel from './Wallet'

const walletState = vi.hoisted(() => ({ current: {} as any }))
const toast = vi.hoisted(() => vi.fn())

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => toast,
}))

vi.mock('~queries/wallet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/wallet')>()),
  useWallet: () => walletState.current,
  isManagedOrgWalletError: (error: unknown) => (error as { managed?: boolean } | null)?.managed === true,
}))

vi.mock('./TopUp', async () => {
  const React = await import('react')
  return {
    WalletTopUp: ({ onDone }: { onDone: (amountCents: number) => void }) =>
      React.createElement('button', { onClick: () => onDone(5000) }, 'finish-topup'),
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
const TOPPED_UP = 'Your wallet was topped up'

// Opens the dialog and reports a finished payment through the mocked TopUp. The dialog content
// mounts after a tick, so fake timers are advanced first when they are in use.
const finishTopUp = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Top up' }))
  const finish = await screen.findByRole('button', { name: 'finish-topup' })
  fireEvent.click(finish)
}

describe('WalletPanel', () => {
  beforeEach(() => {
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

  it('shows the processing notice and removes the redirect params when returning from checkout', () => {
    renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_123')

    expect(screen.getByText('Payment received. Your balance updates as soon as it is confirmed.')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('')
  })

  it('shows the processing notice once a top-up dialog reports it is paid', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: 'Top up' }))
    await user.click(await screen.findByRole('button', { name: 'finish-topup' }))

    expect(
      await screen.findByText('Payment received. Your balance updates as soon as it is confirmed.')
    ).toBeInTheDocument()
  })

  describe('top-up confirmation', () => {
    beforeEach(() => {
      sessionStorage.clear()
      mockWallet({ balanceCents: 12345 })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('credits a redirect return against the balance stored before the payment', async () => {
      sessionStorage.setItem('wallet-topup-baseline', '10000')
      renderPanel({}, '/admin/settings/wallet?topup=return&session_id=cs_1')

      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
      expect(screen.queryByText(PROCESSING)).not.toBeInTheDocument()
      expect(sessionStorage.getItem('wallet-topup-baseline')).toBeNull()
    })

    it('keeps waiting on a redirect return while the stored balance is unchanged', () => {
      sessionStorage.setItem('wallet-topup-baseline', '12345')
      renderPanel({}, '/admin/settings/wallet?topup=return')

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()
    })

    it('credits a redirect return when a top-up from the last 15 minutes is in the history', async () => {
      mockWallet({
        balanceCents: 12345,
        history: [entry({ kind: 'topup', amountCents: 2000, createdAt: new Date().toISOString() })],
      })
      renderPanel({}, '/admin/settings/wallet?topup=return')

      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
    })

    it('keeps waiting when the only top-up in the history is older than 15 minutes', () => {
      mockWallet({
        balanceCents: 12345,
        history: [
          entry({ kind: 'topup', amountCents: 2000, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }),
        ],
      })
      renderPanel({}, '/admin/settings/wallet?topup=return')

      expect(screen.getByText(PROCESSING)).toBeInTheDocument()
    })

    it('waits for the full amount of a dialog top-up before confirming', async () => {
      const result = renderPanel()
      await finishTopUp()

      mockWallet({ balanceCents: 13345 })
      result.rerender(panel())
      expect(screen.getByText(PROCESSING)).toBeInTheDocument()

      mockWallet({ balanceCents: 17345 })
      result.rerender(panel())
      await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: TOPPED_UP })))
    })

    it('switches to the neutral message after two minutes without a credit', async () => {
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
      await waitFor(() => expect(screen.queryByRole('button', { name: 'finish-topup' })).not.toBeInTheDocument())
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
  })
})
