import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import type { ApiKey } from '~src/queries/integrators'

const revokeMutateAsync = vi.fn()

vi.mock('~src/queries/integrators', () => ({
  API_KEY_SCOPES: ['quota:read', 'managed:read', 'managed:write', 'voting:write', 'members:write'],
  useApiKeys: vi.fn(),
  useRevokeApiKey: vi.fn(() => ({ mutateAsync: revokeMutateAsync, isPending: false })),
  useCreateApiKey: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useStatus: () => (k: ApiKey) => ({
    label: k.revoked ? 'Revoked' : k.expiresAt && new Date(k.expiresAt).getTime() < Date.now() ? 'Expired' : 'Active',
    palette: k.revoked ? 'red' : 'green',
  }),
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

  // The global matchMedia stub matches nothing, so useBreakpointValue resolves the `base` value
  // and the panel renders the mobile card list (no table element).
  it('renders stacked cards instead of a table on mobile', () => {
    mockKeys({ data: [key()] })

    render(<ApiKeysPanel />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('Last used')).toBeInTheDocument()
    expect(screen.getByText('Expires')).toBeInTheDocument()
  })

  it('renders the table on desktop widths', () => {
    // Pretend every media query matches (jsdom has no layout): min-width: 48em (md) then holds,
    // so useBreakpointValue resolves the `md` value and the table branch renders.
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    try {
      mockKeys({ data: [key()] })

      render(<ApiKeysPanel />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('vk_abc…')).toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
    }
  })

  it('shows an empty state when there are no keys', () => {
    mockKeys({ data: [] })

    render(<ApiKeysPanel />)

    expect(screen.getByText('No API keys yet')).toBeInTheDocument()
  })

  it('asks for confirmation before revoking and only revokes on confirm', async () => {
    mockKeys({ data: [key()] })

    render(<ApiKeysPanel />)

    fireEvent.click(screen.getByLabelText('Revoke key'))

    // Confirmation dialog opens without revoking yet.
    expect(await screen.findByText('Revoke API key?')).toBeInTheDocument()
    expect(revokeMutateAsync).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))

    await waitFor(() => expect(revokeMutateAsync).toHaveBeenCalledWith({ id: 'k1' }))
  })

  it('does not revoke when the confirmation is cancelled', async () => {
    mockKeys({ data: [key()] })

    render(<ApiKeysPanel />)

    fireEvent.click(screen.getByLabelText('Revoke key'))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByText('Revoke API key?')).not.toBeInTheDocument())
    expect(revokeMutateAsync).not.toHaveBeenCalled()
  })
})
