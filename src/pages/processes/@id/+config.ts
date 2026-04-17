import type { Config } from 'vike/types'
import { getPublicPageDescription, getPublicPageTitle } from '~src/pages/shared/publicPageHeadConfig'

export default {
  title: getPublicPageTitle,
  description: getPublicPageDescription,
} satisfies Config
