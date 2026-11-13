import { VocdoniApiClient } from '@vocdoni/api-client'

/**
 * Stripe and saas-backend clients for the pay-per-process checkout spec. Stripe
 * calls create real test-mode objects, so the spec must clean up what it opens.
 */

const STRIPE_API_URL = 'https://api.stripe.com/v1'

/** Waits before each retry of a 429 or 5xx answer; the list's length caps the retries. */
const RETRY_DELAYS_MS = [1000, 2000, 4000]

/** Refuses live keys (secret, restricted or publishable): the e2e suite must never touch production. */
const assertTestKey = (key: string, variable: string): string => {
  if (/^(sk|rk|pk)_live_/.test(key)) {
    throw new Error(`${variable} is a live key: refusing to create objects in a production account`)
  }
  return key
}

class StripeError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'StripeError'
  }
}

/** Lets a cleanup step pass when Stripe says the object is gone, or no longer open. */
const ignoreStatus =
  (...statuses: number[]) =>
  (error: unknown): undefined => {
    if (error instanceof StripeError && statuses.includes(error.status)) return undefined
    throw error
  }

export type StripeCheckoutSession = {
  id: string
  status: 'open' | 'complete' | 'expired' | (string & {})
  customer: string | null
  metadata: Record<string, string> | null
}

/**
 * Stripe REST client for one account. Writes are form-encoded, which is what
 * Stripe expects.
 */
export const createStripeClient = (secretKey: string) => {
  const send = async (method: 'GET' | 'POST' | 'DELETE', path: string, form?: Record<string, string>) => {
    for (let attempt = 0; ; attempt += 1) {
      const response = await fetch(`${STRIPE_API_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        },
        body: form ? new URLSearchParams(form) : undefined,
      })
      const retryDelay = RETRY_DELAYS_MS[attempt]
      if (retryDelay === undefined || (response.status !== 429 && response.status < 500)) return response
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }

  const request = async <T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    form?: Record<string, string>
  ): Promise<T> => {
    const response = await send(method, path, form)
    // Read as text first, so an error body that is not JSON still reports its status.
    const text = await response.text()
    let body: (T & { error?: { message?: string } }) | undefined
    try {
      body = JSON.parse(text)
    } catch {
      body = undefined
    }
    if (!response.ok) {
      throw new StripeError(
        response.status,
        `Stripe ${method} ${path} failed: ${response.status} ${body?.error?.message ?? (text.slice(0, 200) || 'no error message')}`
      )
    }
    return body as T
  }

  /** Every checkout session created at or after `sinceUnix`, following Stripe's pagination. */
  const listCheckoutSessions = async (sinceUnix: number): Promise<StripeCheckoutSession[]> => {
    const sessions: StripeCheckoutSession[] = []
    let startingAfter: string | undefined
    do {
      const query = new URLSearchParams({ 'created[gte]': String(sinceUnix), limit: '100' })
      if (startingAfter) query.set('starting_after', startingAfter)
      const page = await request<{ data: StripeCheckoutSession[]; has_more: boolean }>(
        'GET',
        `/checkout/sessions?${query}`
      )
      sessions.push(...page.data)
      startingAfter = page.data.at(-1)?.id
      if (!page.has_more) break
    } while (startingAfter)
    return sessions
  }

  const expireCheckoutSession = (sessionId: string): Promise<StripeCheckoutSession> =>
    request<StripeCheckoutSession>('POST', `/checkout/sessions/${sessionId}/expire`)

  const deleteCustomer = (customerId: string): Promise<{ deleted: boolean }> =>
    request<{ deleted: boolean }>('DELETE', `/customers/${customerId}`)

  /**
   * Expires this org's open top-up sessions since `sinceUnix` and deletes their
   * customers, collecting every failure into one AggregateError. Paid sessions
   * cannot be deleted, so only their customer goes.
   */
  const cleanupCheckoutSessions = async (orgAddress: string, sinceUnix: number): Promise<void> => {
    const wanted = orgAddress.toLowerCase()
    const sessions = (await listCheckoutSessions(sinceUnix)).filter(
      (session) => session.metadata?.wallet_topup_org?.toLowerCase() === wanted
    )
    const errors: unknown[] = []
    for (const session of sessions) {
      // A 400 is Stripe's "no longer open" answer, which counts as expired.
      if (session.status === 'open') {
        await expireCheckoutSession(session.id)
          .catch(ignoreStatus(400, 404))
          .catch((error: unknown) => errors.push(error))
      }
      // Its own step: a failed expire must not skip the customer.
      if (session.customer) {
        await deleteCustomer(session.customer)
          .catch(ignoreStatus(404))
          .catch((error: unknown) => errors.push(error))
      }
    }
    if (errors.length > 0) {
      throw new AggregateError(errors, `Stripe cleanup failed for ${errors.length} of ${sessions.length} sessions`)
    }
  }

  return { cleanupCheckoutSessions }
}

export type StripeClient = ReturnType<typeof createStripeClient>

/**
 * saas-backend reads for the spec, through the Integrator SDK. The SDK keeps one
 * bearer per client, and each user's JWT is its own, so every authenticated call
 * builds a client for its token.
 */
export const createSaasClient = (apiUrl: string) => {
  const asUser = (token: string) => new VocdoniApiClient({ apiUrl, authToken: token })

  return {
    /** POST /auth/login. Returns the JWT for the authenticated calls below. */
    login: async (email: string, password: string): Promise<string> => {
      const session = await new VocdoniApiClient({ apiUrl }).auth.login(email, password)
      return session.token
    },

    /** The addresses of the organizations the logged-in user belongs to (GET /auth/addresses). */
    getOrganizationAddresses: async (token: string): Promise<string[]> =>
      (await asUser(token).auth.addresses()).addresses,

    /** Wallet balance and ledger of an organization (GET /organizations/{address}/wallet). */
    getWallet: (token: string, address: string) => asUser(token).organizations.getWallet(address, { limit: 100 }),

    /** Quote and payment status of a process (GET /processes/{id}/price). */
    getProcessPrice: (token: string, processId: string) => asUser(token).elections.getPrice(processId),

    /** A process as the backend stores it (GET /processes/{id}). `published` flips once the publish lands. */
    getProcess: (token: string, processId: string) => asUser(token).elections.get(processId),
  }
}

export type SaasClient = ReturnType<typeof createSaasClient>

/**
 * Clients for the local integration stack, read from its env. Throws when either
 * Stripe key is missing or live, so call it only after the spec's skip check.
 */
export const localStack = (): { stripe: StripeClient; saas: SaasClient } => {
  const key = process.env.INTEGRATION_STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('INTEGRATION_STRIPE_SECRET_KEY is not set: this spec needs Stripe mode')
  }
  if (!process.env.INTEGRATION_STRIPE_PUBLIC_KEY) {
    throw new Error('INTEGRATION_STRIPE_PUBLIC_KEY is not set: the app needs the test publishable key (pk_test_...)')
  }
  assertTestKey(process.env.INTEGRATION_STRIPE_PUBLIC_KEY, 'INTEGRATION_STRIPE_PUBLIC_KEY')
  const saasUrl = (process.env.SAAS_URL || `http://localhost:${process.env.INTEGRATION_HOST_PORT || 8080}`).replace(
    /\/$/,
    ''
  )
  return {
    stripe: createStripeClient(assertTestKey(key, 'INTEGRATION_STRIPE_SECRET_KEY')),
    saas: createSaasClient(saasUrl),
  }
}
