import { loadStripe, type Appearance, type Stripe, type StripeCheckoutElementsOptions } from '@stripe/stripe-js'
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

// Chakra v3 semantic tokens reference raw scale steps through var() chains; resolve them
// by following the chain up to `depth` levels until a concrete value is reached.
// The app's Inter font is bundled by Vite with hashed filenames and has no stable URL for
// Stripe iframes to load via cssSrc — the system font stack is used instead, with Inter
// first so it applies when the browser already has it cached.
// Exported for tests.
export const resolveCssVar = (varName: string, depth = 3): string => {
  if (typeof document === 'undefined' || depth === 0) return ''
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!value) return ''
  if (value.startsWith('var(')) {
    const inner = value.slice(4, -1).split(',')[0].trim()
    return resolveCssVar(inner, depth - 1)
  }
  return value
}

/**
 * Returns the full Stripe Checkout Elements options (appearance + other settings) derived
 * from the app's theme at the moment the checkout renders. Shared by the publish dialog's
 * card step, the wallet top-up and the census checkout, so all Stripe surfaces look the same.
 *
 * P15: `savedPaymentMethod.enableSave: 'never'` removes Stripe's "Save my information for
 * faster checkout" block, which is a supported client-side option in elementsOptions.
 */
export const useCheckoutAppearance = (): StripeCheckoutElementsOptions => {
  const { colorMode } = useColorMode()
  const v = resolveCssVar

  const appearance: Appearance = {
    theme: colorMode === 'dark' ? ('night' as const) : ('stripe' as const),
    variables: {
      // Stripe iframes cannot read the page's CSS vars; read them here and pass the resolved values
      colorBackground: colorMode === 'dark' ? '#0a0a0a' : 'white',
      colorPrimary: v('--chakra-colors-brand-fg'),
      colorText: v('--chakra-colors-fg'),
      colorTextSecondary: v('--chakra-colors-fg-muted'),
      colorDanger: v('--chakra-colors-fg-error'),
      borderRadius: v('--chakra-radii-l3'),
      fontFamily: v('--chakra-fonts-body'),
      fontSizeBase: v('--chakra-font-sizes-sm'),
    },
  }

  return {
    appearance,
    savedPaymentMethod: { enableSave: 'never' },
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
