import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AUTH_VERTICAL_PARAM, GenericVertical, resolveVerticalSlug, type VerticalSlug } from '~constants/verticals'
import { useVerticalCopy } from './copy'
import { GenericLogos, getTrustLogos, getWithheldLogos, MinVerticalLogos } from './logos'
import { GenericAccent, VerticalRegistry } from './registry'
import { useAuthTestimonials } from './testimonials'
import type { ResolvedVertical } from './types'

const StorageKey = 'auth.vertical'

/**
 * Session, not local: the branding belongs to this visit. It exists because the query string is
 * lost twice in the auth flow — the `navigate(Routes.auth.verify)` after signup, and the Google
 * OAuth round-trip. Storage can throw (private mode, disabled cookies); a missing vertical is not
 * worth breaking a login over.
 */
const readStoredVertical = (): VerticalSlug | null => {
  try {
    return resolveVerticalSlug(window.sessionStorage.getItem(StorageKey))
  } catch {
    return null
  }
}

const storeVertical = (slug: VerticalSlug) => {
  try {
    window.sessionStorage.setItem(StorageKey, slug)
  } catch {
    /* not worth breaking a login over */
  }
}

/**
 * The vertical for the current visit, from `?type=` or, failing that, from earlier in the session.
 * `null` means the generic experience.
 */
export const useVerticalSlug = (): VerticalSlug | null => {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get(AUTH_VERTICAL_PARAM)
  const fromUrl = resolveVerticalSlug(raw)
  // Read once, at mount: once the URL carries a vertical it always wins.
  const [stored] = useState(readStoredVertical)

  useEffect(() => {
    if (fromUrl) storeVertical(fromUrl)
  }, [fromUrl])

  // The stored vertical is there to survive the param being *lost*, not to answer one that is
  // present and names something we don't have. `?type=banana` asks for a vertical we can't serve;
  // showing whichever one the previous screen happened to use would be guessing. Only an absent
  // param falls back.
  return fromUrl ?? (raw ? null : stored)
}

/**
 * Everything the auth chrome needs to render for the current vertical.
 *
 * Degrades independently for testimonials and logos, so a half-populated vertical never has to
 * misrepresent itself:
 * - testimonials: the vertical's own quotes, else the full mixed pool — always attributed to the
 *   real organization either way, and the eyebrow degrades with them. A borrowed quote under a
 *   sector eyebrow would read as that sector saying it;
 * - logos: the vertical's own set if it has one at all, however short, else the generic mix *and*
 *   the generic trust-bar sentence. Claiming "many professional associations trust it" under a row
 *   of city councils would be worse than saying nothing, and a short row of the sector's own names
 *   says more than a long one borrowed from everyone else.
 *
 * The label and accent are vertical-specific wherever the vertical has an entry of its own. The
 * allow-list is deliberately wider than the content: `cooperatives`, `federations`, `chambers`,
 * `universities-schools` and `first-nations` resolve, so a marketing link to one is never broken,
 * but with no copy and no registry entry they fall back to the generic label and accent along with
 * everything else.
 */
export const useAuthVertical = (): ResolvedVertical => {
  const { i18n } = useTranslation()
  const slug = useVerticalSlug()
  const withheld = getWithheldLogos(i18n.resolvedLanguage ?? i18n.language)
  const testimonials = useAuthTestimonials().filter((testimonial) => !withheld.has(testimonial.logo))
  const copyMap = useVerticalCopy()

  // A stable seed rather than a stable testimonial: the pool is rebuilt on every language change,
  // and re-rolling the quote mid-session (or mid-signup flow) would be jarring.
  const [seed] = useState(Math.random)

  const content = slug ? VerticalRegistry[slug] : undefined
  const copy = (slug && copyMap[slug]) || copyMap[GenericVertical]

  const pool = slug ? testimonials.filter((testimonial) => testimonial.verticals.includes(slug)) : testimonials
  const candidates = pool.length ? pool : testimonials
  const testimonial = candidates.length ? candidates[Math.floor(seed * candidates.length)] : null
  // Nothing of this sector's own left to quote, so the panel is showing someone else's words
  const usesGenericTestimonial = Boolean(slug) && pool.length === 0

  const ownLogos = (content?.logos ?? []).filter((id) => !withheld.has(id))
  const usesGenericLogos = ownLogos.length < MinVerticalLogos
  const logos = getTrustLogos(usesGenericLogos ? GenericLogos.filter((id) => !withheld.has(id)) : ownLogos)

  return {
    key: slug ?? GenericVertical,
    isGeneric: !slug,
    accent: content?.accent ?? GenericAccent,
    copy: {
      ...copy,
      label: usesGenericTestimonial ? copyMap[GenericVertical].label : copy.label,
      trustBar: usesGenericLogos ? copyMap[GenericVertical].trustBar : copy.trustBar,
    },
    testimonial,
    logos,
    usesGenericLogos,
  }
}
