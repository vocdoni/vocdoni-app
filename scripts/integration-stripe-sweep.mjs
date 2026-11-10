#!/usr/bin/env node
// Backstop for Stripe mode (integration/README.md): expires the test checkout
// sessions a run left open and deletes their customers. The payg spec cleans up
// in its own finally, but a cancelled or timed-out job never reaches it.
//
// Only sessions of organizations of THIS stack are touched: a session's
// metadata.wallet_topup_org must answer 200 on GET {SAAS_URL}/organizations/{address}.
// A 404 means another stack, so a concurrent run on the same sandbox is left alone.
//
// Usage:
//   node scripts/integration-stripe-sweep.mjs [--since <unix seconds>]
//
// Env:
//   INTEGRATION_STRIPE_SECRET_KEY  test secret key (sk_test_...). Unset: nothing to do, exit 0.
//   SAAS_URL                       saas-backend base URL (default http://localhost:8080)
//
// Failures print as ::warning:: lines and the exit code stays 0: this is a
// backstop, and a leftover object must not turn a finished run red.
import { pathToFileURL } from 'node:url'

const STRIPE_API_URL = 'https://api.stripe.com/v1'
const LOOKBACK_SECONDS = 3 * 60 * 60
const RETRY_DELAYS_MS = [1000, 2000, 4000]
// Bounds every call: the sweep runs under always(), often on a cancelled job, and must not hang it.
const REQUEST_TIMEOUT_MS = 15_000

export const isLiveKey = (key) => /^(sk|rk|pk)_live_/.test(key)

class StripeHttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const isStatus = (error, statuses) => error instanceof StripeHttpError && statuses.includes(error.status)

const defaultDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Sweeps the test checkout sessions created since `sinceUnix` for the
 * organizations of the stack at `saasUrl`. Per-object failures are collected in
 * the report; only a failed session listing throws.
 */
export async function sweepStripeObjects({ secretKey, saasUrl, sinceUnix, fetchImpl = fetch, delay = defaultDelay }) {
  if (isLiveKey(secretKey)) throw new Error('the Stripe key is a live key: refusing to touch a production account')
  const saasBase = saasUrl.replace(/\/$/, '')

  // 429 and 5xx are retried with a short backoff; every other answer is final.
  const stripe = async (method, path, form) => {
    for (let attempt = 0; ; attempt += 1) {
      const response = await fetchImpl(`${STRIPE_API_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        },
        body: form ? new URLSearchParams(form) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const retryDelay = RETRY_DELAYS_MS[attempt]
      if (retryDelay !== undefined && (response.status === 429 || response.status >= 500)) {
        await delay(retryDelay)
        continue
      }
      const text = await response.text()
      let body
      try {
        body = JSON.parse(text)
      } catch {
        body = undefined
      }
      if (!response.ok) {
        const reason = body?.error?.message ?? (text.slice(0, 200) || 'no error message')
        throw new StripeHttpError(response.status, `Stripe ${method} ${path} failed: ${response.status} ${reason}`)
      }
      return body
    }
  }

  const sessions = []
  let startingAfter
  do {
    const query = new URLSearchParams({ 'created[gte]': String(sinceUnix), limit: '100' })
    if (startingAfter) query.set('starting_after', startingAfter)
    const page = await stripe('GET', `/checkout/sessions?${query}`)
    sessions.push(...page.data)
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined
  } while (startingAfter)

  // Cached per address: one lookup per organization, however many sessions it has.
  const ownership = new Map()
  const isOwnOrganization = async (address) => {
    if (!ownership.has(address)) {
      const response = await fetchImpl(`${saasBase}/organizations/${encodeURIComponent(address)}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      // Anything but 200 or 404 (say, a 401 from a changed API) must not read as "another stack".
      if (response.status !== 200 && response.status !== 404) {
        throw new Error(`saas-backend GET /organizations/${address} answered ${response.status}`)
      }
      ownership.set(address, response.status === 200)
    }
    return ownership.get(address)
  }

  const report = { listed: sessions.length, ours: 0, expired: 0, customersDeleted: 0, failures: [] }
  for (const session of sessions) {
    const address = session.metadata?.wallet_topup_org
    if (!address) continue
    let own
    try {
      own = await isOwnOrganization(address)
    } catch (error) {
      report.failures.push(`session ${session.id}: ${error.message}`)
      continue
    }
    if (!own) continue
    report.ours += 1

    if (session.status === 'open') {
      try {
        await stripe('POST', `/checkout/sessions/${session.id}/expire`)
        report.expired += 1
      } catch (error) {
        // 400 is Stripe's "no longer open" answer, so the session closed since the listing.
        if (!isStatus(error, [400, 404])) report.failures.push(`expire ${session.id}: ${error.message}`)
      }
    }
    // Its own try: a failed expire must not skip the customer.
    if (session.customer) {
      try {
        await stripe('DELETE', `/customers/${session.customer}`)
        report.customersDeleted += 1
      } catch (error) {
        if (!isStatus(error, [404])) report.failures.push(`delete customer ${session.customer}: ${error.message}`)
      }
    }
  }
  return report
}

/** CLI body. Returns the exit code; the entry point below exits with it. */
export async function main(argv, env = process.env) {
  const secretKey = env.INTEGRATION_STRIPE_SECRET_KEY || ''
  if (!secretKey) return 0
  if (isLiveKey(secretKey)) {
    console.error('ERROR: INTEGRATION_STRIPE_SECRET_KEY is a live key. Use a test-mode key (sk_test_...).')
    return 1
  }

  const flag = argv.indexOf('--since')
  const sinceUnix = flag === -1 ? Math.floor(Date.now() / 1000) - LOOKBACK_SECONDS : Number(argv[flag + 1])
  if (!Number.isInteger(sinceUnix) || sinceUnix <= 0) {
    console.error('usage: integration-stripe-sweep.mjs [--since <unix seconds>]')
    return 1
  }

  const saasUrl = env.SAAS_URL || `http://localhost:${env.INTEGRATION_HOST_PORT || 8080}`
  const since = new Date(sinceUnix * 1000).toISOString()
  try {
    const report = await sweepStripeObjects({ secretKey, saasUrl, sinceUnix })
    console.log(
      `stripe sweep since ${since}: ${report.listed} checkout sessions listed, ${report.ours} of this stack, ` +
        `${report.expired} expired, ${report.customersDeleted} customers deleted, ${report.failures.length} failures`
    )
    for (const failure of report.failures) console.log(`::warning::stripe sweep: ${failure}`)
  } catch (error) {
    console.log(`::warning::stripe sweep could not run: ${error.message}`)
  }
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => process.exit(code))
}
