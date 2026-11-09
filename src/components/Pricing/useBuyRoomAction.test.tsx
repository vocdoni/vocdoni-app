import { ApiErrorCode } from '@vocdoni/api-client'
import { act, renderHook } from '@testing-library/react'
import { ApiError } from '~components/Auth/api'
import { censusCheckoutPath, useBuyRoomAction } from './useBuyRoomAction'

const navigate = vi.hoisted(() => vi.fn())
const access = vi.hoisted(() => ({ canTopUp: true }))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => navigate,
}))

vi.mock('~queries/wallet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/wallet')>()),
  useWalletAccess: () => ({ canView: true, canTopUp: access.canTopUp }),
}))

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const growth = (data: Record<string, unknown> = {}) =>
  new ApiError(
    {
      error: 'payment required',
      code: ApiErrorCode.PaymentRequired,
      data: { processId, censusSize: 700, dueCents: 2000, totalCents: 31000, shortfallCents: 1500, ...data },
    },
    new Response(null, { status: 402 })
  )

describe('censusCheckoutPath', () => {
  it('builds the census checkout route with the size, due and shortfall', () => {
    expect(censusCheckoutPath({ processId, censusSize: 700, dueCents: 2000, shortfallCents: 1500 })).toBe(
      `/admin/process/${processId}/census/checkout?size=700&due=2000&shortfall=1500`
    )
  })

  it('leaves the shortfall out when the refusal does not say it', () => {
    expect(censusCheckoutPath({ processId, censusSize: 700, dueCents: 2000 })).toBe(
      `/admin/process/${processId}/census/checkout?size=700&due=2000`
    )
  })
})

describe('useBuyRoomAction', () => {
  beforeEach(() => {
    navigate.mockReset()
    access.canTopUp = true
  })

  it('offers Add voter places to an admin for a census-growth refusal, and opens the checkout on click', () => {
    const { result } = renderHook(() => useBuyRoomAction())

    const action = result.current(growth())
    expect(action?.label).toBe('Add voter places')
    act(() => action?.onClick())

    expect(navigate).toHaveBeenCalledWith(
      `/admin/process/${processId}/census/checkout?size=700&due=2000&shortfall=1500`
    )
  })

  it('offers nothing to a non-admin, who could not add places', () => {
    access.canTopUp = false
    const { result } = renderHook(() => useBuyRoomAction())

    expect(result.current(growth())).toBeUndefined()
  })

  it('offers nothing for an error that is not a census-growth refusal', () => {
    const { result } = renderHook(() => useBuyRoomAction())

    expect(result.current(new Error('network down'))).toBeUndefined()
    expect(result.current(growth({ censusSize: 50001 }))).toBeUndefined()
  })
})
