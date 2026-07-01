import { render, screen } from '~src/test-utils'
import type { ApiKey } from '~src/queries/integrators'

vi.mock('~src/queries/integrators', () => ({
  API_KEY_SCOPES: ['quota:read', 'managed:read', 'managed:write', 'voting:write', 'members:write'],
  useApiKeys: vi.fn(),
  useRevokeApiKey: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useCreateApiKey: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

import { useApiKeys } from '~src/queries/integrators'
import ApiKeysPanel from './ApiKeysPanel'

const key = (overrides: Partial<ApiKey> = {}): ApiKey => ({
  id: 'k1',
  label: 'CI pipeline',
  prefix: 'vk_abc',
  scopes: ['quota:read', 'managed:read'],
  createdBy: 'me',
  createdAt: '2025-01-01T00:00:00Z',
  revoked: false,
  ...overrides,
})

const mockKeys = (overrides = {}) =>
  vi.mocked(useApiKeys).mockReturnValue({ data: undefined, isLoading: false, error: null, ...overrides } as any)

describe('ApiKeysPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists API keys with prefix, scopes and status', () => {
    mockKeys({ data: [key()] })

    render(<ApiKeysPanel />)

    expect(screen.getByText('CI pipeline')).toBeInTheDocument()
    expect(screen.getByText('vk_abc…')).toBeInTheDocument()
    expect(screen.getByText('quota:read')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('marks a revoked key as Revoked', () => {
    mockKeys({ data: [key({ revoked: true })] })

    render(<ApiKeysPanel />)

    expect(screen.getByText('Revoked')).toBeInTheDocument()
  })

  it('shows an empty state when there are no keys', () => {
    mockKeys({ data: [] })

    render(<ApiKeysPanel />)

    expect(screen.getByText('No API keys yet')).toBeInTheDocument()
  })
})
