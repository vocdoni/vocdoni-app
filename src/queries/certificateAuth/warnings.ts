/** National ID validation warnings from census validation: who cannot sign in and why. */
export const NATIONAL_ID_WARNING_CLASSES = [
  'missing',
  'letter_mismatch',
  'unsupported_document',
  'invalid',
  'duplicate_after_normalization',
] as const

export type NationalIdWarningClass = (typeof NATIONAL_ID_WARNING_CLASSES)[number]
export type NationalIdWarning = { memberId: string; class: NationalIdWarningClass }

const CLASSES: ReadonlySet<string> = new Set(NATIONAL_ID_WARNING_CLASSES)

/**
 * The warnings carried by a validation body (200 body, or the 400's `data`). Null when the body has no
 * `nationalIdWarnings` at all: a backend from before SP1, whose 200 is a bare string.
 */
export const readNationalIdWarnings = (body: unknown): NationalIdWarning[] | null => {
  if (typeof body !== 'object' || body === null || !('nationalIdWarnings' in body)) return null
  const list = (body as { nationalIdWarnings: unknown }).nationalIdWarnings
  if (!Array.isArray(list)) return []
  return list.flatMap((entry): NationalIdWarning[] => {
    const memberId = (entry as { memberId?: unknown })?.memberId
    const cls = (entry as { class?: unknown })?.class
    return typeof memberId === 'string' && typeof cls === 'string' && CLASSES.has(cls)
      ? [{ memberId, class: cls as NationalIdWarningClass }]
      : []
  })
}

export type InvalidReason = 'letter' | 'not_dni'

/** O1 buckets and the saved summary, from one validation answer. */
export type CertificateCoverage = {
  /** Members who can't sign in: missing + invalid, each member once. */
  cannotSignIn: number
  missing: string[]
  invalid: { memberId: string; reason: InvalidReason }[]
  /** Blocking, as in develop's MemberCheck: the census can't tell them apart. Both of each pair. */
  duplicates: string[]
  /** Saved summary lines. */
  counts: { missing: number; letter: number; otherId: number }
}

export const certificateCoverage = (
  warnings: NationalIdWarning[] | null,
  fallback?: { missingData: string[]; duplicates: string[] }
): CertificateCoverage => {
  const missing = new Set<string>()
  const invalid = new Map<string, InvalidReason>()
  const duplicates = new Set<string>()
  if (warnings) {
    for (const w of warnings) {
      if (w.class === 'missing') missing.add(w.memberId)
      else if (w.class === 'letter_mismatch') invalid.set(w.memberId, 'letter')
      else if (w.class === 'unsupported_document' || w.class === 'invalid') invalid.set(w.memberId, 'not_dni')
      else duplicates.add(w.memberId)
    }
  } else if (fallback) {
    // Pre-SP1 backend: only empty values and raw duplicates are known.
    fallback.missingData.forEach((id) => missing.add(id))
    fallback.duplicates.forEach((id) => duplicates.add(id))
  }
  for (const id of missing) invalid.delete(id)
  const invalidList = [...invalid].map(([memberId, reason]) => ({ memberId, reason }))
  return {
    cannotSignIn: missing.size + invalidList.length,
    missing: [...missing],
    invalid: invalidList,
    duplicates: [...duplicates],
    counts: {
      missing: missing.size,
      letter: invalidList.filter((i) => i.reason === 'letter').length,
      otherId: invalidList.filter((i) => i.reason === 'not_dni').length,
    },
  }
}

/** Coverage from a settled check: SP1 warnings when the backend sends them, develop's lists otherwise. */
export const coverageFromCheck = (
  nationalIdWarnings: NationalIdWarning[] | null | undefined,
  issues: { missingData: string[]; duplicates: string[] } | null | undefined
): CertificateCoverage =>
  certificateCoverage(
    nationalIdWarnings ?? null,
    issues ? { missingData: issues.missingData, duplicates: issues.duplicates } : undefined
  )
