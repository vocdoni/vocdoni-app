import type { TrustLogo } from './types'

const logoSrc = (file: string) => `/assets/verticals/logos/${file}.webp`

/**
 * Round customer logos, mirrored from the marketing site (vocdoni.io `assets/logos/*_round.webp`).
 *
 * Served from `public/`, so they are cached by filename: if a logo artwork changes, change the
 * filename too.
 */
export const TrustLogos: Record<string, TrustLogo> = {
  coib: { id: 'coib', src: logoSrc('coib'), name: "Col·legi Oficial d'Infermeres i Infermers de Barcelona" },
  eic: { id: 'eic', src: logoSrc('eic'), name: 'Enginyers Industrials de Catalunya' },
  icoes: { id: 'icoes', src: logoSrc('icoes'), name: 'Colegio Oficial de Enfermería de Sevilla' },
  ati: { id: 'ati', src: logoSrc('ati'), name: 'Associazione Termotecnica Italiana' },
  arxivers: { id: 'arxivers', src: logoSrc('arxivers'), name: "Associació d'Arxivers de Catalunya" },
  aguicat: { id: 'aguicat', src: logoSrc('aguicat'), name: 'AGUICAT' },
  barca: { id: 'barca', src: logoSrc('barca'), name: 'Futbol Club Barcelona' },
  cec: { id: 'cec', src: logoSrc('cec'), name: 'Centre Excursionista de Catalunya' },
  omnium: { id: 'omnium', src: logoSrc('omnium'), name: 'Òmnium Cultural' },
  plataforma: { id: 'plataforma', src: logoSrc('plataforma'), name: 'Plataforma per la Llengua' },
  bellpuig: { id: 'bellpuig', src: logoSrc('bellpuig'), name: 'Ajuntament de Bellpuig' },
  bisbal: { id: 'bisbal', src: logoSrc('bisbal'), name: "Ajuntament de la Bisbal d'Empordà" },
  bcn: { id: 'bcn', src: logoSrc('bcn'), name: 'Ajuntament de Barcelona' },
  berga: { id: 'berga', src: logoSrc('berga'), name: 'Ajuntament de Berga' },
  erc: { id: 'erc', src: logoSrc('erc'), name: 'Esquerra Republicana' },
  alhora: { id: 'alhora', src: logoSrc('alhora'), name: 'Alhora' },
  partit_pirata: { id: 'partit_pirata', src: logoSrc('partit_pirata'), name: 'Partit Pirata' },
  granollers: { id: 'granollers', src: logoSrc('granollers'), name: 'Granollers Primàries' },
  intersindical: { id: 'intersindical', src: logoSrc('intersindical'), name: 'La Intersindical' },
  ustec: { id: 'ustec', src: logoSrc('ustec'), name: 'USTEC·STEs (IAC)' },
}

/**
 * Logos shown when there is no vertical (plain app.vocdoni.io) or when a vertical doesn't have one
 * of its own. A cross-sector mix, and the whole catalogue rather than a hand-picked selection: this
 * row is the only social proof a visitor with no `?type=` ever sees. What each breakpoint actually
 * shows is capped by `VisibleLogos`, so ordering — not membership — is the editorial decision here.
 *
 * Ordered by recognition, then by sector spread, because the row is truncated from the right at the
 * narrow breakpoints (see `VisibleLogos`) — position is what decides whether a logo is seen at all.
 * The first five carry mobile and are deliberately five different sectors: a club, a city, a
 * cultural association, a professional body and a party. The next three complete the tablet row
 * with a union, an engineering body and a historic club. Everything after that is desktop-only,
 * up to the cap.
 */
export const GenericLogos = [
  // Recognised on sight, five sectors — this is the mobile row
  'barca',
  'bcn',
  'omnium',
  'coib',
  'erc',
  // Completes the tablet row
  'intersindical',
  'eic',
  'cec',
  // Desktop — capped at 18 (see `VisibleLogos`), so the last entries past that only surface when
  // the withheld filter shortens the list. They still lead their own sector's rows.
  'plataforma',
  'icoes',
  'ustec',
  'ati',
  'bisbal',
  'bellpuig',
  'berga',
  'arxivers',
  'partit_pirata',
  'alhora',
  'granollers',
  'aguicat',
] as const

/**
 * Minimum logos a vertical needs to show its own set. One is enough: a sector's real customer, named
 * under a sentence about that sector, beats a longer row borrowed from everyone else. What keeps the
 * row honest is that every logo in it belongs to the vertical (see `registry.test.ts`), not its
 * length.
 */
export const MinVerticalLogos = 1

const WithheldByLanguage: Record<string, readonly string[]> = {
  es: ['omnium', 'plataforma'],
}

/** Customer ids not shown for the given language. */
export const getWithheldLogos = (language?: string): ReadonlySet<string> => {
  // `Object.hasOwn`, not a bare index: the language string comes from i18next and an inherited
  // member (`constructor`, `valueOf`) would slip past `?? []`. Same guard as `resolveVerticalSlug`.
  const key = (language ?? '').toLowerCase()
  return new Set(Object.hasOwn(WithheldByLanguage, key) ? WithheldByLanguage[key] : [])
}

export const getTrustLogos = (ids: readonly string[]): TrustLogo[] =>
  ids.map((id) => TrustLogos[id]).filter((logo): logo is TrustLogo => Boolean(logo))
