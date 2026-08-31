/**
 * Market verticals used to personalize the auth screens.
 *
 * The vertical is picked up from the `?type=` query param (e.g.
 * `/account/signin?type=professional-associations`) so marketing landing pages can link straight
 * into a login page that speaks to the visitor's sector.
 *
 * This module is deliberately free of React, i18n and asset imports: it is the allow-list that
 * turns an arbitrary, user-controlled query string into one of a fixed set of literals. Never
 * derive an i18n key, asset path or class name from the raw param — only from the resolved slug.
 */

import { withParam } from '~utils/url'

/** Query param carrying the vertical across the auth screens. */
export const AUTH_VERTICAL_PARAM = 'type'

export const VerticalSlugs = [
  'professional-associations',
  'associations',
  'federations',
  'political-parties',
  'chambers',
  'trade-unions',
  'sports-clubs',
  'public-administration',
  'cooperatives',
  'ngos',
  'universities-schools',
  'first-nations',
] as const

export type VerticalSlug = (typeof VerticalSlugs)[number]

/** Fallback used when there is no `?type=` param, or when it doesn't resolve. */
export const GenericVertical = 'generic' as const

export type VerticalKey = VerticalSlug | typeof GenericVertical

const VerticalSlugSet = new Set<string>(VerticalSlugs)

/**
 * Extra spellings accepted in `?type=`.
 *
 * Mostly vocdoni.io's own `/solutions/*` slugs, which don't always match ours, so marketing CTAs
 * can link through without the website having to know our naming. Plain singular forms are handled
 * generically by `resolveVerticalSlug` and don't need an entry here.
 */
const VerticalAliases: Record<string, VerticalSlug> = {
  // vocdoni.io/solutions/professional-colleges
  'professional-college': 'professional-associations',
  'professional-colleges': 'professional-associations',
  'professional-bodies': 'professional-associations',
  colleges: 'professional-associations',
  // vocdoni.io/solutions/municipalities
  municipality: 'public-administration',
  municipalities: 'public-administration',
  government: 'public-administration',
  'local-government': 'public-administration',
  'city-councils': 'public-administration',
  // vocdoni.io/solutions/universities
  universities: 'universities-schools',
  schools: 'universities-schools',
  education: 'universities-schools',
  unions: 'trade-unions',
  parties: 'political-parties',
  coop: 'cooperatives',
  coops: 'cooperatives',
  'non-profits': 'ngos',
  nonprofits: 'ngos',
  'chambers-of-commerce': 'chambers',
  sports: 'sports-clubs',
  clubs: 'sports-clubs',
  indigenous: 'first-nations',
}

/**
 * Resolves a raw `?type=` value into a known vertical, or `null` when it doesn't match one.
 *
 * Accepts loose spellings (casing, underscores, extra whitespace, singular forms) so a slightly
 * wrong link still lands on the right page; anything else silently degrades to the generic
 * experience rather than erroring.
 */
export const resolveVerticalSlug = (raw?: string | null): VerticalSlug | null => {
  if (!raw) return null

  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!normalized) return null
  if (VerticalSlugSet.has(normalized)) return normalized as VerticalSlug
  // hasOwn, not a plain lookup: `?type=constructor` would otherwise resolve to an inherited member
  if (Object.hasOwn(VerticalAliases, normalized)) return VerticalAliases[normalized]
  // singular -> plural ("federation" -> "federations")
  if (VerticalSlugSet.has(`${normalized}s`)) return `${normalized}s` as VerticalSlug

  return null
}

/**
 * Appends the vertical to an in-app path, preserving any params the path already carries.
 * Used to keep the branding when navigating between auth screens (signin -> signup -> recovery).
 *
 * Delegates to `withParam` so query building lives in one place: this used to carry its own copy of
 * it, which is exactly how the two drift apart.
 */
export const withVerticalParam = (path: string, slug?: VerticalSlug | null): string =>
  slug ? withParam(path, AUTH_VERTICAL_PARAM, slug) : path
