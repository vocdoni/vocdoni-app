import { renderHook } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessPaymentStatusResponse } from '@vocdoni/api-types'
import {
  clearPendingCheckout,
  isUnconfirmedPayment,
  readPendingCheckout,
  storePendingCheckout,
  useProcessCheckoutApi,
  validProcessId,
  waitForPublication,
} from './process-checkout'

const mockClient = vi.hoisted(() => ({
  elections: { checkout: vi.fn(), getCheckout: vi.fn(), cancelCheckout: vi.fn() },
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({ client: mockClient }),
}))

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const status = (overrides: Partial<ProcessPaymentStatusResponse> = {}): ProcessPaymentStatusResponse => ({
  status: 'pending',
  amountCents: 2000,
  currency: 'eur',
  ...overrides,
})

// Stuck on a completed session that Stripe has not confirmed: a delayed method such as SEPA debit
const unconfirmed = () => status({ sessionStatus: 'complete', sessionPaymentStatus: 'unpaid' })

// A clock that only moves when the poller sleeps, so the time limit is exact and instant
const fakeClock = () => {
  let time = 0
  const sleeps: number[] = []
  return {
    sleeps,
    now: () => time,
    sleep: async (ms: number) => {
      sleeps.push(ms)
      time += ms
    },
  }
}

describe('validProcessId', () => {
  it('accepts a process id', () => {
    expect(validProcessId(processId)).toBe(processId)
  })

  it('refuses anything else, which could resolve to another endpoint', () => {
    // Both survive encoding and would resolve to another endpoint
    expect(() => validProcessId('..')).toThrow()
    expect(() => validProcessId('.')).toThrow()
  })
})

describe('useProcessCheckoutApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens the checkout with the SDK body, return URL included', async () => {
    const body = { returnURL: 'https://app.test/admin/processes/create/return', locale: 'es' }
    mockClient.elections.checkout.mockResolvedValue({ clientSecret: 'cs', sessionId: 's', amountCents: 2000 })
    const { result } = renderHook(() => useProcessCheckoutApi())

    await result.current.checkout(processId, body)

    expect(mockClient.elections.checkout).toHaveBeenCalledWith(processId, body)
  })

  it('reads the stored payment and cancels the open checkout with the matching SDK methods', async () => {
    mockClient.elections.getCheckout.mockResolvedValue(status())
    mockClient.elections.cancelCheckout.mockResolvedValue(undefined)
    const { result } = renderHook(() => useProcessCheckoutApi())

    await result.current.getCheckout(processId)
    await result.current.cancelCheckout(processId)

    expect(mockClient.elections.getCheckout).toHaveBeenCalledWith(processId)
    expect(mockClient.elections.cancelCheckout).toHaveBeenCalledWith(processId)
  })

  it('refuses a process id that is not one before any request', () => {
    const { result } = renderHook(() => useProcessCheckoutApi())

    expect(() => result.current.getCheckout('..')).toThrow()
    expect(mockClient.elections.getCheckout).not.toHaveBeenCalled()
  })

  it('keeps the same functions across renders, so effects depending on them do not restart', () => {
    const { result, rerender } = renderHook(() => useProcessCheckoutApi())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})

describe('the pending checkout in sessionStorage', () => {
  afterEach(() => {
    clearPendingCheckout()
    vi.restoreAllMocks()
  })

  it('reads back the draft it was stored for, and forgets it once cleared', () => {
    storePendingCheckout(processId)

    expect(readPendingCheckout()).toBe(processId)

    clearPendingCheckout()
    expect(readPendingCheckout()).toBeUndefined()
  })

  it('ignores a stored value that does not name a process', () => {
    sessionStorage.setItem('process-checkout-pending', JSON.stringify({ draftId: '..' }))
    expect(readPendingCheckout()).toBeUndefined()

    sessionStorage.setItem('process-checkout-pending', 'not json')
    expect(readPendingCheckout()).toBeUndefined()
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => storePendingCheckout(processId)).not.toThrow()
    expect(readPendingCheckout()).toBeUndefined()
    expect(() => clearPendingCheckout()).not.toThrow()
  })
})

describe('isUnconfirmedPayment', () => {
  it('holds only for a completed session the payment of which is still unpaid', () => {
    expect(isUnconfirmedPayment(unconfirmed())).toBe(true)
    expect(isUnconfirmedPayment(status({ sessionStatus: 'complete', sessionPaymentStatus: 'paid' }))).toBe(false)
    expect(isUnconfirmedPayment(status({ sessionStatus: 'open', sessionPaymentStatus: 'unpaid' }))).toBe(false)
    expect(
      isUnconfirmedPayment(status({ status: 'paid', sessionStatus: 'complete', sessionPaymentStatus: 'unpaid' }))
    ).toBe(false)
  })
})

describe('waitForPublication', () => {
  it('resolves published as soon as the process is published, after one wait', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    await expect(waitForPublication(isPublished, clock)).resolves.toBe('published')
    expect(isPublished).toHaveBeenCalledTimes(2)
    expect(clock.sleeps).toEqual([2000])
  })

  it('backs off from 2 s towards 10 s, and gives up after 15 minutes', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)

    await expect(waitForPublication(isPublished, clock)).resolves.toBe('timeout')

    expect(clock.sleeps.slice(0, 4)).toEqual([2000, 3000, 4500, 6750])
    expect(clock.sleeps.every((ms) => ms <= 10000)).toBe(true)
    expect(clock.sleeps.at(-1)).toBe(10000)
    expect(clock.now()).toBeLessThanOrEqual(15 * 60 * 1000)
    expect(clock.now()).toBeGreaterThan(15 * 60 * 1000 - 10000)
  })

  it('times out with the given limit, without sleeping past it', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)

    await expect(
      waitForPublication(isPublished, { ...clock, intervalMs: 1000, maxIntervalMs: 4000, backoff: 2, timeoutMs: 10000 })
    ).resolves.toBe('timeout')

    expect(clock.sleeps).toEqual([1000, 2000, 4000])
    expect(clock.now()).toBe(7000)
  })

  it('retries a failed read, since the publication did not change because a request failed', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce(true)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(waitForPublication(isPublished, clock)).resolves.toBe('published')
    expect(isPublished).toHaveBeenCalledTimes(2)
  })

  it('does not wait on a process it is refused to read', async () => {
    const clock = fakeClock()
    const refusal = new VocdoniApiError(404, { error: 'not found' }, 'not found')
    const isPublished = vi.fn().mockRejectedValue(refusal)

    await expect(waitForPublication(isPublished, clock)).rejects.toBe(refusal)
    expect(isPublished).toHaveBeenCalledTimes(1)
    expect(clock.sleeps).toEqual([])
  })

  it('stops reading once aborted, and resolves to nothing', async () => {
    const clock = fakeClock()
    const controller = new AbortController()
    const isPublished = vi.fn().mockImplementation(async () => {
      controller.abort()
      return false
    })

    await expect(waitForPublication(isPublished, { ...clock, signal: controller.signal })).resolves.toBeUndefined()
    expect(isPublished).toHaveBeenCalledTimes(1)
    expect(clock.sleeps).toEqual([])
  })

  it('reports an unconfirmed payment once it has stayed unconfirmed for two minutes', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)
    const readPayment = vi.fn().mockResolvedValue(unconfirmed())

    await expect(waitForPublication(isPublished, { ...clock, readPayment })).resolves.toBe('unconfirmed')

    expect(clock.now()).toBeGreaterThanOrEqual(2 * 60 * 1000)
    expect(clock.now()).toBeLessThan(2 * 60 * 1000 + 10000)
    expect(readPayment).toHaveBeenCalledTimes(clock.sleeps.length + 1)
  })

  it('keeps waiting for a payment that is confirmed but not yet published', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)
    const readPayment = vi.fn().mockResolvedValue(status({ sessionStatus: 'complete', sessionPaymentStatus: 'paid' }))

    await expect(waitForPublication(isPublished, { ...clock, readPayment, timeoutMs: 3 * 60 * 1000 })).resolves.toBe(
      'timeout'
    )
  })

  it('keeps the unconfirmed timer through a failed payment read', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)
    const readPayment = vi
      .fn()
      .mockResolvedValueOnce(unconfirmed())
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValue(unconfirmed())

    await expect(waitForPublication(isPublished, { ...clock, readPayment })).resolves.toBe('unconfirmed')
    expect(readPayment.mock.calls.length).toBeGreaterThan(2)
  })

  it('does not report a payment it is refused to read as unconfirmed', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)
    const readPayment = vi.fn().mockRejectedValue(new VocdoniApiError(400, { error: 'no payment' }, 'no payment'))

    await expect(waitForPublication(isPublished, { ...clock, readPayment, timeoutMs: 60 * 1000 })).resolves.toBe(
      'timeout'
    )
  })
})

describe('waitForPublication outcomes of a payment', () => {
  it('reports unpaid at once when Stripe gave up on the payment', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValue(false)
    const readPayment = vi.fn().mockResolvedValue(status({ status: 'failed' }))

    await expect(waitForPublication(isPublished, { ...clock, readPayment })).resolves.toBe('unpaid')
    expect(clock.sleeps).toEqual([])
  })

  it('reports unpaid at once when the session expired', async () => {
    const clock = fakeClock()
    const readPayment = vi.fn().mockResolvedValue(status({ sessionStatus: 'expired' }))

    await expect(waitForPublication(vi.fn().mockResolvedValue(false), { ...clock, readPayment })).resolves.toBe(
      'unpaid'
    )
  })

  it('never reports a paid payment as unpaid, whatever its session says', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true)
    const readPayment = vi.fn().mockResolvedValue(status({ status: 'paid', sessionStatus: 'expired' }))

    await expect(waitForPublication(isPublished, { ...clock, readPayment })).resolves.toBe('published')
    const open = vi.fn().mockResolvedValue(status({ status: 'paid', sessionStatus: 'open' }))
    await expect(
      waitForPublication(vi.fn().mockResolvedValue(false), { ...fakeClock(), readPayment: open, timeoutMs: 60000 })
    ).resolves.toBe('timeout')
  })

  it('tolerates an open session during the grace period, then reports unpaid', async () => {
    const clock = fakeClock()
    const readPayment = vi.fn().mockResolvedValue(status({ sessionStatus: 'open' }))

    await expect(
      waitForPublication(vi.fn().mockResolvedValue(false), { ...clock, readPayment, openGraceMs: 30000 })
    ).resolves.toBe('unpaid')
    expect(clock.now()).toBeGreaterThanOrEqual(30000)
    expect(clock.now()).toBeLessThan(30000 + 10000)
  })

  it('keeps waiting on a payment that is still in progress before the grace period ends', async () => {
    const clock = fakeClock()
    const isPublished = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true)
    const readPayment = vi.fn().mockResolvedValue(status({ sessionStatus: 'open' }))

    await expect(waitForPublication(isPublished, { ...clock, readPayment, openGraceMs: 30000 })).resolves.toBe(
      'published'
    )
  })

  it('sleeps abortably, so an abandoned wait ends without waiting out its delay', async () => {
    const controller = new AbortController()
    const started = Date.now()
    setTimeout(() => controller.abort(), 20)

    await expect(
      waitForPublication(vi.fn().mockResolvedValue(false), { intervalMs: 60000, signal: controller.signal })
    ).resolves.toBeUndefined()
    expect(Date.now() - started).toBeLessThan(5000)
  })
})
