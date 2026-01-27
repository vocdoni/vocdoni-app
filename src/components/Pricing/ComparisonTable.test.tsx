import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '~src/test-utils'
import { ComparisonTable } from './ComparisonTable'

vi.mock('./Plans', () => ({
  usePlans: () => ({
    data: [
      {
        id: 'basic',
        limits: { maxMembers: 10 },
        organization: { customPlan: false },
      },
    ],
    isLoading: false,
  }),
  usePlanTranslations: () => ({
    basic: { title: 'Basic' },
  }),
}))

vi.mock('./Features', () => ({
  CategoryTitleKeys: { generalLimits: 'features.section.general' },
  CategorizedSpecs: {
    generalLimits: [{ kind: 'plan', path: 'limits.maxMembers', labelKey: 'spec.max_members' }],
  },
}))

describe('ComparisonTable', () => {
  it('renders plan headers and feature rows', () => {
    render(<ComparisonTable />)

    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('spec.max_members')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
