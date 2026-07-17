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

// Capture the props DeleteModal is rendered with so we can assert the dialog is locked while
// provisioning (ESC + outside interaction disabled) without simulating Chakra's dismiss internals.
let deleteModalProps: Record<string, any> = {}
vi.mock('~components/Modal/DeleteModal', () => ({
  default: (props: any) => {
    deleteModalProps = props
    if (!props.open) return null
    return (
      <div>
        <div>{props.title}</div>
        <div>{props.subtitle}</div>
        {props.children}
      </div>
    )
  },
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

vi.mock('~queries/organization', () => ({
  useOrganizationNames: vi.fn(() => ({ data: {} })),
}))

import { useProfile } from '~src/queries/account'
import { useProvisionIntegratorOrganization } from '~src/queries/integrators'
import NotIntegratorNotice from './NotIntegratorNotice'

const mockProfile = (addresses: string[]) =>
  vi.mocked(useProfile).mockReturnValue({
    data: {
      organizations: addresses.map((address) => ({ role: 'admin', isIntegrator: false, organization: { address } })),
    },
  } as any)

describe('NotIntegratorNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // clearAllMocks resets call data but not implementations, so re-establish the default here to keep
    // the locking test's mockReturnValue(isPending: true) from leaking into any later test.
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue({
      mutateAsync: provisionMutateAsync,
      isPending: false,
    } as any)
  })

  it('asks for confirmation before creating and only provisions on confirm', async () => {
    mockProfile(['0xregular'])
    provisionMutateAsync.mockResolvedValue({ address: '0xnew' })

    render(<NotIntegratorNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator account' }))

    // Confirmation dialog opens without provisioning yet.
    expect(await screen.findByText('Create a free integrator account?')).toBeInTheDocument()
    expect(provisionMutateAsync).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(provisionMutateAsync).toHaveBeenCalledTimes(1))
    expect(localStorage.getItem('signerAddress')).toBe('0xnew')
    expect(signerRefresh).toHaveBeenCalled()
  })

  it('does not provision when the confirmation is cancelled', async () => {
    mockProfile(['0xregular'])

    render(<NotIntegratorNotice />)

    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator account' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByText('Create a free integrator account?')).not.toBeInTheDocument())
    expect(provisionMutateAsync).not.toHaveBeenCalled()
  })

  it('offers switching to an existing org only when the user owns more than one', async () => {
    mockProfile(['0xa'])

    const { unmount } = render(<NotIntegratorNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator account' }))

    await screen.findByText('Create a free integrator account?')
    expect(screen.queryByText('Or switch to an existing organization')).not.toBeInTheDocument()
    unmount()

    mockProfile(['0xa', '0xb'])
    render(<NotIntegratorNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator account' }))

    expect(await screen.findByText('Or switch to an existing organization')).toBeInTheDocument()
  })

  it('locks the dialog and disables Cancel/switch actions while provisioning', async () => {
    mockProfile(['0xa', '0xb'])
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue({
      mutateAsync: provisionMutateAsync,
      isPending: true,
    } as any)

    render(<NotIntegratorNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Create a free integrator account' }))

    await screen.findByText('Create a free integrator account?')

    // Dialog can't be dismissed via ESC or outside interaction while the request is in-flight.
    expect(deleteModalProps.closeOnEscape).toBe(false)
    expect(deleteModalProps.closeOnInteractOutside).toBe(false)

    // Cancel and the switch-org buttons are disabled so the user can't bail mid-provision.
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    // Org names are mocked empty, so each switch button falls back to rendering its address as its label.
    expect(screen.getByRole('button', { name: '0xa' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '0xb' })).toBeDisabled()
  })
})
