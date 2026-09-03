import type { VerticalSlug } from '~constants/verticals'
import type { VerticalContent } from './types'

/** Accent used by every vertical that doesn't declare one of its own. */
export const GenericAccent = 'verticals.generic'

/**
 * Per-vertical branding and logo set.
 *
 * Every vertical with customers of its own belongs here, and its row holds only those customers —
 * an entry with borrowed logos would make the trust bar claim a sector trusts us on someone else's
 * behalf. That is the invariant `registry.test.ts` enforces: each logo must belong to an
 * organization that vertical can actually point to. Verticals with no customer yet still resolve;
 * they render the generic experience (see `useAuthVertical`), so adding one later is a single entry
 * plus its copy in `copy.ts`.
 *
 * Row length follows from the customer list rather than a target: sports clubs currently have one.
 * A short row of the sector's own names says something true; a padded one does not.
 *
 * `accent` is a base token in `colors.verticals.*`. The showcase now derives its surface from the
 * quoted organization's own logo (see `~theme/logoTones`), so the accent survives only as the
 * fallback tone for a logo with no entry there — which is why a new vertical does not need a colour
 * of its own.
 */
export const VerticalRegistry: Partial<Record<VerticalSlug, VerticalContent>> = {
  'professional-associations': {
    accent: 'verticals.professional',
    logos: ['coib', 'eic', 'icoes', 'ati', 'arxivers', 'aguicat'],
  },
  associations: {
    accent: GenericAccent,
    logos: ['omnium', 'cec', 'plataforma', 'arxivers', 'aguicat'],
  },
  'public-administration': {
    accent: GenericAccent,
    // Barcelona and Berga are customers without quotes of their own — see the test.
    logos: ['bcn', 'bellpuig', 'bisbal', 'berga'],
  },
  ngos: {
    accent: GenericAccent,
    logos: ['omnium', 'plataforma'],
  },
  'political-parties': {
    accent: GenericAccent,
    // Alhora and the Partit Pirata are customers without quotes of their own — see the test.
    logos: ['erc', 'granollers', 'alhora', 'partit_pirata'],
  },
  'trade-unions': {
    accent: GenericAccent,
    logos: ['intersindical', 'ustec'],
  },
  'sports-clubs': {
    accent: GenericAccent,
    // Barcelona is a customer without a quote of its own — see `UnquotedCustomers` in the test.
    logos: ['barca', 'cec'],
  },
}
