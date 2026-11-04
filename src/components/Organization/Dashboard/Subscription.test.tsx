import { createTestI18n, render, screen } from '~src/test-utils'
import SubscriptionPage from './Subscription'

let i18n: Awaited<ReturnType<typeof createTestI18n>>

beforeAll(async () => {
  i18n = await createTestI18n({ useReactI18next: true, resources: { en: { common: {} } } })
})

describe('SubscriptionPage', () => {
  it('only links to the pricing on the Vocdoni website', () => {
    render(<SubscriptionPage />, { i18nInstance: i18n })

    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'vocdoni.io/pricing' })).toHaveAttribute(
      'href',
      'https://vocdoni.io/pricing'
    )
  })
})
