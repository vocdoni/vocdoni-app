import type { Organization } from '@vocdoni/api-types'
import { toOrganizationData } from './SaasAccountProvider'

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
  active: true,
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
    expect(data.active).toBe(true)
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
    // No info yet: activity is unknown, not false.
    expect(data.active).toBeUndefined()
  })
})
