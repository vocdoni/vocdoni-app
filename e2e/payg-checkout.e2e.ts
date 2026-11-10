import type { Frame, Page } from '@playwright/test'
import { makeMembers } from './helpers/data'
import { fillProcessWizard, importMembers, signUpWithOrganization } from './helpers/flows'
import { expect, test } from './helpers/fixtures'
import { localStack, type SaasClient } from './helpers/stripe'

/**
 * Flow 4 — pay-per-process checkout against a real Stripe test sandbox.
 *
 * The organizer's census is larger than the free allowance, so publishing is
 * refused for lack of wallet balance and the wizard opens the top-up view. The
 * test pays through Stripe Checkout Elements, then waits for the backend to
 * credit the wallet, debit the process and publish it. Only a publish the
 * backend confirmed lands the browser on the process page.
 *
 * Stripe creates real test-mode objects, so the checkout sessions this run
 * opened are cleaned up afterwards, including after a failure.
 */

/** Above the backend's free census size (25): the process is not free. */
const PAID_CENSUS_SIZE = 26

/** `POST /processes/{id}/checkout`: the top-up view opening its session. */
const CHECKOUT_PATH = /\/processes\/([^/]+)\/checkout$/

/**
 * The field named `fieldName` inside a Stripe Elements frame. Stripe renders each
 * element in its own iframe, named `__privateStripeFrame…`, and the frames appear
 * while the elements load, so every frame is searched rather than assuming an
 * order.
 *
 * Stripe's frame naming and field names are unverified against the sandbox at
 * the time of writing: if either changes, this helper and `fillStripeCheckout`
 * are the places to fix.
 */
const stripeFrame = async (page: Page, fieldName: string, timeoutMs = 60_000): Promise<Frame> => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (frame.name().startsWith('__privateStripeFrame') && (await frame.locator(`[name="${fieldName}"]`).count())) {
        return frame
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`No Stripe frame has a "${fieldName}" field after ${timeoutMs}ms`)
}

/**
 * Fills the Payment Element's card and the Billing Address Element with a German
 * address, which needs no state or province, so automatic tax can compute.
 */
const fillStripeCheckout = async (page: Page): Promise<void> => {
  // The address element is set to split names (ProcessCheckout), so the name is
  // two fields. Country goes first: changing it re-renders the rest of the form.
  const address = await stripeFrame(page, 'line1')
  await address.locator('[name="country"]').selectOption('DE')
  await address.locator('[name="firstName"]').fill('E2E')
  await address.locator('[name="lastName"]').fill('Runner')
  await address.locator('[name="line1"]').fill('Unter den Linden 1')
  await address.locator('[name="postalCode"]').fill('10117')
  await address.locator('[name="city"]').fill('Berlin')

  // Stripe's test card that succeeds without 3D Secure.
  const card = await stripeFrame(page, 'number')
  await card.locator('[name="number"]').fill('4242424242424242')
  await card.locator('[name="expiry"]').fill('12 / 34')
  await card.locator('[name="cvc"]').fill('123')
}

/** The organization the signup just created: the only one the new user belongs to. */
const organizationAddressOf = async (saas: SaasClient, token: string): Promise<string> => {
  const membership = (await saas.getUserOrganizations(token)).find((entry) => entry.organization)
  if (!membership?.organization) throw new Error('The new user has no organization')
  return membership.organization.address
}

test.describe('pay-per-process checkout', () => {
  // Stripe mode of the stack (integration/README.md#stripe-mode-opt-in) gives the
  // app a publishable key and forwards webhooks. Without it the spec has nothing
  // to pay with, so it skips rather than fails.
  test.skip(
    !process.env.INTEGRATION_STRIPE_SECRET_KEY,
    'needs the stack in Stripe mode (INTEGRATION_STRIPE_SECRET_KEY)'
  )

  test.beforeEach(async ({}, testInfo) => {
    // One browser is enough: this drives Stripe's iframes, not a responsive layout.
    test.skip(testInfo.project.name !== 'chromium', 'runs in the chromium project only')
  })

  test('a wallet top-up pays for the publish and the process goes live', async ({ page }) => {
    test.setTimeout(15 * 60_000)

    const { stripe, saas } = localStack()
    const seed = String(Date.now()).slice(-6)
    // Stripe lists sessions created since this instant, so the cleanup only sees this run's.
    const sinceUnix = Math.floor(Date.now() / 1000)
    let orgAddress: string | undefined

    try {
      const user = await signUpWithOrganization(page, `PAYG Org ${seed}`)
      await importMembers(page, makeMembers(PAID_CENSUS_SIZE, seed))

      const token = await saas.login(user.email, user.password)
      orgAddress = await organizationAddressOf(saas, token)

      await fillProcessWizard(page, {
        title: `E2E paid ${seed}`,
        questions: [{ title: 'Do you approve?', choices: [{ label: 'Yes' }, { label: 'No' }] }],
        twoFactor: false,
      })

      // Listened for before the click: a refused publish makes the top-up view
      // open its checkout at once, and that response names the process.
      const checkoutOpened = page.waitForResponse(
        (response) => response.request().method() === 'POST' && CHECKOUT_PATH.test(new URL(response.url()).pathname)
      )
      await page.getByRole('button', { name: /^Publish$/ }).click()
      const checkout = await checkoutOpened
      expect(checkout.ok()).toBe(true)
      const processId = CHECKOUT_PATH.exec(new URL(checkout.url()).pathname)?.[1]
      if (!processId) throw new Error(`Could not read the process id from ${checkout.url()}`)

      // Before paying: the wallet cannot cover the publish, which is why we are here.
      const price = await saas.getProcessPrice(token, processId)
      expect(price.totalCents).toBeGreaterThan(0)
      const walletBefore = await saas.getWallet(token, orgAddress)
      expect(walletBefore.balanceCents).toBeLessThan(price.totalCents)

      await expect(page.getByTestId('process-checkout-pay')).toBeVisible({ timeout: 60_000 })
      await fillStripeCheckout(page)
      await page.getByTestId('process-checkout-pay').click()

      // The browser follows the backend: the process page opens only after the
      // webhook credited the wallet, the wallet paid the publish and the process
      // was published.
      await page.waitForURL(new RegExp(`/admin/process/${processId}$`), { timeout: 5 * 60_000 })
      await expect
        .poll(async () => (await saas.getProcess(token, processId)).published, { timeout: 3 * 60_000 })
        .toBe(true)

      // Ledger, read back from the API: the top-up credited the wallet by at least
      // the price, the publish was debited from it, and nothing went negative.
      const walletAfter = await saas.getWallet(token, orgAddress)
      const credit = walletAfter.history.find((entry) => entry.kind === 'topup')
      expect(credit, 'a top-up entry in the wallet history').toBeDefined()
      expect(credit?.amountCents).toBeGreaterThanOrEqual(price.totalCents)

      const debit = walletAfter.history.find(
        (entry) => entry.kind === 'payment' && entry.processId?.toLowerCase() === processId.toLowerCase()
      )
      expect(debit, 'a payment entry debiting this process').toBeDefined()
      expect(debit?.amountCents).toBeLessThan(0)
      expect(walletAfter.balanceCents).toBeGreaterThanOrEqual(0)
    } finally {
      // Runs after a failure too, so a broken run does not leave open sessions behind.
      if (orgAddress) await stripe.cleanupCheckoutSessions(orgAddress, sinceUnix)
    }
  })
})
