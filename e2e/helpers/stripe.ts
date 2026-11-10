import type { ProcessPriceResponse, WalletResponse } from '@vocdoni/api-types'

/**
 * Stripe and saas-backend clients for the pay-per-process checkout spec. Stripe
 * calls create real test-mode objects, so the spec must clean up what it opens.
 */

const STRIPE_API_URL = 'https://api.stripe.com/v1'

/** Refuses live keys: every client here writes test objects, and must never touch production. */
export const assertTestKey = (key: string, variable: string): string => {
  if (/^(sk|rk)_live_/.test(key)) {
    throw new Error(`${variable} is a live key: refusing to create objects in a production account`)
  }
  return key
}

export class StripeError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'StripeError'
  }
}

/** Lets a cleanup step pass when the object is already gone. */
const ignoreNotFound = (error: unknown): undefined => {
  if (error instanceof StripeError && error.status === 404) return undefined
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
export const createStripeClient = (secretKey: string, baseUrl = STRIPE_API_URL) => {
  const request = async <T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    form?: Record<string, string>
  ): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: form ? new URLSearchParams(form) : undefined,
    })
    const body = (await response.json()) as T & { error?: { message?: string } }
    if (!response.ok) {
      throw new StripeError(
        response.status,
        `Stripe ${method} ${path} failed: ${response.status} ${body.error?.message ?? 'no error message'}`
      )
    }
    return body
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
   * Expires the still-open top-up sessions of one organization created since
   * `sinceUnix`, and deletes their customers. Matching is on the
   * `wallet_topup_org` metadata, compared case-insensitively. Objects already
   * gone (404) are skipped.
   *
   * Completed payments cannot be deleted in Stripe, so a paid session stays in
   * the test account; only its customer record is removed.
   */
  const cleanupCheckoutSessions = async (orgAddress: string, sinceUnix: number): Promise<void> => {
    const wanted = orgAddress.toLowerCase()
    const sessions = (await listCheckoutSessions(sinceUnix)).filter(
      (session) => session.metadata?.wallet_topup_org?.toLowerCase() === wanted
    )
    for (const session of sessions) {
      if (session.status === 'open') await expireCheckoutSession(session.id).catch(ignoreNotFound)
      if (session.customer) await deleteCustomer(session.customer).catch(ignoreNotFound)
    }
  }

  return { cleanupCheckoutSessions }
}

export type StripeClient = ReturnType<typeof createStripeClient>

export type SaasOrganization = {
  address: string
}

export type SaasUserOrganization = {
  role: string
  organization: SaasOrganization | null
}

/**
 * saas-backend client for the reads the spec needs. Every call except `login`
 * needs the JWT that `login` returns.
 */
export const createSaasClient = (baseUrl: string) => {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, init)
    if (!response.ok) {
      throw new Error(
        `saas-backend ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`
      )
    }
    return (await response.json()) as T
  }

  const bearer = (token: string): RequestInit => ({ headers: { Authorization: `Bearer ${token}` } })

  return {
    /** POST /auth/login. Returns the JWT for the authenticated calls below. */
    login: async (email: string, password: string): Promise<string> => {
      const data = await request<{ token: string }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return data.token
    },

    /** The organizations the logged-in user belongs to (GET /users/me). */
    getUserOrganizations: async (token: string): Promise<SaasUserOrganization[]> => {
      const data = await request<{ organizations: SaasUserOrganization[] }>('/users/me', bearer(token))
      return data.organizations
    },

    /** Wallet balance and ledger of an organization (GET /organizations/{address}/wallet). */
    getWallet: (token: string, address: string): Promise<WalletResponse> =>
      request<WalletResponse>(`/organizations/${address}/wallet?limit=100`, bearer(token)),

    /** Quote and payment status of a process (GET /processes/{id}/price). */
    getProcessPrice: (token: string, processId: string): Promise<ProcessPriceResponse> =>
      request<ProcessPriceResponse>(`/processes/${processId}/price`, bearer(token)),

    /** A process as the backend stores it (GET /processes/{id}). `published` flips once the publish lands. */
    getProcess: (token: string, processId: string): Promise<{ published: boolean }> =>
      request<{ published: boolean }>(`/processes/${processId}`, bearer(token)),
  }
}

export type SaasClient = ReturnType<typeof createSaasClient>

/**
 * Clients for the local integration stack, read from its env. Throws when
 * INTEGRATION_STRIPE_SECRET_KEY is missing or live, so call it only after the
 * spec's skip check.
 */
export const localStack = (): { stripe: StripeClient; saas: SaasClient } => {
  const key = process.env.INTEGRATION_STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('INTEGRATION_STRIPE_SECRET_KEY is not set: this spec needs Stripe mode')
  }
  const saasUrl = (process.env.SAAS_URL || `http://localhost:${process.env.INTEGRATION_HOST_PORT || 8080}`).replace(
    /\/$/,
    ''
  )
  return {
    stripe: createStripeClient(assertTestKey(key, 'INTEGRATION_STRIPE_SECRET_KEY')),
    saas: createSaasClient(saasUrl),
  }
}
