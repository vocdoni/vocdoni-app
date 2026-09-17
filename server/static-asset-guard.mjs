/**
 * Predicate for requests that can only be satisfied by a file on disk, and so
 * must never fall through to the Vike renderer.
 *
 * The catch-all page route (src/pages/@catchAll/+route.ts) matches `*`, so any
 * asset the static server could not resolve — a client running stale HTML across
 * a deploy, a stray source-map fetch, a scanner guessing filenames — is answered
 * with the SPA document at `200 text/html`. Browsers reject that as
 * "'text/html' is not a valid JavaScript MIME type" (reported alongside an opaque
 * "Script error."), and source-map fetches fail parsing HTML as JSON. Answering
 * 404 keeps the failure honest and keeps HTML documents out of shared caches
 * under asset URLs.
 *
 * Matching is by extension rather than by an `/assets/` prefix so it also covers
 * `public/` files and holds whatever `base` the build was made with. No app route
 * carries a file extension: path segments are language codes, hex addresses and
 * base64url identifiers, none of which contain a dot. The one rendered response
 * that does is Vike's, exempted below.
 */

/**
 * Vike's Client Routing fetches page data from `<pathname>/index.pageContext.json`.
 * That is rendered on demand, not a file on disk, so it has to reach the renderer —
 * 404ing it breaks client-side navigation between the SSR public pages.
 */
const VIKE_PAGE_CONTEXT_SUFFIX = '.pageContext.json'

const STATIC_EXTENSIONS = new Set([
  // scripts, styles and their source maps
  'js',
  'mjs',
  'cjs',
  'css',
  'map',
  // data and metadata served as files
  'json',
  'webmanifest',
  'txt',
  'xml',
  'csv',
  'pdf',
  // images
  'ico',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  // fonts
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  // media and binaries
  'wasm',
  'mp3',
  'mp4',
  'webm',
  'wav',
  'zip',
])

/**
 * @param {string} pathname  The request pathname (req.path), e.g. "/assets/chunks/chunk-a1b2.js"
 * @returns {boolean}
 */
export function isStaticAssetPath(pathname) {
  if (typeof pathname !== 'string') return false

  if (pathname.endsWith(VIKE_PAGE_CONTEXT_SUFFIX)) return false

  const filename = pathname.slice(pathname.lastIndexOf('/') + 1)
  const dot = filename.lastIndexOf('.')
  // `dot <= 0` also rejects dotfiles ("/.env"), which are probes rather than assets
  if (dot <= 0 || dot === filename.length - 1) return false

  return STATIC_EXTENSIONS.has(filename.slice(dot + 1).toLowerCase())
}
