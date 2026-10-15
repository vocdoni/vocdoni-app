import type { Stripe, StripeCheckoutOptions } from '@stripe/stripe-js'
// The pure entry loads Stripe.js on first use, not on import: the checkouts live in chunks (the
// process wizard) most visits never pay from
import { loadStripe } from '@stripe/stripe-js/pure'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { useColorMode } from '~theme/color-mode'

/**
 * Stripe.js for the embedded checkouts, or null when no key is configured (STRIPE_PUBLIC_KEY is
 * optional, and loadStripe('') throws). Loaded once per mounted checkout, not on every render.
 */
export const useStripePromise = () => {
  const { i18n } = useTranslation()
  const stripePublicKey = useAppEnv().STRIPE_PUBLIC_KEY

  const [stripePromise] = useState<Promise<Stripe | null> | null>(() =>
    stripePublicKey
      ? loadStripe(stripePublicKey, {
          locale: i18n.resolvedLanguage as any,
          betas: ['custom_checkout_tax_id_1'],
        })
      : null
  )

  return stripePromise
}

// The embedded checkout's look, following the app's color mode
export const useCheckoutElementsOptions = (): StripeCheckoutOptions['elementsOptions'] => {
  const { colorMode } = useColorMode()

  return {
    appearance: {
      theme: colorMode === 'dark' ? ('night' as const) : ('stripe' as const),
      variables: {
        // Stripe renders in an iframe, so theme CSS vars are unreachable; raw values mirror the `bg` token
        colorBackground: colorMode === 'dark' ? '#0a0a0a' : 'white',
      },
    },
  }
}
