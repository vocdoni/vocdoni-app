import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { ComingSoonButton } from './ComingSoon'

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))

const renderButton = () =>
  render(
    <ComingSoonButton
      feature='reminders'
      label='Send reminder'
      title='Reminders'
      description='Email the members who have not voted yet.'
    />
  )

describe('ComingSoonButton', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(trackAnalyticsEvent).mockClear()
  })

  it('shows the control with a Soon tag, and explains itself when clicked', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: /Send reminder/ }))

    expect(await screen.findByText('Email the members who have not voted yet.')).toBeInTheDocument()
    expect(screen.getAllByText('Soon').length).toBeGreaterThan(0)
  })

  it('records the interest once, and remembers it', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: /Send reminder/ }))
    await user.click(await screen.findByRole('button', { name: "I'd use this" }))

    expect(trackAnalyticsEvent).toHaveBeenCalledTimes(1)
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      name: AnalyticsEvents.FeatureInterest,
      props: { feature: 'reminders' },
    })
    expect(screen.getByRole('button', { name: "Thanks, we've noted it" })).toBeDisabled()
    expect(localStorage.getItem('feature-interest:reminders')).toBe('1')
  })
})
