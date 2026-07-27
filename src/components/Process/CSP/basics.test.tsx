import { renderHook } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AllProviders } from '~src/test-utils'
import { useCspAuth0 } from './basics'

const { auth0 } = vi.hoisted(() => ({ auth0: vi.fn() }))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  return {
    ...actual,
    useProcess: () => ({ auth0 }),
  }
})

const messages = {
  participantNotFound: 'The voter is not listed in the census, or the provided credentials are incorrect.',
  requestsOnCooldown: 'Too many requests. Please wait a moment before trying again.',
  zeroVotingWeight: "You don't have enough voting power to access the election.",
}

const mockAuthError = (code: number, error = 'server error') => {
  auth0.mockRejectedValue(new VocdoniApiError(400, { code, error }, error, code))
}

beforeEach(() => {
  auth0.mockReset()
})

describe('useCspAuth0 errors', () => {
  it('maps 40029 to participant not found message', async () => {
    mockAuthError(40029)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.participantNotFound)
  })

  it('maps 40103 to requests on cooldown message', async () => {
    mockAuthError(40103)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.requestsOnCooldown)
  })

  it('maps 40801 to zero voting weight message', async () => {
    mockAuthError(40801)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.zeroVotingWeight)
  })

  it('keeps the API message for unmapped codes', async () => {
    mockAuthError(50000, 'unexpected failure')
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow('unexpected failure')
  })
})
