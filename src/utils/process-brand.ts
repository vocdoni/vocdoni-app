import type { Organization, VotingProcessResponse } from '@vocdoni/api-types'
import type { AppEnv } from '~src/app-env-build'
import type { LegacyOrganization } from '~src/legacy/vochain-archive'
import { normalizeHexColor } from '~theme/palette'
import { getLocalizedRawText, type LocalizedTextMap } from '~utils/localized-text'

/** How a public process page is branded. Resolved once on the server and carried in the page data. */
export type ProcessBrand = {
  /** Organisation logo URL for the page language, when the brand shows one (docs/ui-guidelines.md, "Brand per vote"). */
  logo?: string
  /** Validated #rrggbb colour, when the vote is branded and the organisation set one. */
  color?: string
  /** Organisation name for the page language; empty when the organisation has none. */
  name: string
  /** Whether the vote paid the branding add-on. */
  branded: boolean
}

type BrandEnv = Pick<AppEnv, 'SHOW_ORG_LOGO'>

const localize = (value: LocalizedTextMap | undefined, language: string) =>
  getLocalizedRawText(value, language) || undefined

/**
 * Brand of a vote. Only the branding add-on makes it `branded`: the organisation's logo and, when valid, its colour.
 * Without it, SHOW_ORG_LOGO (a client-deployment flag) still shows the logo, never the colour; with neither, the page
 * keeps the Vocdoni mark. A colour that is not `#rgb`/`#rrggbb` is dropped, so the deployment colour stays.
 */
export const resolveProcessBrand = (
  election: Pick<VotingProcessResponse, 'addOns'>,
  organization: Pick<Organization, 'name' | 'logo' | 'color'> | undefined,
  language: string,
  env: BrandEnv
): ProcessBrand => {
  const branded = election.addOns?.branding === true
  return {
    branded,
    name: localize(organization?.name, language) ?? '',
    logo: branded || env.SHOW_ORG_LOGO === true ? localize(organization?.logo, language) : undefined,
    color: branded ? normalizeHexColor(organization?.color) : undefined,
  }
}

/** Archive-era votes are never branded: the organisation avatar under SHOW_ORG_LOGO, as before, and never a colour. */
export const resolveArchiveProcessBrand = (
  organization: LegacyOrganization | undefined,
  language: string,
  env: BrandEnv
): ProcessBrand => {
  const avatar = organization?.account?.avatar?.trim()
  return {
    branded: false,
    name: localize(organization?.account?.name, language) ?? '',
    logo: env.SHOW_ORG_LOGO === true && avatar ? avatar : undefined,
  }
}
