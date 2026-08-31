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
  erc: { id: 'erc', src: logoSrc('erc'), name: 'Esquerra Republicana' },
  granollers: { id: 'granollers', src: logoSrc('granollers'), name: 'Granollers Primàries' },
  intersindical: { id: 'intersindical', src: logoSrc('intersindical'), name: 'La Intersindical' },
  ustec: { id: 'ustec', src: logoSrc('ustec'), name: 'USTEC·STEs (IAC)' },
}

/**
 * Logos shown when there is no vertical (plain app.vocdoni.io) or when a vertical doesn't have
 * enough of its own. A cross-sector mix, ordered so the first five still read as representative on
 * mobile, where only that many fit.
 */
export const GenericLogos = [
  'coib',
  'omnium',
  'cec',
  'erc',
  'bellpuig',
  'intersindical',
  'eic',
  'bisbal',
  'plataforma',
  'icoes',
] as const

/**
 * Minimum logos a vertical needs to show its own set. One is enough: a sector's real customer, named
 * under a sentence about that sector, beats a longer row borrowed from everyone else. What keeps the
 * row honest is that every logo in it belongs to the vertical (see `registry.test.ts`), not its
 * length.
 */
export const MinVerticalLogos = 1

export const getTrustLogos = (ids: readonly string[]): TrustLogo[] =>
  ids.map((id) => TrustLogos[id]).filter((logo): logo is TrustLogo => Boolean(logo))
