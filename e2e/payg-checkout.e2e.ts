import type { Frame, Page } from '@playwright/test'
import type { ProcessCheckoutResponse } from '@vocdoni/api-types'
import { makeMembers } from './helpers/data'
import { fillProcessWizard, importMembers, signUpWithOrganization } from './helpers/flows'
import { expect, test } from './helpers/fixtures'
import { localStack, type SaasClient } from './helpers/stripe'

/**
 * Flow 4 — pay-per-process top-up against Stripe's test sandbox. Publishing past
 * the free census size is refused for lack of balance; the test pays through
 * Checkout Elements and checks the backend credited, debited and published.
 */

/** Above the backend's free census size (25): the process is not free. */
const PAID_CENSUS_SIZE = 26

/** `POST /processes/{id}/checkout`, the top-up view's session request. */
const CHECKOUT_PATH = /\/processes\/([^/]+)\/checkout$/

/** The checkout form is the only form on screen while the top-up view is open. */
const PAY_BUTTON = 'form:has(iframe[name^="__privateStripeFrame"]) button[type="submit"]'

/*
 * Stripe's frame names and field selectors are unverified against a live sandbox:
 * autocomplete tokens are the standard, the name attributes are the fallback.
 */
const CARD_NUMBER = 'input[autocomplete="cc-number"], input[name="number"]'
const CARD_EXPIRY = 'input[autocomplete="cc-exp"], input[name="expiry"]'
const CARD_CVC = 'input[autocomplete="cc-csc"], input[name="cvc"]'

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
const fillStripeCheckout = async (page: Page): Promise<void> => {
  // Split names (ProcessCheckout), so the name is two fields. Country first: it re-renders the rest.
  const address = await stripeFrame(page, '[autocomplete="address-line1"]')
  await address.locator('[autocomplete="country"]').selectOption('DE')
  await address.locator('[autocomplete="given-name"]').fill('E2E')
  await address.locator('[autocomplete="family-name"]').fill('Runner')
  await address.locator('[autocomplete="address-line1"]').fill('Unter den Linden 1')
  await address.locator('[autocomplete="postal-code"]').fill('10117')
  await address.locator('[autocomplete="address-level2"]').fill('Berlin')

  // Stripe's test card that succeeds without 3D Secure.
  const card = await stripeFrame(page, CARD_NUMBER)
  await card.locator(CARD_NUMBER).fill('4242424242424242')
  await card.locator(CARD_EXPIRY).fill('12 / 34')
  await card.locator(CARD_CVC).fill('123')
}

/** The organization the signup just created: the only one the new user belongs to. */
const organizationAddressOf = async (saas: SaasClient, token: string): Promise<string> => {
  const membership = (await saas.getUserOrganizations(token)).find((entry) => entry.organization)
  if (!membership?.organization) throw new Error('The new user has no organization')
  return membership.organization.address
}

test.describe('pay-per-process checkout', () => {
  // Stack in Stripe mode (integration/README.md#stripe-mode-opt-in).
  test.skip(
    !process.env.INTEGRATION_STRIPE_SECRET_KEY,
    'needs the stack in Stripe mode (INTEGRATION_STRIPE_SECRET_KEY)'
  )

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'runs in the chromium project only')
  })

  test('a wallet top-up pays for the publish and the process goes live', async ({ page }, testInfo) => {
    test.setTimeout(15 * 60_000)

    const { stripe, saas } = localStack()
    const seed = String(Date.now()).slice(-6)
    // Only sessions created from here on belong to this run.
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

      // Listened for before the click: the refused publish makes the top-up view open its session.
      const checkoutOpened = page.waitForResponse(
        (response) => response.request().method() === 'POST' && CHECKOUT_PATH.test(new URL(response.url()).pathname),
        { timeout: 60_000 }
      )
      await page.getByRole('button', { name: /^Publish$/ }).click()
      const checkout = await checkoutOpened
      expect(checkout.ok()).toBe(true)
      const session = (await checkout.json()) as ProcessCheckoutResponse
      const processId = CHECKOUT_PATH.exec(new URL(checkout.url()).pathname)?.[1]
      if (!processId) throw new Error(`Could not read the process id from ${checkout.url()}`)

      // Before paying, the wallet cannot cover the publish; that is why we are here.
      const price = await saas.getProcessPrice(token, processId)
      expect(price.totalCents).toBeGreaterThan(0)
      const walletBefore = await saas.getWallet(token, orgAddress)
      expect(walletBefore.balanceCents).toBeLessThan(price.totalCents)

      await expect(page.locator(PAY_BUTTON)).toBeVisible({ timeout: 60_000 })
      await fillStripeCheckout(page)
      await page.locator(PAY_BUTTON).click()

      // The page opens only after the webhook credited the wallet, the wallet paid
      // the publish and the backend published the process.
      await page.waitForURL(new RegExp(`/admin/process/${processId}$`), { timeout: 5 * 60_000 })
      await expect
        .poll(async () => (await saas.getProcess(token, processId)).published, { timeout: 3 * 60_000 })
        .toBe(true)

      // Ledger amounts are the backend's: the credit is the VAT-exclusive top-up, the debit the quoted price.
      const walletAfter = await saas.getWallet(token, orgAddress)
      const sameOrg = (address: string) => address.toLowerCase() === orgAddress?.toLowerCase()
      const credit = walletAfter.history.find((entry) => entry.kind === 'topup' && sameOrg(entry.orgAddress))
      expect(credit?.amountCents).toBe(session.amountCents)

      const debit = walletAfter.history.find(
        (entry) => entry.kind === 'payment' && entry.processId?.toLowerCase() === processId.toLowerCase()
      )
      expect(debit?.amountCents).toBe(-price.totalCents)
      expect(walletAfter.balanceCents).toBe(walletBefore.balanceCents + session.amountCents - price.totalCents)
    } finally {
      // Runs after a failure too. A cleanup error is reported, never thrown over the test's own failure.
      if (orgAddress) {
        await stripe.cleanupCheckoutSessions(orgAddress, sinceUnix).catch((error: unknown) => {
          const detail =
            error instanceof AggregateError
              ? error.errors.map((cause) => (cause instanceof Error ? cause.message : String(cause))).join('; ')
              : String(error)
          const message = `Stripe cleanup left checkout objects behind: ${detail}`
          console.warn(message)
          testInfo.annotations.push({ type: 'stripe-cleanup', description: message })
        })
      }
    }
  })
})
