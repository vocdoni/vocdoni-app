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

// Stripe and Cal.com render in iframes, so theme CSS vars are unreachable; these raw values mirror the Fil dark
// tokens (bg, the dialog grey, fg, field ring, primary). The one place for them, shared by both embeds. Light keeps
// each embed's own look apart from the page background.
export const EMBED_DARK = {
  background: '#0a0a0a',
  dialog: '#1c1c1c',
  text: '#ededed',
  fieldRing: '#707070',
  primary: '#1d62e9',
}

export const useCheckoutAppearance = (): Appearance => {
  const { colorMode } = useColorMode()
  if (colorMode === 'dark') {
    return {
      theme: 'night',
      variables: {
        colorBackground: EMBED_DARK.background,
        colorText: EMBED_DARK.text,
        colorPrimary: EMBED_DARK.primary,
      },
      rules: { '.Input': { border: `1px solid ${EMBED_DARK.fieldRing}` } },
    }
  }
  return { theme: 'stripe', variables: { colorBackground: 'white' } }
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
