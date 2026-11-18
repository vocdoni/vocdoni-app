import type { AuthRequest } from '@vocdoni/api-types'

type AuthFormValues = Record<string, string | undefined>

/**
 * The auth step 0 request from the identify form's values: the census's auth fields, trimmed, and the one contact
 * input routed to `email` or `phone` (to `email` when it holds an "@" and the census accepts both). Shared by the
 * identify dialog (Step0) and the voter page. The password still goes as typed: the caller hashes it.
 */
export const buildCspAuthRequest = (
  values: AuthFormValues,
  authFields: readonly string[],
  twoFaFields: readonly string[]
): AuthRequest => {
  const trimmed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  ) as AuthFormValues
  const request: Record<string, string> = {}
  for (const field of authFields) {
    const value = trimmed[field]
    if (value) request[field] = value
  }
  const contact = trimmed.contact
  if (contact) {
    const email = twoFaFields.includes('email')
    const phone = twoFaFields.includes('phone')
    if (email && phone) request[contact.includes('@') ? 'email' : 'phone'] = contact
    else if (email) request.email = contact
    else if (phone) request.phone = contact
  }
  return request as AuthRequest
}
