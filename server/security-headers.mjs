// Minimal, non-breaking security headers. Deliberately NOT a full script-src
// CSP (that needs a Report-Only rollout against GTM/PostHog/Plausible/Crisp/
// Stripe/cal.com/YouTube first); only frame-ancestors is enforced here.
export function securityHeaders({ isProduction = true } = {}) {
  return (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'")
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
    next()
  }
}
