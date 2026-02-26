import i18n from 'i18next'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { PlanUpgradeModal } from './Modals'

describe('PlanUpgradeModal', () => {
  it('renders memberbase copy when context is memberbase', () => {
    i18n.addResourceBundle(
      'en',
      'common',
      {
        plan_upgrade: {
          memberbase_title: 'Memberbase upgrade title',
          memberbase_subtitle: 'Memberbase limit is {{limit}}',
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
          context='memberbase'
          limit='1000'
        />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Memberbase upgrade title')).toBeInTheDocument()
    expect(screen.getByText('Memberbase limit is 1000')).toBeInTheDocument()
  })
})
