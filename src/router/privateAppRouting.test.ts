import { describe, expect, it } from 'vitest'
import { getPrivateAppRoot, isSelectedOrganizationIntegrator } from './privateAppRouting'

const mockProfile = (orgs: Array<{ address: string; integrator?: boolean }> = []) => ({
  organizations: orgs.map((org) => ({
    role: 'admin',
    isIntegrator: org.integrator,
    organization: {
      address: org.address,
      type: 'organization',
      size: 1,
      color: '#000000',
      logo: '',
      subdomain: '',
      timezone: 'UTC',
      active: true,
    },
  })),
})

describe('privateAppRouting helpers', () => {
  describe('isSelectedOrganizationIntegrator', () => {
    it('returns true when selected org is integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: true }])
      const result = isSelectedOrganizationIntegrator(profile, 'org1')
      expect(result).toBe(true)
    })

    it('returns false when selected org is not integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: false }])
      const result = isSelectedOrganizationIntegrator(profile, 'org1')
      expect(result).toBe(false)
    })

    it('returns false when selected org missing but first org is not integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: false }])
      const result = isSelectedOrganizationIntegrator(profile, 'unknown-address')
      expect(result).toBe(false)
    })

    it('returns true when selected org missing but first org is integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: true }])
      const result = isSelectedOrganizationIntegrator(profile, 'unknown-address')
      expect(result).toBe(true)
    })

    it('returns false when no organizations exist', () => {
      const profile = mockProfile([])
      const result = isSelectedOrganizationIntegrator(profile, 'any-address')
      expect(result).toBe(false)
    })
  })

  describe('getPrivateAppRoot', () => {
    it('returns /integrators when selected org is integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: true }])
      const result = getPrivateAppRoot(profile, 'org1')
      expect(result).toBe('/integrators')
    })

    it('returns /admin when selected org is not integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: false }])
      const result = getPrivateAppRoot(profile, 'org1')
      expect(result).toBe('/admin')
    })

    it('returns /integrators when selected org missing but first org is integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: true }])
      const result = getPrivateAppRoot(profile, 'unknown-address')
      expect(result).toBe('/integrators')
    })

    it('returns /admin when selected org missing but first org is not integrator', () => {
      const profile = mockProfile([{ address: 'org1', integrator: false }])
      const result = getPrivateAppRoot(profile, 'unknown-address')
      expect(result).toBe('/admin')
    })

    it('returns /admin as fallback when no organizations exist', () => {
      const profile = mockProfile([])
      const result = getPrivateAppRoot(profile, 'any-address')
      expect(result).toBe('/admin')
    })
  })
})
