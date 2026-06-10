import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'

export default {
  extends: [vikeReact],
  favicon: '/favicon.ico',
  // Forward the server-resolved runtime env (set on globalContext in
  // +onCreateGlobalContext.server.ts) to the client.
  passToClient: ['appEnv'],
} satisfies Config
