import i18n from 'i18next'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { PlanUpgradeModal } from './Modals'

describe('PlanUpgradeModal', () => {
  it('renders the generic copy when context is generic', () => {
    i18n.addResourceBundle(
      'en',
      'common',
      {
        plan_upgrade: {
          generic_title: 'Generic upgrade title',
          generic_subtitle: 'The limit is {{limit}}',
          cancel: 'Cancel',
          see_plans: 'See Plans',
        },
      },
      true,
      true
    )

    render(
      <TestMemoryRouter>
        <PlanUpgradeModal
          open
          onOpenChange={() => undefined}
          onClose={() => undefined}
          context='generic'
          limit='1000'
        />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Generic upgrade title')).toBeInTheDocument()
    expect(screen.getByText('The limit is 1000')).toBeInTheDocument()
  })
})
