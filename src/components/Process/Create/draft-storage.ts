import { useCallback, useEffect, useState } from 'react'
import { ensure0x } from '~utils/address'

/**
 * Draft ids are scoped per organization address: a draft created while acting as one org
 * cannot be updated from another (the API rejects it with a permission error), so a single
 * un-scoped id would leak between orgs when the user switches organization or account.
 * Stored shape: { [lowercased 0x address]: draftId }
 */
export const DraftIdsStorageKey = 'draft-ids'
/** Pre-scoping key holding a bare draft id with no owner info; discarded on sight */
export const LegacyDraftIdStorageKey = 'draft-id'

const normalizeAddress = (address?: string | null): string | null => (address ? ensure0x(address).toLowerCase() : null)

const readDraftIds = (): Record<string, string> => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(DraftIdsStorageKey) ?? '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (e) {
    return {}
  }
}

export const getStoredDraftId = (address?: string | null): string | null => {
  const key = normalizeAddress(address)
  const draftId = key ? readDraftIds()[key] : null
  // Guard against hand-edited/corrupted entries holding non-string values
  return typeof draftId === 'string' ? draftId : null
}

export const storeDraftId = (address: string | null | undefined, draftId: string | null): void => {
  const key = normalizeAddress(address)
  if (!key || typeof localStorage === 'undefined') return
  const ids = readDraftIds()
  if (draftId) {
    ids[key] = draftId
  } else {
    delete ids[key]
  }
  localStorage.setItem(DraftIdsStorageKey, JSON.stringify(ids))
}

/** Clears the stored draft id for an org, but only when it currently points to the given draft */
export const clearStoredDraftId = (address: string | null | undefined, draftId: string): void => {
  if (getStoredDraftId(address) === draftId) {
    storeDraftId(address, null)
  }
}

export const useStoredDraftId = (address?: string | null): [string | null, (draftId: string | null) => void] => {
  const key = normalizeAddress(address)
  const [storedDraftId, setStoredDraftId] = useState<string | null>(() => getStoredDraftId(key))

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LegacyDraftIdStorageKey)
    }
  }, [])

  // Re-read when the org address changes (async account load or org switch)
  useEffect(() => {
    setStoredDraftId(getStoredDraftId(key))
  }, [key])

  const store = useCallback(
    (draftId: string | null) => {
      storeDraftId(key, draftId)
      setStoredDraftId(key ? draftId : null)
    },
    [key]
  )

  return [storedDraftId, store]
}
