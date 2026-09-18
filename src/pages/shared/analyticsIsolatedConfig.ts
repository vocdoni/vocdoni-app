import type { Config } from 'vike/types'

// Server-routed public voting pages must not inherit the dashboard's analytics
// document. Defined once so the boundary cannot drift between the pages that
// opt in (see src/pages/+config.test.ts).
export const analyticsIsolatedConfig = {
  // A fresh document prevents dashboard analytics from surviving into a ballot.
  clientRouting: false,
  // Vike's server-routing runtime doesn't compute this during hydration.
  passToClient: ['urlPathname'],
} satisfies Config
