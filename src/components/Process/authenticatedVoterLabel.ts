export const processCspIdentifierStorageKey = (processId?: string) => `process-csp-identifier:${processId ?? 'global'}`
export const processSpreadsheetIdentifierStorageKey = (processId?: string) =>
  `process-spreadsheet-identifier:${processId ?? 'global'}`

type ProcessCspIdentifier = {
  method?: 'email' | 'phone'
  value: string
}

export type ProcessAuthenticatedLabel = {
  label?: string
  value: string
}

type ProcessSpreadsheetIdentifier = {
  label?: string
  value: string
}

export const storeProcessCspIdentifier = (
  processId: string | undefined,
  method?: 'email' | 'phone',
  value?: string
) => {
  if (typeof window === 'undefined') return

  const trimmed = value?.trim()
  if (!trimmed) return

  window.localStorage.setItem(processCspIdentifierStorageKey(processId), JSON.stringify({ method, value: trimmed }))
}

export const storeProcessSpreadsheetIdentifier = (processId: string | undefined, label?: string, value?: string) => {
  if (typeof window === 'undefined') return

  const trimmed = value?.trim()
  if (!trimmed) return

  window.localStorage.setItem(
    processSpreadsheetIdentifierStorageKey(processId),
    JSON.stringify({ label, value: trimmed })
  )
}

export const readProcessCspIdentifier = (processId?: string) => {
  if (typeof window === 'undefined') return undefined

  const stored = window.localStorage.getItem(processCspIdentifierStorageKey(processId))
  if (!stored) return undefined

  try {
    const parsed = JSON.parse(stored) as ProcessCspIdentifier
    if (!parsed?.value?.trim()) return undefined
    return {
      method: parsed.method,
      value: parsed.value.trim(),
    }
  } catch {
    const value = stored.trim()
    return value ? { value } : undefined
  }
}

export const readProcessSpreadsheetIdentifier = (processId?: string) => {
  if (typeof window === 'undefined') return undefined

  const stored = window.localStorage.getItem(processSpreadsheetIdentifierStorageKey(processId))
  if (!stored) return undefined

  try {
    const parsed = JSON.parse(stored) as ProcessSpreadsheetIdentifier
    if (!parsed?.value?.trim()) return undefined
    return {
      label: parsed.label?.trim(),
      value: parsed.value.trim(),
    }
  } catch {
    const value = stored.trim()
    return value ? { value } : undefined
  }
}

type ProcessAuthLabelInput = {
  connected?: boolean
  censusType?: string
  censusMetaType?: string
  spreadsheetIdentifier?: ProcessSpreadsheetIdentifier
  voter?: string
  cspIdentifier?: ProcessCspIdentifier
}

export const getProcessAuthenticatedLabel = ({
  connected,
  censusType,
  censusMetaType,
  spreadsheetIdentifier,
  voter,
  cspIdentifier,
}: ProcessAuthLabelInput) => {
  if (!connected) return undefined

  if (censusType === 'csp' || censusMetaType === 'csp') {
    if (!cspIdentifier?.value?.trim()) return undefined
    return {
      label: cspIdentifier.method,
      value: cspIdentifier.value.trim(),
    }
  }

  if (censusType === 'spreadsheet' || censusMetaType === 'spreadsheet') {
    const value = spreadsheetIdentifier?.value?.trim() || voter?.trim()
    if (!value) return undefined
    return {
      label: spreadsheetIdentifier?.label?.trim(),
      value,
    }
  }

  return undefined
}
