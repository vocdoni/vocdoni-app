import { describe, expect, it } from 'vitest'
import { isViteInternalPath } from './vite-path-guard.mjs'

describe('isViteInternalPath', () => {
  describe('blocked paths (should return true)', () => {
    it('blocks /@fs/ filesystem probe', () => {
      expect(isViteInternalPath('/@fs/etc/passwd')).toBe(true)
    })

    it('blocks /@fs/ with trailing slash only', () => {
      expect(isViteInternalPath('/@fs/')).toBe(true)
    })

    it('blocks /@vite/client', () => {
      expect(isViteInternalPath('/@vite/client')).toBe(true)
    })

    it('blocks /@vite bare (no trailing slash — exact-match gap)', () => {
      expect(isViteInternalPath('/@vite')).toBe(true)
    })

    it('blocks /@react-refresh bare (original bug: regex required trailing slash)', () => {
      expect(isViteInternalPath('/@react-refresh')).toBe(true)
    })

    it('blocks /@react-refresh/transform', () => {
      expect(isViteInternalPath('/@react-refresh/transform')).toBe(true)
    })

    it('blocks /@id/some-module', () => {
      expect(isViteInternalPath('/@id/some-module')).toBe(true)
    })

    it('blocks /__vite_ping', () => {
      expect(isViteInternalPath('/__vite_ping')).toBe(true)
    })

    it('blocks any /__vite* path', () => {
      expect(isViteInternalPath('/__vitewhatever')).toBe(true)
    })
  })

  describe('allowed paths (should return false)', () => {
    it('allows SSR org page', () => {
      expect(isViteInternalPath('/en/organization/0xabc')).toBe(false)
    })

    it('allows SSR process page', () => {
      expect(isViteInternalPath('/en/processes/0xdef')).toBe(false)
    })

    it('allows /plans', () => {
      expect(isViteInternalPath('/plans')).toBe(false)
    })

    it('allows root /', () => {
      expect(isViteInternalPath('/')).toBe(false)
    })

    it('allows /account/signin', () => {
      expect(isViteInternalPath('/account/signin')).toBe(false)
    })

    it('does not block paths that merely contain "vite" in a non-internal position', () => {
      expect(isViteInternalPath('/vite-is-cool')).toBe(false)
    })

    it('does not block unknown /@-prefixed paths', () => {
      expect(isViteInternalPath('/@notaninternal/path')).toBe(false)
    })
  })
})
