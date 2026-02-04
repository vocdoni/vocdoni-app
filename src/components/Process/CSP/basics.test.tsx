import { renderHook } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { useTwoFactorAuth } from './basics'

const process = {
  census: {
    censusURI: 'https://census.example.test',
  },
} as any

const messages = {
  participantNotFound: 'The voter is not listed in the census, or the provided credentials are incorrect.',
  requestsOnCooldown: 'Too many requests. Please wait a moment before trying again.',
  zeroVotingWeight: "You don't have enough voting power to access the election.",
}

const mockFetchError = (code: number, error = 'server error') => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: vi.fn().mockResolvedValue({ code, error }),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useTwoFactorAuth errors', () => {
  it('maps 40029 to participant not found message', async () => {
    mockFetchError(40029)
    const { result } = renderHook(() => useTwoFactorAuth(process, 0), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.participantNotFound)
  })

  it('maps 40103 to requests on cooldown message', async () => {
    mockFetchError(40103)
    const { result } = renderHook(() => useTwoFactorAuth(process, 0), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.requestsOnCooldown)
  })

  it('maps 40801 to zero voting weight message', async () => {
    mockFetchError(40801)
    const { result } = renderHook(() => useTwoFactorAuth(process, 0), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.zeroVotingWeight)
  })
})
