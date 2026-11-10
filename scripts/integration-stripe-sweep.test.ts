import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { sweepStripeObjects } from './integration-stripe-sweep.mjs'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-stripe-sweep.mjs')
const SAAS = 'http://saas.test'
const OURS = '0xaaaa'
const FOREIGN = '0xbbbb'

type Json = Record<string, unknown>

const json = (status: number, body: Json = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const session = (id: string, org: string, status: string, customer: string | null) => ({
  id,
  status,
  customer,
  metadata: { wallet_topup_org: org },
})

/**
 * A fake of the two APIs the sweep calls. `stripe` answers per "METHOD path"
 * (a function, or a list of answers consumed in order); saas answers 200 for
 * the stack's own organization and 404 for everything else.
 */
const fakeFetch = (stripe: Record<string, Json | Response | (() => Response)>) => {
  const calls: string[] = []
  const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    if (url.startsWith(SAAS)) {
      calls.push(`saas ${url}`)
      return url.endsWith(`/organizations/${OURS}`) ? json(200, { address: OURS }) : json(404, {})
    }
    const path = url.replace('https://api.stripe.com/v1', '')
    const key = `${method} ${path.split('?')[0]}`
    calls.push(`${method} ${path}`)
    const answer = stripe[key]
    if (answer === undefined) throw new Error(`unexpected ${key}`)
    if (answer instanceof Response) return answer.clone()
    if (typeof answer === 'function') return answer()
    return json(200, answer)
  })
  return { fetchImpl, calls }
}

const sweep = (fetchImpl: typeof fetch, sinceUnix = 1_700_000_000) =>
  sweepStripeObjects({
    secretKey: 'sk_test_fake',
    saasUrl: SAAS,
    sinceUnix,
    fetchImpl,
    delay: async () => {},
  })

describe('integration-stripe-sweep.mjs', () => {
  it('refuses a live key before any request', async () => {
    const { fetchImpl } = fakeFetch({})
    await expect(
      sweepStripeObjects({ secretKey: 'sk_live_x', saasUrl: SAAS, sinceUnix: 1, fetchImpl, delay: async () => {} })
    ).rejects.toThrow(/live key/)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('expires and deletes only the open sessions of this stack, and deletes customers of closed ones too', async () => {
    const { fetchImpl, calls } = fakeFetch({
      'GET /checkout/sessions': {
        data: [
          session('cs_open_ours', OURS, 'open', 'cus_1'),
          session('cs_open_foreign', FOREIGN, 'open', 'cus_2'),
          session('cs_complete_ours', OURS, 'complete', 'cus_3'),
          session('cs_expired_ours', OURS, 'expired', null),
        ],
        has_more: false,
      },
      'POST /checkout/sessions/cs_open_ours/expire': { id: 'cs_open_ours', status: 'expired' },
      'DELETE /customers/cus_1': { deleted: true },
      'DELETE /customers/cus_3': { deleted: true },
    })

    const report = await sweep(fetchImpl)

    expect(report).toEqual({ listed: 4, ours: 3, expired: 1, customersDeleted: 2, failures: [] })
    expect(calls).not.toContain('POST /checkout/sessions/cs_open_foreign/expire')
    expect(calls).not.toContain('DELETE /customers/cus_2')
    expect(calls).not.toContain('POST /checkout/sessions/cs_complete_ours/expire')
  })

  it('follows Stripe pagination with starting_after', async () => {
    let page = 0
    const { fetchImpl, calls } = fakeFetch({
      'GET /checkout/sessions': () => {
        page += 1
        return page === 1
          ? json(200, { data: [session('cs_1', FOREIGN, 'complete', null)], has_more: true })
          : json(200, { data: [session('cs_2', FOREIGN, 'complete', null)], has_more: false })
      },
    })

    const report = await sweep(fetchImpl)

    expect(report.listed).toBe(2)
    expect(calls.filter((call) => call.startsWith('GET /checkout/sessions'))).toHaveLength(2)
    expect(calls.some((call) => call.includes('starting_after=cs_1'))).toBe(true)
  })

  it('tolerates a 404 on delete and a 400 "no longer open" on expire', async () => {
    const { fetchImpl } = fakeFetch({
      'GET /checkout/sessions': { data: [session('cs_closed', OURS, 'open', 'cus_gone')], has_more: false },
      'POST /checkout/sessions/cs_closed/expire': () =>
        json(400, { error: { message: 'Only open sessions can be expired' } }),
      'DELETE /customers/cus_gone': () => json(404, { error: { message: 'No such customer' } }),
    })

    const report = await sweep(fetchImpl)

    expect(report.failures).toEqual([])
    expect(report.expired).toBe(0)
    expect(report.customersDeleted).toBe(0)
  })

  it('reports a failed expire but still deletes the customer', async () => {
    const { fetchImpl, calls } = fakeFetch({
      'GET /checkout/sessions': { data: [session('cs_bad', OURS, 'open', 'cus_bad')], has_more: false },
      'POST /checkout/sessions/cs_bad/expire': () => json(403, { error: { message: 'forbidden' } }),
      'DELETE /customers/cus_bad': { deleted: true },
    })

    const report = await sweep(fetchImpl)

    expect(calls).toContain('DELETE /customers/cus_bad')
    expect(report.customersDeleted).toBe(1)
    expect(report.failures).toEqual([expect.stringContaining('expire cs_bad: Stripe POST')])
  })

  it('retries a 429 before answering', async () => {
    let listed = 0
    const { fetchImpl } = fakeFetch({
      'GET /checkout/sessions': () => {
        listed += 1
        return listed === 1 ? json(429, {}) : json(200, { data: [], has_more: false })
      },
    })

    const report = await sweep(fetchImpl)

    expect(listed).toBe(2)
    expect(report.listed).toBe(0)
  })

  it('records a timed-out call as a failure and keeps sweeping', async () => {
    const timeout = () => {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
    }
    const { fetchImpl, calls } = fakeFetch({
      'GET /checkout/sessions': {
        data: [session('cs_slow', OURS, 'open', 'cus_slow'), session('cs_next', OURS, 'complete', 'cus_next')],
        has_more: false,
      },
      'POST /checkout/sessions/cs_slow/expire': timeout,
      'DELETE /customers/cus_slow': { deleted: true },
      'DELETE /customers/cus_next': { deleted: true },
    })

    const report = await sweep(fetchImpl)

    expect(report.failures).toEqual([expect.stringContaining('expire cs_slow: The operation was aborted')])
    expect(calls).toContain('DELETE /customers/cus_next')
    expect(report.customersDeleted).toBe(2)
  })

  it('does not touch a session whose organization answers neither 200 nor 404', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.startsWith(SAAS)) return json(401, {})
      return json(200, { data: [session('cs_unknown', OURS, 'open', 'cus_unknown')], has_more: false })
    })

    const report = await sweep(fetchImpl as unknown as typeof fetch)

    expect(report.ours).toBe(0)
    expect(report.failures).toEqual([expect.stringContaining('answered 401')])
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes('expire'))).toBe(false)
  })
})

describe('integration-stripe-sweep.mjs CLI', () => {
  const run = (env: Record<string, string>, args: string[] = []) =>
    spawnSync(process.execPath, [scriptPath, ...args], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '', ...env },
    })

  it('does nothing and exits 0 without the Stripe key', () => {
    const res = run({})
    expect(res.status).toBe(0)
    expect(res.stdout).toBe('')
  })

  it('refuses a live key with exit 1', () => {
    const res = run({ INTEGRATION_STRIPE_SECRET_KEY: 'sk_live_x' })
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('live key')
    expect(res.stderr).not.toContain('sk_live_x')
  })

  it('rejects a malformed --since with exit 1', () => {
    const res = run({ INTEGRATION_STRIPE_SECRET_KEY: 'sk_test_x' }, ['--since', 'yesterday'])
    expect(res.status).toBe(1)
  })
})
