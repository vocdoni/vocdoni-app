import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { ssr } from 'vike/plugin'
import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolveLanguagesSlice } from './vite/language-env'
import { sharedCensusPlugin } from './vite/shared-census'

// https://vitejs.dev/config/
const viteconfig = ({ mode }) => {
  // load env variables from .env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  let vocdoniEnvironment = process.env.VOCDONI_ENVIRONMENT
  if (!vocdoniEnvironment) {
    vocdoniEnvironment = 'dev'
  }

  const outDir = process.env.BUILD_PATH
  const base = process.env.BASE_URL || '/'

  let commit = 'unknown'
  try {
    commit = execSync('git rev-parse --short HEAD').toString()
  } catch {
    console.warn('Unable to resolve git commit hash for HTML template injection.')
  }

  let defaultCensusSize = Number(process.env.DEFAULT_CENSUS_SIZE)
  if (!defaultCensusSize) {
    defaultCensusSize = 5000
  }

  const title = process.env.APP_TITLE || 'Vocdoni - Digital voting SaaS platform'
  const appUrl = process.env.APP_URL

  let saasUrl = process.env.SAAS_URL || 'https://saas-api-dev.vocdoni.net'
  if (saasUrl.endsWith('/')) {
    saasUrl = saasUrl.slice(0, -1)
  }

  let oauthUrl = process.env.OAUTH_URL || 'https://oauth.vocdoni.io'

  let privacyPolicyUrl = process.env.PRIVACY_POLICY_URL || 'https://vocdoni.io/privacy'
  if (privacyPolicyUrl.endsWith('/')) {
    privacyPolicyUrl = privacyPolicyUrl.slice(0, -1)
  }

  let termsOfServiceUrl = process.env.TERMS_OF_SERVICE_URL || 'https://vocdoni.io/terms'
  if (termsOfServiceUrl.endsWith('/')) {
    termsOfServiceUrl = termsOfServiceUrl.slice(0, -1)
  }

  const defaultVideoTutorial = {
    en: 'https://www.youtube.com/watch?v=bIKxUTS4X8E',
  }

  const resolveVideoTutorials = () => {
    const rawValue = process.env.VIDEO_TUTORIAL

    if (!rawValue) {
      return defaultVideoTutorial
    }

    try {
      const parsed = JSON.parse(rawValue)

      if (typeof parsed !== 'object' || parsed === null || !parsed.en) {
        console.warn('VIDEO_TUTORIAL must be a JSON object containing at least the "en" key. Falling back to default.')
        return defaultVideoTutorial
      }

      return parsed
    } catch (error) {
      console.warn('Invalid JSON format for VIDEO_TUTORIAL. Falling back to default "en" video.')
      return defaultVideoTutorial
    }
  }

  const languagesSlice = resolveLanguagesSlice(process.env.LANGUAGES)
  const defaultLanguage = Object.keys(languagesSlice)[0]
  const appEnv = {
    VOCDONI_ENVIRONMENT: vocdoniEnvironment,
    CUSTOM_ORGANIZATION_DOMAINS: JSON.parse(process.env.CUSTOM_ORGANIZATION_DOMAINS || '{}'),
    PROCESS_IDS: process.env.PROCESS_IDS || '',
    DEFAULT_CENSUS_SIZE: defaultCensusSize,
    title,
    APP_URL: appUrl,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    SAAS_URL: saasUrl,
    OAUTH_URL: oauthUrl,
    PRIORITY_SUPPORT_PHONE: process.env.PRIORITY_SUPPORT_PHONE,
    CALCOM_EVENT_SLUG: process.env.CALCOM_EVENT_SLUG,
    VIDEO_TUTORIAL: resolveVideoTutorials(),
    GTM_CONTAINER_ID: process.env.GTM_CONTAINER_ID,
    PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
    VOCDONI_CONTACT_EMAIL: process.env.VOCDONI_CONTACT_EMAIL || 'hello@vocdoni.io',
    ANNOUNCEMENT: process.env.ANNOUNCEMENT,
    PRIVACY_POLICY_URL: privacyPolicyUrl,
    TERMS_OF_SERVICE_URL: termsOfServiceUrl,
    WHATSAPP_PHONE_NUMBER: process.env.WHATSAPP_PHONE_NUMBER || '+34 621 501 155',
    LANGUAGES: languagesSlice,
    ANALYTICS_CLIENT_ID: process.env.ANALYTICS_CLIENT_ID || '',
    CRISP_WEBSITE_ID: process.env.CRISP_WEBSITE_ID || '',
    HIDE_VOTER_COUNT: process.env.HIDE_VOTER_COUNT === 'true',
  }

  return defineConfig({
    base,
    build: {
      outDir,
    },
    define: {
      'globalThis.__APP_ENV__': JSON.stringify(appEnv),
    },
    plugins: [
      ssr(),
      tsconfigPaths(),
      react(),
      svgr(),
      sharedCensusPlugin({ defaultLanguage }),
      createHtmlPlugin({
        template: `index.html`,
        minify: {
          removeComments: false,
          collapseWhitespace: true,
        },
        inject: {
          data: {
            commit: commit.trim(),
            title,
          },
        },
      }),
    ],
  })
}

export default viteconfig
