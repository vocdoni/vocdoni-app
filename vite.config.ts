import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { ssr } from 'vike/plugin'
import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
//
// Public runtime env (SAAS_URL, OAUTH_URL, …) is NO LONGER baked into the bundle
// here. It is resolved per request on the server from process.env and injected as
// `globalThis.__APP_ENV__` (see src/app-env-build.ts, src/pages/+onCreatePageContext.ts
// and src/pages/+Head.tsx). This keeps a single Docker image configurable at
// runtime with `docker run -e ...` instead of freezing values at build time.
const viteconfig = ({ mode }: { mode: string }) => {
  // load env variables from .env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  const outDir = process.env.BUILD_PATH
  const base = process.env.BASE_URL || '/'

  let commit = 'unknown'
  try {
    commit = execSync('git rev-parse --short HEAD').toString()
  } catch {
    console.warn('Unable to resolve git commit hash for HTML template injection.')
  }

  // Only used as the static <title> of the SPA shell template; the live title is
  // driven at runtime through AppEnv/Vike head.
  const title = process.env.APP_TITLE || 'Vocdoni - Digital voting SaaS platform'

  return defineConfig({
    base,
    build: {
      outDir,
    },
    plugins: [
      ssr(),
      tsconfigPaths(),
      react(),
      svgr(),
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
