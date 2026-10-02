import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { ComingSoonCard } from './ComingSoonCard'

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))

describe('ComingSoonCard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(trackAnalyticsEvent).mockClear()
  })

  it('explains the feature and records interest with where it was asked', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonCard
        feature='activity_log'
        surface='members_activity'
        title='Every change, with who and when'
        description='Edits to members and censuses will show here.'
      />
    )

    expect(screen.getByText('Every change, with who and when')).toBeInTheDocument()
    expect(screen.getByText('Soon')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: "I'd use this" }))

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      name: AnalyticsEvents.FeatureInterest,
      props: { feature: 'activity_log', surface: 'members_activity' },
    })
    expect(screen.getByRole('button', { name: "Thanks, we've noted it" })).toBeDisabled()
  })
})
