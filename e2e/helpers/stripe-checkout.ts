import { expect, type Frame, type Page } from '@playwright/test'

/**
 * Stripe Checkout Elements drivers, shared by every spec that pays through the app
 * (the publish top-up and the wallet top-up page). Stripe renders the fields in its
 * own frames, so they are reached through `stripeFrame`, not the page.
 */

/** The checkout form is the only form on screen while a payment view is open. */
export const PAY_BUTTON = 'form:has(iframe[name^="__privateStripeFrame"]) button[type="submit"]'

// Autocomplete tokens are the standard; the name attributes are Stripe's own and the fallback.
const CARD_NUMBER = 'input[autocomplete="cc-number"], input[name="number"]'
const CARD_EXPIRY = 'input[autocomplete="cc-exp"], input[name="expiry"]'
const CARD_CVC = 'input[autocomplete="cc-csc"], input[name="cvc"]'
const ADDRESS_FIRST_NAME = '[autocomplete="given-name"], [name="firstName"]'
const ADDRESS_LAST_NAME = '[autocomplete="family-name"], [name="lastName"]'
const ADDRESS_LINE1 = '[autocomplete="address-line1"], [name="addressLine1"]'
const ADDRESS_CITY = '[autocomplete="address-level2"], [name="locality"]'
const ADDRESS_POSTAL_CODE = '[autocomplete="postal-code"], [name="postalCode"]'
const ADDRESS_COUNTRY = '[autocomplete="country"], [name="country"]'
// The Payment Element lists every enabled method as an accordion; card fields mount once it is open.
const CARD_METHOD = '[role="button"][data-value="card"]'

/**
 * The Stripe frame holding `selector`. Frames appear while the Elements mount and
 * can detach mid-search, so each frame is probed defensively and the search repeats.
 */
const stripeFrame = async (page: Page, selector: string, timeoutMs = 60_000): Promise<Frame> => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (!frame.name().startsWith('__privateStripeFrame')) continue
      if (
        (await frame
          .locator(selector)
          .count()
          .catch(() => 0)) > 0
      )
        return frame
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`No Stripe frame has ${selector} after ${timeoutMs}ms`)
}

/** A German address needs no state or province, so automatic tax can compute. */
export const fillStripeCheckout = async (page: Page): Promise<void> => {
  // Both checkouts split the name into two fields. Country first: it re-renders the rest.
  const address = await stripeFrame(page, ADDRESS_LINE1)
  await address.locator(ADDRESS_COUNTRY).selectOption('DE')
  await address.locator(ADDRESS_FIRST_NAME).fill('E2E')
  await address.locator(ADDRESS_LAST_NAME).fill('Runner')
  await address.locator(ADDRESS_LINE1).fill('Unter den Linden 1')
  await address.locator(ADDRESS_POSTAL_CODE).fill('10117')
  await address.locator(ADDRESS_CITY).fill('Berlin')

  // With a single method Stripe may skip the accordion, so either handle will do.
  const payment = await stripeFrame(page, `${CARD_METHOD}, ${CARD_NUMBER}`)
  const cardMethod = payment.locator(CARD_METHOD)
  if ((await cardMethod.count()) > 0 && (await cardMethod.getAttribute('aria-expanded')) !== 'true') {
    await cardMethod.click()
  }

  // Stripe's test card that succeeds without 3D Secure.
  const card = await stripeFrame(page, CARD_NUMBER)
  await card.locator(CARD_NUMBER).fill('4242424242424242')
  await card.locator(CARD_EXPIRY).fill('12 / 34')
  await card.locator(CARD_CVC).fill('123')
}

/** Submits the checkout form. Call after `fillStripeCheckout`. */
export const payStripeCheckout = async (page: Page): Promise<void> => {
  const submit = page.locator(PAY_BUTTON)
  await expect(submit).toBeVisible({ timeout: 60_000 })
  await submit.click()
}
