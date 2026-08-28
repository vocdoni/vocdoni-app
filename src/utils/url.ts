/**
 * Appends a query parameter to an in-app path, preserving any the path already carries.
 *
 * Concatenating `?key=value` onto a path is only safe when the path is known to be bare, and that
 * assumption breaks quietly: `/account/verify?type=x` + `?email=y` parses as a single `type` param
 * whose value is `x?email=y`, so the second parameter silently disappears rather than erroring.
 */
export const withParam = (path: string, key: string, value: string): string => {
  const [pathname, search = ''] = path.split('?')
  const params = new URLSearchParams(search)
  params.set(key, value)

  return `${pathname}?${params.toString()}`
}
