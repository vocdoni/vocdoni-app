import type { Config } from 'vike/types'

export default {
  // The configured voting homepage needs the same isolation as /processes/:id.
  clientRouting: false,
  // Vike's server-routing runtime doesn't compute this during hydration.
  passToClient: ['urlPathname'],
} satisfies Config
