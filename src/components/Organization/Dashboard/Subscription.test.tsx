import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render } from '~src/test-utils'
import SubscriptionPage from './Subscription'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    loading: false,
    error: null,
    subscription: {
      plan: {
        id: 1,
        yearlyPrice: 0,
        name: 'Free',
      },
      subscriptionDetails: {
        lastPaymentDate: new Date().toISOString(),
      },
    },
  }),
}))

vi.mock('~queries/stripe', () => ({
  usePortalSession: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ portalURL: 'https://example.com' }),
    isPending: false,
  }),
}))

vi.mock('~components/Pricing/Plans', () => ({
  SubscriptionPlans: () => <div data-testid='plans' />,
}))

vi.mock('~components/Pricing/ComparisonTable', () => ({
  ComparisonTable: () => <div data-testid='comparison' />,
}))

vi.mock('~components/Pricing/SubscriptionPayment', () => ({
  SubscriptionPayment: () => <div data-testid='payment' />,
}))

const i18n = i18next.createInstance()

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          subscription_plan: {
            need_help: '<0>Need help choosing?</0> <1>Contact our sales team</1>',
          },
        },
      },
    },
  })
})

describe('SubscriptionPage', () => {
  it('renders translated help link without crashing', () => {
    expect(() =>
      render(<SubscriptionPage />, {
        i18nInstance: i18n,
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      })
    ).not.toThrow()
  })
})
