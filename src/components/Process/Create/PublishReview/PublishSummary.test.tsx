import userEvent from '@testing-library/user-event'
import type { ProcessPriceResponse } from '@vocdoni/api-types'
import { render, screen, within } from '~src/test-utils'
import { defaultProcessValues, type Process, SelectorTypes } from '../common'
import { PublishSummary, type PublishSummaryProps } from './PublishSummary'

const price = (overrides: Partial<ProcessPriceResponse> = {}): ProcessPriceResponse => ({
  lines: [
    { kind: 'base', description: 'voting process (312 eligible voters)', amountCents: 15716 },
    { kind: 'smsTwoFA', description: 'sms 2FA', amountCents: 1560 },
  ],
  totalCents: 17276,
  currency: 'eur',
  quoteRecommended: false,
  quoteRequired: false,
  ...overrides,
})

const form: Process = {
  ...defaultProcessValues,
  title: 'General assembly',
  autoStart: true,
  endDate: '2026-03-12',
  endTime: '20:00',
  questions: [
    { ...defaultProcessValues.questions[0], title: 'Approve the accounts?' },
    { ...defaultProcessValues.questions[0], title: 'Who joins the board?', type: SelectorTypes.Multiple },
  ],
  census: { credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' },
}

const setup = (props: Partial<PublishSummaryProps> = {}) => {
  const handlers = { onKeepEditing: vi.fn(), onPrimary: vi.fn(), onClose: vi.fn(), onRetryPrice: vi.fn() }
  render(<PublishSummary form={form} voters={312} price={price()} canTopUp {...handlers} {...props} />)
  return { ...handlers, user: userEvent.setup() }
}

const primaryButton = () => screen.getAllByRole('button').at(-1)!

describe('PublishSummary', () => {
  it('sums up who votes on what, and how', () => {
    setup()

    expect(screen.getByText('Review before publishing')).toBeInTheDocument()
    expect(screen.getByText(/^312 people can vote on 2 questions, from when you publish until/)).toBeInTheDocument()

    const questions = within(screen.getByRole('list'))
    expect(questions.getByText('Approve the accounts?')).toBeInTheDocument()
    expect(questions.getByText('Single choice')).toBeInTheDocument()
    expect(questions.getByText('Who joins the board?')).toBeInTheDocument()
    expect(questions.getByText('Multiple choice')).toBeInTheDocument()

    expect(screen.getByText('Vote weight')).toBeInTheDocument()
    expect(screen.getByText('Member Number')).toBeInTheDocument()
    expect(screen.getByText('Code by email')).toBeInTheDocument()
    expect(screen.getByText('Anonymous vote')).toBeInTheDocument()
  })

  it('hides the anonymity row where the deployment turns it off', () => {
    setup({ disableAnonymous: true })
    expect(screen.queryByText('Anonymous vote')).not.toBeInTheDocument()
  })

  it('offers a free test run only when the census alone makes the vote paid', () => {
    const noSms = price({ lines: [{ kind: 'base', description: 'base', amountCents: 15716 }], totalCents: 15716 })
    const { unmount } = render(
      <PublishSummary form={form} voters={312} price={noSms} canTopUp onKeepEditing={vi.fn()} onPrimary={vi.fn()} />
    )
    expect(screen.getByText(/pick a census of 25 people or fewer: it's free/)).toBeInTheDocument()
    unmount()

    setup()
    expect(screen.queryByText(/pick a census of 25 people or fewer/)).not.toBeInTheDocument()
  })

  it('publishes a free vote straight away', async () => {
    const { user, onPrimary } = setup({
      price: price({ lines: [{ kind: 'base', description: 'base', amountCents: 0 }], totalCents: 0 }),
      voters: 20,
      wallet: { balanceCents: 0 },
    })

    expect(primaryButton()).toHaveTextContent('Publish')
    await user.click(primaryButton())
    expect(onPrimary).toHaveBeenCalledWith('publish')
  })

  it('publishes straight away when the wallet cannot be read', async () => {
    const { user, onPrimary } = setup({ wallet: undefined })

    await user.click(screen.getByRole('button', { name: 'Publish' }))
    expect(onPrimary).toHaveBeenCalledWith('publish')
  })

  it('pays from the wallet when the balance covers the price', async () => {
    const { user, onPrimary } = setup({ wallet: { balanceCents: 23080, currency: 'eur' } })

    expect(screen.getByText('Cost: €172.76')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Publish and pay €172.76' }))
    expect(onPrimary).toHaveBeenCalledWith('wallet')
  })

  it('writes whole amounts with both decimals everywhere in the dialog', () => {
    const whole = price({ lines: [{ kind: 'base', description: 'base', amountCents: 3300 }], totalCents: 3300 })
    setup({ price: whole, voters: 100, wallet: { balanceCents: 3000, currency: 'eur' } })

    expect(screen.getByText('Cost: €33.00. €3.00 short in the balance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add €3.00 and publish' })).toBeInTheDocument()
  })

  it('moves to the card step for what the balance lacks', async () => {
    const { user, onPrimary } = setup({ wallet: { balanceCents: 13080, currency: 'eur' } })

    expect(screen.getByText('Cost: €172.76. €41.96 short in the balance')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add €41.96 and publish' }))
    expect(onPrimary).toHaveBeenCalledWith('card')
  })

  it('blocks publishing when the balance is short and only an admin can top it up', () => {
    setup({ wallet: { balanceCents: 13080, currency: 'eur' }, canTopUp: false })

    expect(screen.getByText('€41.96 short in the balance. Only an admin can top it up.')).toBeInTheDocument()
    expect(primaryButton()).toBeDisabled()
  })

  it('keeps the primary disabled while the price loads', () => {
    setup({ price: undefined, priceLoading: true })

    expect(screen.queryByText(/^Cost:/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('keeps the cost, an open breakdown and the label while the price is re-read, ignoring clicks', async () => {
    const handlers = { onKeepEditing: vi.fn(), onPrimary: vi.fn() }
    const props = { form, voters: 312, price: price(), canTopUp: true, ...handlers }
    const wallet = { balanceCents: 13080, currency: 'eur' }
    const { rerender } = render(<PublishSummary {...props} wallet={wallet} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Review the details/ }))

    rerender(<PublishSummary {...props} wallet={wallet} priceRefreshing />)

    expect(screen.getByText('Cost: €172.76. €41.96 short in the balance')).toBeInTheDocument()
    expect(screen.getByText('What you pay for')).toBeInTheDocument()
    const primary = primaryButton()
    expect(primary).toHaveTextContent('Add €41.96 and publish')
    expect(primary).toBeDisabled()
    await user.click(primary)
    expect(handlers.onPrimary).not.toHaveBeenCalled()
  })

  it('offers a retry when the price fails, with the primary disabled', async () => {
    const { user, onRetryPrice } = setup({ price: undefined, priceError: true })

    expect(screen.getByText('The price could not be loaded.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetryPrice).toHaveBeenCalled()
  })

  it('opens the cost breakdown with the wallet lines and where the money comes from', async () => {
    const { user } = setup({ wallet: { balanceCents: 23080, currency: 'eur' } })

    const toggle = screen.getByRole('button', { name: /Review the details/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('What you pay for')).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('What you pay for')).toBeInTheDocument()
    expect(screen.getByText('312 voters')).toBeInTheDocument()
    expect(screen.getByText('SMS code, 312 voters')).toBeInTheDocument()
    expect(screen.getByText('Total, VAT excluded')).toBeInTheDocument()
    expect(screen.getByText('Organization balance now')).toBeInTheDocument()
    expect(screen.getByText('Balance after publishing')).toBeInTheDocument()
    expect(screen.getByText('€58.04')).toBeInTheDocument()
    expect(screen.getByText(/Nothing is charged to a card/)).toBeInTheDocument()
  })

  it('brings the opened breakdown into view', async () => {
    const scrollIntoView = vi.fn()
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      const { user } = setup({ wallet: { balanceCents: 23080, currency: 'eur' } })

      await user.click(screen.getByRole('button', { name: /Review the details/ }))

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
      expect(scrollIntoView.mock.contexts[0]).toHaveTextContent('What you pay for')
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })

  it('shows what is short in the breakdown and that the card pays it', async () => {
    const { user } = setup({ wallet: { balanceCents: 13080, currency: 'eur' } })

    await user.click(screen.getByRole('button', { name: /Review the details/ }))

    expect(screen.getByText('Short')).toBeInTheDocument()
    expect(
      screen.getByText('What is short is paid by card in the next step. The rest comes from the balance.')
    ).toBeInTheDocument()
  })

  it('offers a "Change" on each row that names the setting and reports where it leads', async () => {
    const onEdit = vi.fn()
    const { user } = setup({ onEdit })

    await user.click(screen.getByRole('button', { name: 'Change dates' }))
    await user.click(screen.getByRole('button', { name: 'Change vote weight' }))
    await user.click(screen.getByRole('button', { name: 'Change results' }))
    await user.click(screen.getByRole('button', { name: 'Change credentials' }))
    await user.click(screen.getByRole('button', { name: 'Change 2fa' }))
    await user.click(screen.getByRole('button', { name: 'Change anonymous vote' }))

    expect(onEdit.mock.calls.map(([target]) => target)).toEqual([
      'dates',
      'weight',
      'results',
      'auth',
      'auth',
      'anonymous',
    ])
  })

  it('leaves the rows without "Change" when nothing can be edited', () => {
    setup()
    expect(screen.queryByRole('button', { name: /^Change / })).not.toBeInTheDocument()
  })

  it('says how long the vote runs after its dates', () => {
    setup()
    expect(screen.getByText(/^\d+ (days?|hours?)$/)).toBeInTheDocument()
  })

  it('runs the primary on Ctrl+Enter or Cmd+Enter, unless it is disabled', async () => {
    const { user, onPrimary } = setup({ wallet: { balanceCents: 23080, currency: 'eur' } })

    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(onPrimary).toHaveBeenCalledTimes(1)
    expect(onPrimary).toHaveBeenLastCalledWith('wallet')
    await user.keyboard('{Meta>}{Enter}{/Meta}')
    expect(onPrimary).toHaveBeenCalledTimes(2)
    // A plain Enter is not the shortcut
    await user.keyboard('{Enter}')
    expect(onPrimary).toHaveBeenCalledTimes(2)
  })

  it('ignores the shortcut while the primary is disabled or loading', async () => {
    const blocked = setup({ wallet: { balanceCents: 13080, currency: 'eur' }, canTopUp: false })
    await blocked.user.keyboard('{Control>}{Enter}{/Control}')
    expect(blocked.onPrimary).not.toHaveBeenCalled()
  })

  it('closes from "Keep editing" and from the close button', async () => {
    const { user, onKeepEditing, onClose } = setup()

    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(onKeepEditing).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
