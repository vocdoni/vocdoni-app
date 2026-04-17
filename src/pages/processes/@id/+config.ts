import type { Config } from 'vike/types'
import {
  getPublicPageDescription,
  getPublicPageLanguage,
  getPublicPageTitle,
} from '~src/pages/shared/publicPageHeadConfig'

export default {
  title: getPublicPageTitle,
  description: getPublicPageDescription,
  lang: getPublicPageLanguage,
} satisfies Config
