const ID = /^[A-Za-z0-9_-]{1,128}$/

/**
 * An id read from the URL, or undefined when it isn't shaped like one. Route params come decoded, so
 * a link with `..%2F` in it would otherwise walk the API path an id is put into, with the admin's
 * session, to another organization's data.
 */
export const safeId = (value?: string | null) => (value && ID.test(value) ? value : undefined)
