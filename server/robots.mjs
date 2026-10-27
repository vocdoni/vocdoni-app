// One image serves every environment, and stage runs with VOCDONI_ENVIRONMENT=prod,
// so the decision is made by hostname: only the production app may be indexed.

import { getEffectiveOrigin } from './ssr-cache.mjs'

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
 * Hostname of the public origin the request was made for, resolved like the rest of the
 * server does (APP_URL, then X-Forwarded-Host, then Host), so it holds behind a proxy.
 * @param {import('express').Request} req
 * @returns {string} The hostname, or '' when no valid origin can be derived
 */
function requestHostname(req) {
  try {
    return new URL(getEffectiveOrigin(req)).hostname
  } catch {
    return ''
  }
}

/**
 * Answers GET and HEAD /robots.txt from the public hostname and passes everything else on.
 * @returns {import('express').RequestHandler}
 */
export function robotsTxtHandler() {
  return (req, res, next) => {
    if (req.path !== '/robots.txt' || !['GET', 'HEAD'].includes(req.method)) return next()
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(robotsTxt(requestHostname(req)))
  }
}
