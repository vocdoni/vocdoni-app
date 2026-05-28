const normalizeProcessId = (processId?: string) => processId?.trim().toLowerCase() || 'global'
const getBrowserPathScope = () =>
  typeof window === 'undefined' ? undefined : window.location.pathname?.trim().toLowerCase()
const getStorageScopes = (processId?: string) => {
  const scopes = [normalizeProcessId(processId)]

  if (!processId) {
    const browserPathScope = getBrowserPathScope()

    if (browserPathScope && !scopes.includes(browserPathScope)) {
      scopes.push(browserPathScope)
    }
  }

  return scopes
}

export const processCspIdentifierStorageKey = (processId?: string) =>
  `process-csp-identifier:${normalizeProcessId(processId)}`
export const processSpreadsheetIdentifierStorageKey = (processId?: string) =>
  `process-spreadsheet-identifier:${normalizeProcessId(processId)}`
export const processAuthenticatedLabelChangeEvent = 'process-authenticated-label-change'

type ProcessCspIdentifier = {
  method?: 'email' | 'phone'
  label?: string
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
  value?: string,
  label?: string
) => {
  if (typeof window === 'undefined') return

  const trimmed = value?.trim()
  if (!trimmed) return

  for (const scope of getStorageScopes(processId)) {
    window.localStorage.setItem(
      processCspIdentifierStorageKey(scope),
      JSON.stringify({ method, label: label?.trim(), value: trimmed })
    )
  }
  window.dispatchEvent(new Event(processAuthenticatedLabelChangeEvent))
}

export const storeProcessSpreadsheetIdentifier = (processId: string | undefined, label?: string, value?: string) => {
  if (typeof window === 'undefined') return

  const trimmed = value?.trim()
  if (!trimmed) return

  for (const scope of getStorageScopes(processId)) {
    window.localStorage.setItem(
      processSpreadsheetIdentifierStorageKey(scope),
      JSON.stringify({ label, value: trimmed })
    )
  }
  window.dispatchEvent(new Event(processAuthenticatedLabelChangeEvent))
}

export const clearProcessAuthenticatedIdentifiers = (processId?: string) => {
  if (typeof window === 'undefined') return

  if (!processId) {
    const keysToRemove: string[] = []

    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index)
      if (!key) continue
      if (key.startsWith('process-csp-identifier:') || key.startsWith('process-spreadsheet-identifier:')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key))
    window.dispatchEvent(new Event(processAuthenticatedLabelChangeEvent))
    return
  }

  for (const scope of getStorageScopes(processId)) {
    window.localStorage.removeItem(processCspIdentifierStorageKey(scope))
    window.localStorage.removeItem(processSpreadsheetIdentifierStorageKey(scope))
  }

  window.dispatchEvent(new Event(processAuthenticatedLabelChangeEvent))
}

export const readProcessCspIdentifier = (processId?: string) => {
  if (typeof window === 'undefined') return undefined

  for (const scope of getStorageScopes(processId)) {
    const stored = window.localStorage.getItem(processCspIdentifierStorageKey(scope))
    if (!stored) continue

    try {
      const parsed = JSON.parse(stored) as ProcessCspIdentifier
      if (!parsed?.value?.trim()) continue
      return {
        ...(parsed.method ? { method: parsed.method } : {}),
        ...(parsed.label?.trim() ? { label: parsed.label.trim() } : {}),
        value: parsed.value.trim(),
      }
    } catch {
      const value = stored.trim()
      if (value) return { value }
    }
  }

  return undefined
}

export const readProcessSpreadsheetIdentifier = (processId?: string) => {
  if (typeof window === 'undefined') return undefined

  for (const scope of getStorageScopes(processId)) {
    const stored = window.localStorage.getItem(processSpreadsheetIdentifierStorageKey(scope))
    if (!stored) continue

    try {
      const parsed = JSON.parse(stored) as ProcessSpreadsheetIdentifier
      if (!parsed?.value?.trim()) continue
      return {
        ...(parsed.label?.trim() ? { label: parsed.label.trim() } : {}),
        value: parsed.value.trim(),
      }
    } catch {
      const value = stored.trim()
      if (value) return { value }
    }
  }

  return undefined
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
  censusType: _censusType,
  censusMetaType: _censusMetaType,
  spreadsheetIdentifier,
  voter,
  cspIdentifier,
}: ProcessAuthLabelInput) => {
  if (!connected) return undefined

  if (_censusType === 'web3' || _censusMetaType === 'web3') return undefined

  if (cspIdentifier?.value?.trim()) {
    return {
      ...(cspIdentifier.method
        ? { label: cspIdentifier.method }
        : cspIdentifier.label?.trim()
          ? { label: cspIdentifier.label.trim() }
          : {}),
      value: cspIdentifier.value.trim(),
    }
  }

  const value = spreadsheetIdentifier?.value?.trim() || voter?.trim()
  if (value) {
    return {
      ...(spreadsheetIdentifier?.label?.trim() ? { label: spreadsheetIdentifier.label.trim() } : {}),
      value,
    }
  }

  return undefined
}
