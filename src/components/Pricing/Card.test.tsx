import { render, screen } from '~src/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { PlanId } from '~constants'
import { MemoryRouter } from 'react-router-dom'
import PricingCard from './Card'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    subscription: { plan: { id: 3 }, subscriptionDetails: { active: false } },
  }),
}))

vi.mock('~queries/stripe', () => ({
  usePortalSession: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('~queries/account', () => ({
  useProfile: () => ({
    data: { organizations: [] },
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useLocation: () => ({ pathname: '/dashboard' }),
  }
})

vi.mock('./Plans', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./Plans')>()
  return {
    ...actual,
    usePlanTranslations: () => ({}),
  }
})

describe('PricingCard', () => {
  it('renders feature list items', () => {
    const Wrapper = () => {
      const form = useForm({ defaultValues: { billingPeriod: 'year' } })

      return (
        <FormProvider {...form}>
          <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <PricingCard
              title='Starter'
              subtitle='For small teams'
              price={10}
              popular={false}
              isDisabled={false}
              isCurrentPlan={false}
              plan={
                {
                  id: PlanId.Essential,
                  monthlyPrice: 10,
                  yearlyPrice: 100,
                  freeTrialDays: 0,
                  organization: { customPlan: false },
                } as any
              }
              features={[{ icon: () => null, text: 'Feature A' }]}
            />
          </MemoryRouter>
        </FormProvider>
      )
    }

    render(<Wrapper />)

    expect(screen.getByText('Feature A')).toBeInTheDocument()
  })
})
