import { LocalStorageKeys } from '~components/Auth/useAuthProvider'

const IMPORT_JOB_STORAGE_KEY = 'memberbaseImportJobId'

const normalizeAccountId = (accountId: string | null) => accountId?.trim().toLowerCase() || null

export const getStoredImportJobId = (accountId: string | null): string | null => {
  const normalizedAccountId = normalizeAccountId(accountId)
  if (!normalizedAccountId) return null

  return localStorage.getItem(`${IMPORT_JOB_STORAGE_KEY}:${normalizedAccountId}`)
}

export const setStoredImportJobId = (jobId: string | null, accountId: string | null) => {
  const normalizedAccountId = normalizeAccountId(accountId)
  if (!normalizedAccountId) return

  const scopedStorageKey = `${IMPORT_JOB_STORAGE_KEY}:${normalizedAccountId}`

  if (!jobId) {
    localStorage.removeItem(scopedStorageKey)
    return
  }

  localStorage.setItem(scopedStorageKey, jobId)
  localStorage.removeItem(IMPORT_JOB_STORAGE_KEY)
}

/** Whose import jobs to read: the signed-in address, or the last one stored while it loads. */
export const readAccountId = (currentAddress?: string | null) => {
  if (currentAddress) return currentAddress
  try {
    return localStorage.getItem(LocalStorageKeys.SignerAddress)
  } catch {
    return null
  }
}
