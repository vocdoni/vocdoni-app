import { loadStripe, type Appearance, type Stripe, type StripeCheckoutElementsOptions } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { type ColorMode, useColorMode } from '~theme/color-mode'
import { EMBED_DARK } from '~theme/embedColors'

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

// A theme CSS variable's value, following var() chains (semantic tokens point at scale steps); '' if unset
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

/** The Stripe appearance for the page's current colour mode, with its CSS variables read from the page now. */
const readAppearance = (colorMode: ColorMode): Appearance => {
  const themed = Object.entries({
    colorPrimary: '--chakra-colors-brand-fg',
    colorText: '--chakra-colors-fg',
    colorTextSecondary: '--chakra-colors-fg-muted',
    colorDanger: '--chakra-colors-fg-error',
    borderRadius: '--chakra-radii-l3',
    fontFamily: '--chakra-fonts-body',
    fontSizeBase: '--chakra-font-sizes-sm',
  })
    .map(([name, cssVar]) => [name, resolveCssVar(cssVar)])
    // An unset variable is left to Stripe's theme rather than sent empty
    .filter(([, value]) => value)

  return {
    theme: colorMode === 'dark' ? ('night' as const) : ('stripe' as const),
    variables: {
      // The page colour: Fil's dark page from the embed copy, white in light
      colorBackground: colorMode === 'dark' ? EMBED_DARK.background : 'white',
      ...Object.fromEntries(themed),
    },
    // In dark the fields take the guide's field ring, which Stripe's night theme draws too faint
    ...(colorMode === 'dark' ? { rules: { '.Input': { border: `1px solid ${EMBED_DARK.fieldRing}` } } } : {}),
  }
}

/**
 * Stripe Elements options for every checkout, in the app's theme: Stripe's iframes cannot read the page's CSS
 * variables, so they are re-read whenever the html class changes (next-themes applies it in an effect).
 * The font is named but not loaded: Vite hashes the font files, so there is no stable URL to hand Stripe.
 */
export const useCheckoutAppearance = (): StripeCheckoutElementsOptions => {
  const { colorMode } = useColorMode()
  const [appearance, setAppearance] = useState<Appearance>(() => readAppearance(colorMode))

  useEffect(() => {
    const refresh = () => setAppearance(readAppearance(colorMode))
    refresh()
    const observer = new MutationObserver(refresh)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [colorMode])

  return { appearance }
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
