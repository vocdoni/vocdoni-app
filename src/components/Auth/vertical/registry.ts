import type { VerticalSlug } from '~constants/verticals'
import type { VerticalContent } from './types'

/** Accent used by every vertical that doesn't declare one of its own. */
export const GenericAccent = 'verticals.generic'

/**
 * Per-vertical branding and logo set.
 *
 * A vertical only belongs here once we have real content for it — an entry with borrowed logos
 * would make the trust bar claim a sector trusts us on someone else's behalf. Missing verticals
 * still resolve; they render the generic experience (see `useAuthVertical`), so adding one later is
 * a single entry plus its copy in `copy.ts`.
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
}
