import '@testing-library/jest-dom'
import { describe, expect, it } from 'vitest'
import i18n from 'i18next'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
import { PlanUpgradeModal } from './Modals'

describe('PlanUpgradeModal', () => {
  it('renders memberbase copy when context is memberbase', () => {
    i18n.addResourceBundle(
      'en',
      'translation',
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
      <MemoryRouter>
        <PlanUpgradeModal isOpen onClose={() => undefined} context='memberbase' limit='1000' />
      </MemoryRouter>
    )

    expect(screen.getByText('Memberbase upgrade title')).toBeInTheDocument()
    expect(screen.getByText('Memberbase limit is 1000')).toBeInTheDocument()
  })
})
