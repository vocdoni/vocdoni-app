// One image serves every environment, and stage runs with VOCDONI_ENVIRONMENT=prod,
// so the decision is made by hostname: only the production app may be indexed.

const PRODUCTION_HOSTNAME = 'app.vocdoni.io'

/**
 * @param {string} hostname  The request hostname without port, e.g. "app.vocdoni.io"
 * @returns {string} The robots.txt body for that hostname
 */
export function robotsTxt(hostname) {
  const allowAll = String(hostname).toLowerCase() === PRODUCTION_HOSTNAME
  return [
    '# https://www.robotstxt.org/robotstxt.html',
    'User-agent: *',
    allowAll ? 'Disallow:' : 'Disallow: /',
    '',
  ].join('\n')
}

/**
 * Answers GET and HEAD /robots.txt from the request hostname and passes everything else on.
 * @returns {import('express').RequestHandler}
 */
export function robotsTxtHandler() {
  return (req, res, next) => {
    if (req.path !== '/robots.txt' || !['GET', 'HEAD'].includes(req.method)) return next()
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(robotsTxt(req.hostname))
  }
}
