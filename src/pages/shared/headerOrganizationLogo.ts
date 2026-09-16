import type { LocalizedText } from '~src/legacy/vochain-archive'
import type { PublicProcessPageData } from '~src/ssr/public-pages'
import { getLocalizedRawText } from '~utils/localized-text'

/**
 * The organization branding the header needs when SHOW_ORG_LOGO is on: an image
 * URL plus the name used for its alt text.
 */
export type HeaderOrganizationLogo = {
  src: string
  name?: string
}

/**
 * Same locale-map resolution the SSR meta builders use, so the header agrees
 * with the rest of the page, mapped to `undefined` for "nothing to show".
 */
const localize = (value: LocalizedText | undefined, language: string): string | undefined =>
  getLocalizedRawText(value, language) || undefined

/**
 * Picks the organization logo to show in the header of a process page, for both
 * eras: the SaaS organization carries a `logo` locale map, while archive-era
 * organizations only expose a single `account.avatar` URL.
 *
 * Returns `undefined` when the organization has no logo, which is what keeps the
 * Vocdoni logo in place instead.
 */
export const getHeaderOrganizationLogo = (
  data: PublicProcessPageData | undefined
): HeaderOrganizationLogo | undefined => {
  if (!data) return undefined

  const language = data.meta.language

  if (data.era === 'archive') {
    const src = data.legacyOrganization?.account?.avatar?.trim()

    return src ? { src, name: localize(data.legacyOrganization?.account?.name, language) } : undefined
  }

  const src = localize(data.organization?.logo, language)

  return src ? { src, name: localize(data.organization?.name, language) } : undefined
}
