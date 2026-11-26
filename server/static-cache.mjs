// Only the build output folders are immutable: Vite writes chunks/ and entries/, Vike writes static/, all as
// `name-<hash>.ext` or `name.<hash>.ext`, so a changed file always gets a new URL. Everything else under /assets/
// comes from public/ with a stable name (gitcoin-passport.png), so it keeps express.static's default.
const HASHED_ASSET = /[\\/]assets[\\/](?:chunks|entries|static)[\\/](?:.*[\\/])?[^\\/]+[-.][A-Za-z0-9_-]{8}\.[A-Za-z0-9]+(?:\.map)?$/

// `setHeaders` for express.static. HTML never goes through here (served by the SSR middleware).
export function staticCacheHeaders(res, filePath) {
  if (HASHED_ASSET.test(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}
