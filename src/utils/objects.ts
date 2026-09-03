/**
 * Dot-path getter over nested plain objects (replaces the legacy SDK's `dotobject`):
 * `dotobject(plan, 'organization.maxCensus')` → `plan.organization.maxCensus`.
 * Returns `undefined` when any segment is missing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dotobject = (source: unknown, path: string): any =>
  path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        typeof current === 'object' && current !== null ? (current as Record<string, unknown>)[key] : undefined,
      source
    )
