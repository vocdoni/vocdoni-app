import { expect, type Frame, type Locator, type Page } from '@playwright/test'

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
      // Stripe also mounts 2px hidden copies of an element's frame, with the same markup.
      const box = await frame
        .frameElement()
        .then((element) => element.boundingBox())
        .catch(() => null)
      if (!box || box.height < 20) continue
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

  await fillCard(page)
}

/**
 * Fills Stripe's test card that succeeds without 3D Secure. The tax update (triggered by the billing
 * address) re-renders the Payment Element, which can drop the selection or auto-select another method
 * such as Bancontact, so the card is re-checked until it holds.
 */
const fillCard = async (page: Page): Promise<void> => {
  await expect(async () => {
    await selectCard(page)
    const card = await stripeFrame(page, CARD_NUMBER, 10_000)
    await card.locator(CARD_NUMBER).fill('4242424242424242')
    await card.locator(CARD_EXPIRY).fill('12 / 34')
    await card.locator(CARD_CVC).fill('123')
    // The tax update re-renders the Payment Element about 2s after the fill, so wait it out.
    await page.waitForTimeout(3_000)
    expect(await cardProblem(page)).toBeNull()
  }).toPass({ timeout: 90_000 })
}

/**
 * Why the card is not ready, or null when it holds the test number and is the selected method.
 * Stripe keeps the card number mounted after another method is picked, so the open accordion is checked too.
 */
const cardProblem = async (page: Page): Promise<string | null> => {
  const card = await stripeFrame(page, CARD_NUMBER, 5_000).catch(() => null)
  if (!card) return 'no Stripe frame with the card number'
  const cardMethod = card.locator(CARD_METHOD)
  // With a single method Stripe may skip the accordion, so only an existing one is checked.
  const collapsed =
    (await cardMethod.count().catch(() => 0)) > 0 &&
    (await cardMethod.getAttribute('aria-expanded').catch(() => null)) !== 'true'
  if (collapsed) return 'card method collapsed'
  const number = await card
    .locator(CARD_NUMBER)
    .inputValue()
    .catch(() => '')
  return /4242/.test(number) ? null : `card number is '${number}'`
}

/** Opens the card method when the Payment Element lists several methods. */
const selectCard = async (page: Page): Promise<void> => {
  // With a single method Stripe may skip the accordion, so either handle will do.
  const payment = await stripeFrame(page, `${CARD_METHOD}, ${CARD_NUMBER}`)
  const cardMethod = payment.locator(CARD_METHOD)
  if ((await cardMethod.count()) > 0 && (await cardMethod.getAttribute('aria-expanded')) !== 'true') {
    // Stripe keeps resizing its frame, so a click never sees the button stable; Enter needs no stability.
    await cardMethod.focus()
    await cardMethod.press('Enter')
  }
}

/**
 * Submits the checkout form; call after `fillStripeCheckout`. Stripe can switch away from Card around the
 * click so the confirm never goes through; a free button is clicked again (card re-selected if needed),
 * never one still in flight, and a Checkout Session can be paid only once.
 */
export const payStripeCheckout = async (page: Page): Promise<void> => {
  const submit = page.locator(PAY_BUTTON)
  await expect(submit).toBeVisible({ timeout: 60_000 })
  const checkoutUrl = page.url()
  const attempts = 3
  let lastReason = ''
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if ((await cardProblem(page)) !== null) await fillCard(page)
    await submit.click()
    const outcome = await awaitPaymentStart(page, submit, checkoutUrl)
    if (outcome !== 'lost') return
    // A decline or an expired session also frees the button: the form's error alert says which.
    const alert = await submit
      .locator('xpath=ancestor::form[1]')
      .getByRole('alert')
      .first()
      .textContent({ timeout: 1_000 })
      .catch(() => null)
    lastReason = [(await cardProblem(page)) ?? 'card still selected', alert && `app error: ${alert.trim()}`]
      .filter(Boolean)
      .join('; ')
    console.warn(`Pay attempt ${attempt} of ${attempts} did not go through (${lastReason}); retrying`)
  }
  throw new Error(`The payment did not go through after ${attempts} Pay attempts (${lastReason})`)
}

/**
 * The forms keep Pay loading until `checkout.confirm` resolves and unmount it on success, so a button
 * free on two polls (one covers the gap before React marks it busy) means the click was lost.
 */
const awaitPaymentStart = async (
  page: Page,
  submit: Locator,
  checkoutUrl: string
): Promise<'started' | 'lost' | 'unknown'> => {
  const deadline = Date.now() + 15_000
  let hiddenPolls = 0
  let freePolls = 0
  while (Date.now() < deadline) {
    // Stripe can briefly detach its iframes while re-initialising, which hides the button, so require two polls.
    hiddenPolls = (await submit.isVisible()) ? 0 : hiddenPolls + 1
    if (page.url() !== checkoutUrl || hiddenPolls >= 2) return 'started'
    // Chakra sets data-loading on a Button while its loading prop is on, and disables it at the same time.
    const loading = (await submit.getAttribute('data-loading', { timeout: 1_000 }).catch(() => null)) !== null
    const enabled = await submit.isEnabled({ timeout: 1_000 }).catch(() => false)
    freePolls = enabled && !loading ? freePolls + 1 : 0
    if (freePolls >= 2) return 'lost'
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  console.warn("Pay outcome unknown after 15s; leaving it to the caller's wait")
  return 'unknown'
}
