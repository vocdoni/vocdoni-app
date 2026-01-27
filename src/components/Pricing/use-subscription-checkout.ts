import { createContext, useContext } from 'react'
import { SubscriptionCheckoutFormValues } from './Plans'

export type CheckoutView = 'plans' | 'checkout'

export type SubscriptionCheckoutContextState = {
  view: CheckoutView
  checkout: SubscriptionCheckoutFormValues | undefined
  showCheckout: (checkout: SubscriptionCheckoutFormValues) => void
  showPlans: () => void
}

const SubscriptionCheckoutContext = createContext<SubscriptionCheckoutContextState | undefined>(undefined)

const useSubscriptionCheckout = () => {
  const context = useContext(SubscriptionCheckoutContext)
  if (!context) {
    throw new Error('useSubscriptionCheckout must be used within a SubscriptionCheckoutProvider')
  }
  return context
}

const SubscriptionCheckoutProviderContext = SubscriptionCheckoutContext.Provider

export { SubscriptionCheckoutProviderContext, useSubscriptionCheckout }
