import i18next from 'i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { initReactI18next } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll } from 'vitest'
import { PlanId } from '~constants'
import { render, screen } from '~src/test-utils'
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

const i18n = i18next.createInstance()

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
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
