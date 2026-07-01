import { fireEvent, render, screen, waitFor } from '~src/test-utils'

const provisionMutateAsync = vi.fn()
const signerRefresh = vi.fn()
const selectOrganization = vi.fn()

vi.mock('~src/queries/account', () => ({
  useProfile: vi.fn(),
}))

vi.mock('~src/queries/integrators', () => ({
  useProvisionIntegratorOrganization: vi.fn(() => ({ mutateAsync: provisionMutateAsync, isPending: false })),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(() => ({ signerRefresh })),
}))

vi.mock('~components/Auth/useAuthProvider', () => ({
  LocalStorageKeys: { SignerAddress: 'signerAddress' },
}))

vi.mock('~components/Dashboard/Menu/useSelectOrganization', () => ({
  useSelectOrganization: vi.fn(() => selectOrganization),
}))

vi.mock('~components/Dashboard/Menu/useOrganizationNames', () => ({
  useOrganizationNames: vi.fn(() => ({ data: {} })),
}))

import { useProfile } from '~src/queries/account'
import NotIntegratorNotice from './NotIntegratorNotice'

const mockProfile = (addresses: string[]) =>
  vi.mocked(useProfile).mockReturnValue({
    data: {
      organizations: addresses.map((address) => ({ role: 'admin', organization: { address, isIntegrator: false } })),
    },
  } as any)

describe('NotIntegratorNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('asks for confirmation before creating and only provisions on confirm', async () => {
    mockProfile(['0xregular'])
    provisionMutateAsync.mockResolvedValue({ address: '0xnew' })

    render(<NotIntegratorNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator organization' }))

    // Confirmation dialog opens without provisioning yet.
    expect(await screen.findByText('Create a free integrator organization?')).toBeInTheDocument()
    expect(provisionMutateAsync).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Create organization' }))

    await waitFor(() => expect(provisionMutateAsync).toHaveBeenCalledTimes(1))
    expect(localStorage.getItem('signerAddress')).toBe('0xnew')
    expect(signerRefresh).toHaveBeenCalled()
  })

  it('does not provision when the confirmation is cancelled', async () => {
    mockProfile(['0xregular'])

    render(<NotIntegratorNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator organization' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByText('Create a free integrator organization?')).not.toBeInTheDocument())
    expect(provisionMutateAsync).not.toHaveBeenCalled()
  })

  it('offers switching to an existing org only when the user owns more than one', async () => {
    mockProfile(['0xa'])

    const { unmount } = render(<NotIntegratorNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator organization' }))

    await screen.findByText('Create a free integrator organization?')
    expect(screen.queryByText('Or switch to an existing organization')).not.toBeInTheDocument()
    unmount()

    mockProfile(['0xa', '0xb'])
    render(<NotIntegratorNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator organization' }))

    expect(await screen.findByText('Or switch to an existing organization')).toBeInTheDocument()
  })
})
