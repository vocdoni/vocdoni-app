/**
 * Panel surface tone for each customer logo, used by the auth testimonial showcase.
 *
 * The showcase sets the organization's own logo as a large watermark. Painting it over a fixed
 * per-vertical colour made the warm marks (Bellpuig's crest, Òmnium, La Intersindical) fight the
 * surface, so the surface is derived from the mark instead: same hue, driven down to a deep,
 * desaturated tone that carries white type at roughly 13:1. Mark and field then always agree.
 *
 * Values are committed rather than sampled at runtime on purpose — a colour decision should be
 * reviewable in a diff, not recomputed on every visitor's machine. Two of the sixteen needed the
 * hue-band correction below before they stopped reading as mud, and that judgement can't be made
 * by an algorithm shipping straight to production.
 *
 * To regenerate after replacing the artwork in `public/assets/verticals/logos/`, run
 * `scripts/logo-tones.mjs` and review every changed value on screen before committing it.
 *
 * A logo with no entry here is not a bug: the showcase falls back to the vertical's own
 * `verticals.*.900` accent tone, so a newly added logo renders correctly until this is regenerated.
 */
export const LogoTones: Record<string, string> = {
  aguicat: '#301615',
  arxivers: '#1a1d2b',
  ati: '#301515',
  bcn: '#301519',
  bellpuig: '#302415',
  bisbal: '#301a15',
  cec: '#1f2b28',
  coib: '#152c30',
  eic: '#152030',
  erc: '#301915',
  granollers: '#2e1817',
  icoes: '#152e30',
  intersindical: '#301515',
  omnium: '#301a15',
  plataforma: '#2b291f',
  ustec: '#272b1f',
}
