import { act, renderHook } from '@testing-library/react'
import {
  clearStoredDraftId,
  DraftIdsStorageKey,
  getStoredDraftId,
  LegacyDraftIdStorageKey,
  storeDraftId,
  useStoredDraftId,
} from './draft-storage'

const OrgA = '0xaaa0000000000000000000000000000000000001'
const OrgB = '0xbbb0000000000000000000000000000000000002'

describe('draft-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getStoredDraftId / storeDraftId', () => {
    it('returns null when nothing is stored', () => {
      expect(getStoredDraftId(OrgA)).toBeNull()
    })

    it('round-trips a draft id for an organization', () => {
      storeDraftId(OrgA, 'draft-1')
      expect(getStoredDraftId(OrgA)).toBe('draft-1')
    })

    it('does not return a draft id stored for a different organization', () => {
      // Regression: a draft saved while acting as org A must never leak into org B,
      // where updating it fails with permission errors
      storeDraftId(OrgA, 'draft-1')
      expect(getStoredDraftId(OrgB)).toBeNull()
    })

    it('keeps a draft id per organization', () => {
      storeDraftId(OrgA, 'draft-1')
      storeDraftId(OrgB, 'draft-2')
      expect(getStoredDraftId(OrgA)).toBe('draft-1')
      expect(getStoredDraftId(OrgB)).toBe('draft-2')
    })

    it('normalizes addresses (case and 0x prefix)', () => {
      storeDraftId('AAA0000000000000000000000000000000000001', 'draft-1')
      expect(getStoredDraftId('0xAaA0000000000000000000000000000000000001')).toBe('draft-1')
    })

    it('clears only the given organization entry when storing null', () => {
      storeDraftId(OrgA, 'draft-1')
      storeDraftId(OrgB, 'draft-2')
      storeDraftId(OrgA, null)
      expect(getStoredDraftId(OrgA)).toBeNull()
      expect(getStoredDraftId(OrgB)).toBe('draft-2')
    })

    it('returns null for a missing address', () => {
      storeDraftId(OrgA, 'draft-1')
      expect(getStoredDraftId(null)).toBeNull()
      expect(getStoredDraftId(undefined)).toBeNull()
    })

    it('ignores writes without an address', () => {
      storeDraftId(null, 'draft-1')
      expect(localStorage.getItem(DraftIdsStorageKey)).toBeNull()
    })

    it('survives corrupted storage contents', () => {
      localStorage.setItem(DraftIdsStorageKey, 'not-json')
      expect(getStoredDraftId(OrgA)).toBeNull()
      storeDraftId(OrgA, 'draft-1')
      expect(getStoredDraftId(OrgA)).toBe('draft-1')
    })
  })

  describe('clearStoredDraftId', () => {
    it('clears the entry when it points to the given draft', () => {
      storeDraftId(OrgA, 'draft-1')
      clearStoredDraftId(OrgA, 'draft-1')
      expect(getStoredDraftId(OrgA)).toBeNull()
    })

    it('keeps the entry when it points to a different draft', () => {
      storeDraftId(OrgA, 'draft-1')
      clearStoredDraftId(OrgA, 'draft-2')
      expect(getStoredDraftId(OrgA)).toBe('draft-1')
    })
  })

  describe('useStoredDraftId', () => {
    it('returns the stored draft id for the given organization', () => {
      storeDraftId(OrgA, 'draft-1')
      const { result } = renderHook(() => useStoredDraftId(OrgA))
      expect(result.current[0]).toBe('draft-1')
    })

    it('persists ids through its setter', () => {
      const { result } = renderHook(() => useStoredDraftId(OrgA))
      act(() => result.current[1]('draft-1'))
      expect(result.current[0]).toBe('draft-1')
      expect(getStoredDraftId(OrgA)).toBe('draft-1')
    })

    it('forgets the previous organization draft when the address changes', () => {
      // Regression: switching organization must not keep exposing the old org's draft id
      storeDraftId(OrgA, 'draft-1')
      const { result, rerender } = renderHook(({ address }) => useStoredDraftId(address), {
        initialProps: { address: OrgA },
      })
      expect(result.current[0]).toBe('draft-1')

      rerender({ address: OrgB })
      expect(result.current[0]).toBeNull()
    })

    it('picks up the stored draft id once the address becomes available', () => {
      storeDraftId(OrgA, 'draft-1')
      const { result, rerender } = renderHook(({ address }) => useStoredDraftId(address), {
        initialProps: { address: undefined as string | undefined },
      })
      expect(result.current[0]).toBeNull()

      rerender({ address: OrgA })
      expect(result.current[0]).toBe('draft-1')
    })

    it('drops the legacy un-scoped draft-id key and never exposes it', () => {
      // Pre-scoping clients stored a bare draft id with no owner info; it cannot be
      // trusted against the current org, so it must be discarded
      localStorage.setItem(LegacyDraftIdStorageKey, JSON.stringify('draft-legacy'))
      const { result } = renderHook(() => useStoredDraftId(OrgA))
      expect(result.current[0]).toBeNull()
      expect(localStorage.getItem(LegacyDraftIdStorageKey)).toBeNull()
    })
  })
})
