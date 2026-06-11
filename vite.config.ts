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
// here. It is resolved on the server from process.env (see src/app-env-build.ts),
// stored on Vike's globalContext in src/pages/+onCreateGlobalContext.server.ts, and
// forwarded to the client via `passToClient: ['appEnv']` (src/pages/+config.ts).
// This keeps a single Docker image configurable at runtime with `docker run -e ...`
// instead of freezing values at build time.
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
    // Expose the dev server on the local network (equivalent to `--host`).
    // It is set here rather than on the CLI because Vike intercepts the vite
    // command and its parser rejects unknown flags like `--host`/`--port`.
    server: {
      host: true,
    },
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
