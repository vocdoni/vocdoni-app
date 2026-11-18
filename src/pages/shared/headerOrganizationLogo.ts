import type { ProcessBrand } from '~utils/process-brand'

/** The organization logo the header shows instead of the Vocdoni mark: an image URL plus the name for its alt text. */
export type HeaderOrganizationLogo = {
  src: string
  name?: string
}

/**
 * The header logo of a process page, from the brand its loader resolved (see `resolveProcessBrand`). `undefined`
 * keeps the Vocdoni mark: no brand (a page data without one), or a brand that shows no logo.
 */
export const headerLogoFromBrand = (brand: ProcessBrand | undefined): HeaderOrganizationLogo | undefined =>
  brand?.logo ? { src: brand.logo, name: brand.name || undefined } : undefined
