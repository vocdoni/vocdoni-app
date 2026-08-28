import type { GenericVertical, VerticalKey, VerticalSlug } from '~constants/verticals'

/** Customer logo shown in the trust bar and, when it belongs to a quote, in the showcase panel. */
export type TrustLogo = {
  id: string
  /** Round logo served from `public/assets/verticals/logos/`. */
  src: string
  /** Organization name. A proper noun — intentionally not translated. */
  name: string
}

export type AuthTestimonial = {
  /** Stable id, also the `testimonials.<id>.*` i18n key segment. Never rename: it would prune translations. */
  id: string
  author: string
  position: string
  company: string
  quote: string
  /** Verticals this quote is representative of. */
  verticals: VerticalSlug[]
  /** Id of the organization logo, resolved against the logo catalogue. */
  logo: string
  /** Author portrait, for the few organizations we have one for. */
  portrait?: string
  /** `object-position` for the portrait, so the subject is never cropped out. */
  portraitPosition?: string
}

export type VerticalCopy = {
  /** Short sector name, used as the showcase eyebrow. */
  label: string
  /** Showcase headline. */
  headline: string
  /** Trust bar sentence introducing the logo row. Ends with a colon. */
  trustBar: string
}

/** Every vertical has copy; `generic` additionally covers a visitor who arrived with no `?type=`. */
export type VerticalCopyMap = Record<typeof GenericVertical, VerticalCopy> & Partial<Record<VerticalSlug, VerticalCopy>>

export type VerticalContent = {
  /** Base color token in `colors.verticals.*`, e.g. `verticals.professional`. */
  accent: string
  /** Logo ids for this vertical's trust bar, in display order. */
  logos: string[]
}

export type ResolvedVertical = {
  key: VerticalKey
  isGeneric: boolean
  accent: string
  copy: VerticalCopy
  /** Testimonial to render in the showcase panel; `null` when we have none for this vertical. */
  testimonial: AuthTestimonial | null
  logos: TrustLogo[]
  /**
   * True when the vertical has too few logos of its own and borrowed the generic set. The trust
   * bar then uses the generic sentence — claiming a sector trusts us under someone else's logos
   * would not be true.
   */
  usesGenericLogos: boolean
}
