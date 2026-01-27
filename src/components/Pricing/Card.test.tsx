import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll } from 'vitest'
import { PlanId } from '~constants'
import { createTestI18n, render, screen } from '~src/test-utils'
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

let i18n: Awaited<ReturnType<typeof createTestI18n>>

beforeAll(async () => {
  i18n = await createTestI18n({
    useReactI18next: true,
    resources: {
      en: {
        common: {
          pricing_card: {
            need_more_members: 'Need more members? <2>Contact us</2>',
          },
        },
      },
    },
  })
})

describe('PricingCard', () => {
  it('renders feature list items', () => {
    const Wrapper = () => {
      const form = useForm({ defaultValues: { billingPeriod: 'year' } })

      return (
        <FormProvider {...form}>
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
        </FormProvider>
      )
    }

    render(<Wrapper />, {
      i18nInstance: i18n,
      wrapper: ({ children }) => (
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</MemoryRouter>
      ),
    })

    expect(screen.getByText('Feature A')).toBeInTheDocument()
  })

  it('renders the contact link translation without crashing', () => {
    const Wrapper = () => {
      const form = useForm({ defaultValues: { billingPeriod: 'year' } })

      return (
        <FormProvider {...form}>
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
        </FormProvider>
      )
    }

    expect(() =>
      render(<Wrapper />, {
        i18nInstance: i18n,
        wrapper: ({ children }) => (
          <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</MemoryRouter>
        ),
      })
    ).not.toThrow()
  })
})
