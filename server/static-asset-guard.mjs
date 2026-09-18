// Requests only a file on disk can satisfy. Without this the `*` catch-all answers a
// missing asset with the SPA document as `200 text/html`, which browsers reject as an
// invalid script MIME type. Matched by extension: no app route segment carries a dot.

// Vike Client Routing fetches page data from `<pathname>/index.pageContext.json`.
// It is rendered on demand, not a file, so it must reach the renderer.
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
  'bmp',
  'tif',
  'tiff',
  'heic',
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
  'mov',
  'm4a',
  'aac',
  'flac',
  'zip',
  'gz',
])

/**
 * @param {string} pathname  The request pathname (req.path), e.g. "/assets/chunks/chunk-a1b2.js"
 * @returns {boolean}
 */
export function isStaticAssetPath(pathname) {
  if (typeof pathname !== 'string') return false

  // `express.static` decodes the pathname before resolving files while `req.path`
  // keeps the raw escapes, so an encoded dot ("/assets/missing%2Ejs") would slip
  // past the checks below. Decode once, as `express.static` does.
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    // Malformed escapes ("%.js") cannot be an app route, and `express.static` lets
    // them fall through to `next()` rather than answering 400. Prefer the 404.
    return true
  }

  if (decoded.endsWith(VIKE_PAGE_CONTEXT_SUFFIX)) return false

  // Dotfile probes ("/.env", "/.git/config") are not app routes: 404 them too.
  if (decoded.split('/').some((segment) => segment.startsWith('.'))) return true

  const filename = decoded.slice(decoded.lastIndexOf('/') + 1)
  const dot = filename.lastIndexOf('.')
  if (dot <= 0 || dot === filename.length - 1) return false

  return STATIC_EXTENSIONS.has(filename.slice(dot + 1).toLowerCase())
}
