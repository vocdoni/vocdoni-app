import type { Organization } from '@vocdoni/api-types'
import { organizationQueryKeys, OrganizationProvider, useOrganization } from '@vocdoni/react-components'
import { useState } from 'react'
import { act, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { SaasAccountProvider, toOrganizationData, useSaasAccount } from './SaasAccountProvider'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0x8ff37c7d6498da01c6cd190a0a2d9f8e6ba1b1ba' }),
}))

// A realistic `GET /organizations/{address}` payload (SAAS flat shape).
const saasOrganization: Organization = {
  address: '0x8ff37c7d6498da01c6cd190a0a2d9f8e6ba1b1ba',
  name: { default: 'Vocdoni Association', ca: 'Associació Vocdoni' },
  description: { default: 'Digital voting for everyone' },
  logo: { default: 'https://cdn.vocdoni.io/logo.png' },
  website: 'https://vocdoni.io',
  color: '#00744d',
  size: '11-50',
  type: 'nonprofit',
  country: 'ES',
  timezone: 'Europe/Madrid',
  createdAt: '2024-05-01T10:00:00Z',
}

describe('toOrganizationData', () => {
  it('nests the SAAS display fields under `.account` and keeps the flat fields', () => {
    const data = toOrganizationData(saasOrganization, undefined)

    expect(data.account).toEqual({
      name: { default: 'Vocdoni Association', ca: 'Associació Vocdoni' },
      description: { default: 'Digital voting for everyone' },
      // SAAS has no separate avatar/header: branding is `logo` (+ `color`).
      avatar: 'https://cdn.vocdoni.io/logo.png',
      header: '',
    })

    expect(data.address).toBe(saasOrganization.address)
    expect(data.website).toBe('https://vocdoni.io')
    expect(data.size).toBe('11-50')
    expect(data.type).toBe('nonprofit')
    expect(data.country).toBe('ES')
  })

  it('prefers the API-reported address over the session address', () => {
    const data = toOrganizationData(saasOrganization, '0xsession-address')

    expect(data.address).toBe(saasOrganization.address)
  })

  it('falls back to the session address and empty display fields while the info has not loaded', () => {
    const data = toOrganizationData(undefined, '0xsession-address')

    expect(data.address).toBe('0xsession-address')
    expect(data.account).toEqual({
      name: { default: '' },
      description: { default: '' },
      avatar: '',
      header: '',
    })
    expect(data.website).toBeUndefined()
  })
})

// This provider and the react-providers OrganizationProvider (mounted by DashboardShell)
// both read GET /organizations/{address}. They used to do so under different cache keys,
// which meant two requests on every dashboard load and an org edit that only refreshed one
// of them. They now share `organizationQueryKeys.organization(address)`.
describe('shared organization cache entry', () => {
  const address = saasOrganization.address
  const getMock = vi.fn()

  // Mirrors DashboardShell: the provider mounts later than SaasAccountProvider, because the
  // dashboard shell only renders once the auth and profile gates have passed.
  const LateProvider = () => {
    const [mounted, setMounted] = useState(false)
    mountShell = () => setMounted(true)
    if (!mounted) return null
    return (
      <OrganizationProvider id={address}>
        <ProviderReader />
      </OrganizationProvider>
    )
  }

  const ProviderReader = () => <div data-testid='provider-name'>{useOrganization().organization?.name.default}</div>
  const AccountReader = () => (
    <div data-testid='account-name'>{useSaasAccount().organization?.account.name.default}</div>
  )

  let mountShell: () => void

  beforeAll(async () => {
    // The suite globally stubs OrganizationProvider/useOrganization; this test needs the
    // real ones, since sharing the cache entry is precisely what it checks. The stubs are
    // thunks that resolve through setReactProvidersMock, so pointing them at the actual
    // implementations is enough — the imports above still reference the thunks.
    const actual = await vi.importActual<typeof import('@vocdoni/react-components')>('@vocdoni/react-components')
    setReactProvidersMock({
      OrganizationProvider: actual.OrganizationProvider,
      useOrganization: actual.useOrganization,
    })
  })

  beforeEach(() => {
    getMock.mockReset().mockResolvedValue(saasOrganization)
    setReactProvidersMock({ useClient: () => ({ client: { organizations: { get: getMock } } }) })
  })

  it('fetches the organization once for both readers', async () => {
    render(
      <SaasAccountProvider>
        <AccountReader />
        <LateProvider />
      </SaasAccountProvider>
    )

    // findByText, not findByTestId: the element renders immediately but empty, so keying on
    // the id would resolve before the query ever settled.
    expect(await screen.findByText('Vocdoni Association')).toBeTruthy()
    expect(getMock).toHaveBeenCalledTimes(1)

    // The shell mounts a real moment after the first read already resolved — the gap the
    // profile request creates in the app. Under the old split keys this was a second
    // request; sharing the key makes the late reader hit the existing entry instead.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    await act(async () => mountShell())

    expect(await screen.findByTestId('provider-name')).toHaveTextContent('Vocdoni Association')
    expect(getMock).toHaveBeenCalledTimes(1)
    expect(getMock).toHaveBeenCalledWith(address)
  })

  it('keys the read the same way on both sides', () => {
    expect(organizationQueryKeys.organization(address)).toEqual(['organization', address])
  })
})
