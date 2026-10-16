const IMPORT_JOB_STORAGE_KEY = 'memberbaseImportJobId'
const IMPORT_JOB_META_STORAGE_KEY = 'memberbaseImportJobMeta'

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
    // A job dismissed before it finished is never tracked: drop its metadata too
    const previousJobId = localStorage.getItem(scopedStorageKey)
    if (previousJobId) localStorage.removeItem(`${IMPORT_JOB_META_STORAGE_KEY}:${previousJobId}`)
    localStorage.removeItem(scopedStorageKey)
    return
  }

  localStorage.setItem(scopedStorageKey, jobId)
  localStorage.removeItem(IMPORT_JOB_STORAGE_KEY)
}

/** What was imported, for `members_import_completed`: the file itself is gone by the time the job finishes. */
export type ImportJobMeta = {
  file_type: string
  rows: number
  encoding: string
}

export const setStoredImportJobMeta = (jobId: string, meta: ImportJobMeta) => {
  try {
    localStorage.setItem(`${IMPORT_JOB_META_STORAGE_KEY}:${jobId}`, JSON.stringify(meta))
  } catch {
    // Storage full or unavailable: the job simply goes untracked
  }
}

/**
 * Reads and forgets a job's metadata, so its completion is tracked exactly once
 * even though the progress alert remounts (tab switches, reloads) until dismissed.
 */
export const takeStoredImportJobMeta = (jobId: string): ImportJobMeta | null => {
  const key = `${IMPORT_JOB_META_STORAGE_KEY}:${jobId}`
  try {
    const stored = localStorage.getItem(key)
    localStorage.removeItem(key)
    return stored ? (JSON.parse(stored) as ImportJobMeta) : null
  } catch {
    return null
  }
}
