import { VocdoniApiError } from '@vocdoni/api-client'
import { ErrorCode } from '~components/Auth/api'
import {
  paymentOutcome,
  publishPaidProcess,
  waitForPaymentOutcome,
  type ProcessCheckoutStatus,
} from './process-checkout'

const status = (overrides: Partial<ProcessCheckoutStatus> = {}): ProcessCheckoutStatus => ({
  status: 'pending',
  amountCents: 29700,
  currency: 'eur',
  ...overrides,
})

const publishInProgress = () =>
  new VocdoniApiError(409, {}, 'process publish already in progress', ErrorCode.PublishInProgress)

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

describe('paymentOutcome', () => {
  it('follows the stored payment, never the browser', () => {
    expect(paymentOutcome(status({ status: 'paid' }))).toBe('paid')
    expect(paymentOutcome(status({ status: 'processing' }))).toBe('processing')
    expect(paymentOutcome(status({ status: 'failed' }))).toBe('failed')
    expect(paymentOutcome(status({ status: 'refunded' }))).toBe('failed')
  })

  it('reads a pending payment from its session', () => {
    expect(paymentOutcome(status({ sessionStatus: 'open' }))).toBe('open')
    expect(paymentOutcome(status({ sessionStatus: 'expired' }))).toBe('failed')
    // Completed, but the webhook has not said whether it was paid
    expect(paymentOutcome(status({ sessionStatus: 'complete', sessionPaymentStatus: 'paid' }))).toBe('settling')
    expect(paymentOutcome(status())).toBe('settling')
  })
})

describe('waitForPaymentOutcome', () => {
  it('reads until the payment settles', async () => {
    const clock = fakeClock()
    const read = vi
      .fn()
      .mockResolvedValueOnce(status({ sessionStatus: 'complete' }))
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(status({ status: 'paid' }))

    await expect(waitForPaymentOutcome(read, clock)).resolves.toBe('paid')
    expect(read).toHaveBeenCalledTimes(3)
  })

  it('gives up after its time limit, backing off between reads', async () => {
    const clock = fakeClock()
    const read = vi.fn().mockResolvedValue(status({ sessionStatus: 'complete' }))

    await expect(
      waitForPaymentOutcome(read, { ...clock, intervalMs: 1000, maxIntervalMs: 4000, backoff: 2, timeoutMs: 20000 })
    ).resolves.toBe('timeout')
    expect(clock.sleeps).toEqual([1000, 2000, 4000, 4000, 4000, 4000])
    expect(read).toHaveBeenCalledTimes(7)
  })

  it('stops reading once aborted', async () => {
    const clock = fakeClock()
    const controller = new AbortController()
    const read = vi.fn().mockImplementation(async () => {
      controller.abort()
      return status({ status: 'paid' })
    })

    await expect(waitForPaymentOutcome(read, { ...clock, signal: controller.signal })).resolves.toBeUndefined()
    expect(read).toHaveBeenCalledTimes(1)
  })
})

describe('publishPaidProcess', () => {
  it('waits out the publication the payment already started', async () => {
    const clock = fakeClock()
    const publish = vi
      .fn()
      .mockRejectedValueOnce(publishInProgress())
      .mockResolvedValueOnce({ address: '0xabc', status: 'READY' })

    await expect(publishPaidProcess(publish, { sleep: clock.sleep })).resolves.toEqual({
      address: '0xabc',
      status: 'READY',
    })
    expect(publish).toHaveBeenCalledTimes(2)
  })

  it('gives up after a bounded number of attempts', async () => {
    const clock = fakeClock()
    const publish = vi.fn().mockRejectedValue(publishInProgress())

    await expect(publishPaidProcess(publish, { sleep: clock.sleep, attempts: 3 })).rejects.toBeInstanceOf(
      VocdoniApiError
    )
    expect(publish).toHaveBeenCalledTimes(3)
  })

  it('does not retry any other failure', async () => {
    const publish = vi.fn().mockRejectedValue(new Error('preflight failed'))

    await expect(publishPaidProcess(publish, { sleep: fakeClock().sleep })).rejects.toThrow('preflight failed')
    expect(publish).toHaveBeenCalledTimes(1)
  })
})
