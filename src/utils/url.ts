/**
 * Appends a query parameter to an in-app path, preserving any params the path already carries.
 *
 * Concatenating `?key=value` onto a path is only safe when the path is known to be bare, and that
 * assumption breaks quietly: `/account/verify?type=x` + `?email=y` parses as a single `type` param
 * whose value is `x?email=y`, so the second parameter silently disappears rather than erroring.
 *
 * The fragment is split off first and put back last. A query written after `#` belongs to the
 * fragment, not to the query string, so appending naively to `/x#top` would produce `/x#top?email=y`
 * — a path whose parameter no server or router ever sees.
 */
export const withParam = (path: string, key: string, value: string): string => {
  // Indexes rather than `split`: only the *first* separator delimits, and everything after it stays
  // verbatim in the part it belongs to.
  const hashAt = path.indexOf('#')
  const hash = hashAt === -1 ? '' : path.slice(hashAt)
  const withoutHash = hashAt === -1 ? path : path.slice(0, hashAt)

  const queryAt = withoutHash.indexOf('?')
  const pathname = queryAt === -1 ? withoutHash : withoutHash.slice(0, queryAt)
  const params = new URLSearchParams(queryAt === -1 ? '' : withoutHash.slice(queryAt + 1))
  params.set(key, value)

  return `${pathname}?${params.toString()}${hash}`
}
