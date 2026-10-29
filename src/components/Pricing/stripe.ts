import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { useColorMode } from '~theme/color-mode'

// Lazy initializer so loadStripe runs once (not on every render), and only when
// a key is configured — loadStripe('') throws, and STRIPE_PUBLIC_KEY is optional.
export const useStripePromise = (): Promise<Stripe | null> | null => {
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

export const useCheckoutAppearance = (): Appearance => {
  const { colorMode } = useColorMode()
  return {
    theme: colorMode === 'dark' ? ('night' as const) : ('stripe' as const),
    variables: {
      // Stripe renders in an iframe, so theme CSS vars are unreachable; raw values mirror the `bg` token
      colorBackground: colorMode === 'dark' ? '#0a0a0a' : 'white',
    },
  }
}

// Base for a redirect-based payment's return URL: the current page without query or hash, with
// `segment` appended. Stripe adds `/{sessionId}` after it, so the route is `<page>/<segment>/:sessionId`.
export const checkoutReturnBase = (segment = 'return'): string => {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${segment}`
  return url.toString()
}
