import type { MultilingualText, Organization } from '@vocdoni/api-types'

/** The active organization's address, for request code that cannot run without one. */
export const requireOrganizationAddress = (organization?: { address?: string } | null): string => {
  if (!organization?.address) throw new Error('No organization loaded')
  return organization.address
}

/**
 * The organization display name, as a locale map ready for localization.
 *
 * The SaaS API stores the name under `meta.name` and only mirrors it onto the top-level
 * `name` shorthand — reading `name` alone leaves organizations nameless on deployments
 * whose backend predates that mirror, which is what made the voting page legal notice
 * print the raw hex address instead of the organization name.
 *
 * Both slots may also still hold the pre-normalization plain-string form, so accept it
 * and lift it into the `default` locale.
 */
export const getOrganizationName = (
  organization?: Pick<Organization, 'name' | 'meta'> | null
): MultilingualText | undefined => {
  const name: unknown = organization?.name ?? organization?.meta?.name

  if (typeof name === 'string') return name ? { default: name } : undefined
  if (!name || typeof name !== 'object') return undefined

  return name as MultilingualText
}
