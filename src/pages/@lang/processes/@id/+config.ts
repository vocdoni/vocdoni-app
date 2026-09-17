import type { Config } from 'vike/types'

export default {
  // A fresh document prevents dashboard analytics from surviving into a ballot.
  // The summary page inherits this boundary too.
  clientRouting: false,
  // Vike's server-routing runtime doesn't compute this during hydration.
  passToClient: ['urlPathname'],
} satisfies Config
