/** Shared, presentation-free logic for the "pick several" amount settings. */

export type Amount = 'any' | 'upto' | 'exactly' | 'range'

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Derive which amount preset the current min/max represent. */
export const detectAmount = (min: number | null, max: number | null): Amount => {
  const hasMin = min != null && min > 0
  const hasMax = max != null && max > 0
  if (!hasMin && !hasMax) return 'any'
  if (hasMin && hasMax && min === max) return 'exactly'
  if (!hasMin && hasMax) return 'upto'
  return 'range'
}

export const uptoValue = (max: number | null, total: number) => clamp(max ?? Math.min(2, total), 1, total)
export const exactValue = (min: number | null, max: number | null, total: number) => clamp(max ?? min ?? 1, 1, total)
export const rangeMin = (min: number | null, total: number) => clamp(min ?? 1, 1, total)
export const rangeMax = (min: number | null, max: number | null, total: number) =>
  clamp(max ?? total, rangeMin(min, total), total)
