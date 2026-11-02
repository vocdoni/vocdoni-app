import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { OrganizationsUnavailable } from './OrganizationsUnavailable'
import { OrganizationGate } from './OrganizationGate'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

describe('OrganizationGate', () => {
  it('passes children through when there is no active address and no addresses', () => {
    // No address and no addresses → account has no orgs; pass through to onboarding
    setAuthMock({ currentAddress: undefined, addresses: [] })
    setReactProvidersMock({
      useOrganization: () => ({ organization: null, error: null, fetch: vi.fn() }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows the loader when currentAddress is undefined but addresses exist and organization is null', () => {
    // Addresses loaded but selection not applied yet (useEffect pending) → keep gate closed
    setAuthMock({ currentAddress: undefined, addresses: ['0x123'] })
    setReactProvidersMock({
      useOrganization: () => ({ organization: null, error: null, fetch: vi.fn() }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows the loader when address is set but organization has not loaded yet', () => {
    setAuthMock({ currentAddress: '0x123' })
    setReactProvidersMock({
      useOrganization: () => ({ organization: null, error: null, fetch: vi.fn() }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('passes children through when address is set and organization is loaded', () => {
    setAuthMock({ currentAddress: '0x123' })
    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0x123' }, error: null, fetch: vi.fn() }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows the unavailable screen on error and calls fetch on retry', async () => {
    const mockFetch = vi.fn().mockResolvedValue(undefined)
    setAuthMock({ currentAddress: '0x123' })
    setReactProvidersMock({
      useOrganization: () => ({ organization: null, error: new Error('failed'), fetch: mockFetch }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    const button = await screen.findByRole('button', { name: /try again/i })
    await userEvent.click(button)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('stays on the error screen without throwing when fetch rejects', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network'))
    setAuthMock({ currentAddress: '0x123' })
    setReactProvidersMock({
      useOrganization: () => ({ organization: null, error: new Error('failed'), fetch: mockFetch }),
    })
    render(
      <OrganizationGate>
        <div>content</div>
      </OrganizationGate>
    )
    const button = await screen.findByRole('button', { name: /try again/i })
    await userEvent.click(button)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // Button remains enabled so the user can retry
    expect(screen.getByRole('button', { name: /try again/i })).not.toBeDisabled()
  })

  it('OrganizationsUnavailable without onRetry calls refreshAddresses', async () => {
    const refreshAddresses = vi.fn().mockResolvedValue(undefined)
    setAuthMock({ currentAddress: '0x123', refreshAddresses })
    render(<OrganizationsUnavailable />)
    const button = await screen.findByRole('button', { name: /try again/i })
    await userEvent.click(button)
    expect(refreshAddresses).toHaveBeenCalledTimes(1)
  })
})
