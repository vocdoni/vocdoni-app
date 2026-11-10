import type { TestInfo } from '@playwright/test'
import type { ProcessCheckoutResponse } from '@vocdoni/api-types'
import { makeMembers } from './helpers/data'
import { fillProcessWizard, importMembers, signUpWithOrganization } from './helpers/flows'
import { expect, test } from './helpers/fixtures'
import { fillStripeCheckout, payStripeCheckout } from './helpers/stripe-checkout'
import { localStack, type StripeClient, type SaasClient } from './helpers/stripe'

/**
 * Flow 5 — pay-per-process top-up against Stripe's test sandbox. Past the free
 * census size the wallet cannot cover the publish, so the review dialog leads to
 * its card step; the test pays through Checkout Elements and checks the backend
 * credited, debited and published.
 * A second test tops the wallet up from the billing page and checks the credit.
 */

/** Above the backend's free census size (25): the process is not free. */
const PAID_CENSUS_SIZE = 26

/** `POST /processes/{id}/checkout`, the top-up view's session request. */
const CHECKOUT_PATH = /\/processes\/([^/]+)\/checkout$/

/** `POST /organizations/{address}/wallet/topup`, the wallet top-up request. */
const WALLET_TOPUP_PATH = /\/organizations\/[^/]+\/wallet\/topup$/

/** The wallet top-up amount, typed in EUR and VAT excluded: the backend credits exactly this. */
const WALLET_TOPUP_EUR = '50'
const WALLET_TOPUP_CENTS = 5000

/** The organization the signup just created: the only one the new user belongs to. */
const organizationAddressOf = async (saas: SaasClient, token: string): Promise<string> => {
  const [address] = await saas.getOrganizationAddresses(token)
  if (!address) throw new Error('The new user has no organization')
  return address
}

/**
 * Expires and deletes the Stripe objects this run opened. A cleanup error is
 * annotated, never thrown: a rethrow makes Playwright's CI retry re-run the paid
 * journey. The sweep step in CI is the backstop.
 */
const cleanUpCheckoutSessions = async (
  stripe: StripeClient,
  orgAddress: string | undefined,
  sinceUnix: number,
  testInfo: TestInfo
): Promise<void> => {
  if (!orgAddress) return
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

      // Publish saves the draft and opens the review dialog. Its primary, the last button of its
      // footer, reads "Add … and publish" once the price and the short wallet are read.
      await page.getByRole('button', { name: /^Publish$/ }).click()
      const reviewPrimary = page.getByRole('dialog').getByRole('button').last()
      await expect(reviewPrimary).toHaveText(/and publish$/, { timeout: 60_000 })
      await expect(reviewPrimary).toBeEnabled()

      // Listened for before the click: the card step opens the top-up session.
      const checkoutOpened = page.waitForResponse(
        (response) => response.request().method() === 'POST' && CHECKOUT_PATH.test(new URL(response.url()).pathname),
        { timeout: 60_000 }
      )
      await reviewPrimary.click()
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

      await fillStripeCheckout(page)
      await payStripeCheckout(page)

      // The page opens only after the webhook credited the wallet, the wallet paid
      // the publish and the backend published the process.
      await page.waitForURL(new RegExp(`/admin/process/${processId}$`), { timeout: 5 * 60_000 })
      await expect
        .poll(async () => (await saas.getProcess(token, processId)).published, { timeout: 3 * 60_000 })
        .toBe(true)

      // Ledger amounts are the backend's: the credit is the VAT-exclusive top-up, the debit the quoted price.
      const walletAfter = await saas.getWallet(token, orgAddress)
      const credit = walletAfter.history.find((entry) => entry.kind === 'topup')
      expect(credit?.amountCents).toBe(session.amountCents)

      const debit = walletAfter.history.find(
        (entry) => entry.kind === 'payment' && entry.processId?.toLowerCase() === processId.toLowerCase()
      )
      expect(debit?.amountCents).toBe(-price.totalCents)
      expect(walletAfter.balanceCents).toBe(walletBefore.balanceCents + session.amountCents - price.totalCents)
    } finally {
      await cleanUpCheckoutSessions(stripe, orgAddress, sinceUnix, testInfo)
    }
  })

  test('tops up the wallet from the billing page', async ({ page }, testInfo) => {
    test.setTimeout(10 * 60_000)

    const { stripe, saas } = localStack()
    const seed = String(Date.now()).slice(-6)
    // Only sessions created from here on belong to this run.
    const sinceUnix = Math.floor(Date.now() / 1000)
    let orgAddress: string | undefined

    try {
      const user = await signUpWithOrganization(page, `Top-up Org ${seed}`)

      const token = await saas.login(user.email, user.password)
      const address = await organizationAddressOf(saas, token)
      orgAddress = address

      await page.goto('/admin/settings/billing')
      await page.getByRole('button', { name: 'Top up', exact: true }).click()
      // The top-up view's amount is the only number field on screen.
      await page.getByRole('spinbutton').fill(WALLET_TOPUP_EUR)

      // Listened for before the click: the session is requested as soon as the amount step is left.
      const topUpRequested = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' && WALLET_TOPUP_PATH.test(new URL(response.url()).pathname),
        { timeout: 60_000 }
      )
      await page.getByRole('button', { name: 'Continue to payment' }).click()
      const topUp = await topUpRequested
      expect(topUp.ok()).toBe(true)
      const session = (await topUp.json()) as ProcessCheckoutResponse
      expect(session.amountCents).toBe(WALLET_TOPUP_CENTS)

      const before = await saas.getWallet(token, address)
      await fillStripeCheckout(page)
      await payStripeCheckout(page)

      // The credit arrives with the verified webhook, so the balance is polled, not read once.
      await expect
        .poll(async () => (await saas.getWallet(token, address)).balanceCents, { timeout: 3 * 60_000 })
        .toBe(before.balanceCents + WALLET_TOPUP_CENTS)

      const wallet = await saas.getWallet(token, address)
      const credit = wallet.history.find((entry) => entry.kind === 'topup')
      expect(credit?.amountCents).toBe(WALLET_TOPUP_CENTS)
    } finally {
      await cleanUpCheckoutSessions(stripe, orgAddress, sinceUnix, testInfo)
    }
  })
})
