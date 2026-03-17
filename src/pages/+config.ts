import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'
import { AppTitle } from '~constants'

export default {
  extends: [vikeReact],
  title: AppTitle,
  favicon: '/favicon.ico',
} satisfies Config
