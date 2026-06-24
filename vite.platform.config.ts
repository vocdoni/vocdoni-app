import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// In dev, Vite serves the repo-root index.html (the end-user app) at "/". `rollupOptions.input`
// only redirects the production build, so without this the dev server would boot the end-user app.
// Rewrite HTML navigations (the SPA shell + client-side routes) to index.platform.html, leaving
// module/asset requests untouched. Production is handled by rollupOptions.input below.
const servePlatformIndex = (): PluginOption => ({
  name: 'serve-platform-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url || '/'
      const accept = req.headers.accept || ''
      if (req.method === 'GET' && accept.includes('text/html') && !url.startsWith('/@') && !url.startsWith('/src/')) {
        req.url = '/index.platform.html'
      }
      next()
    })
  },
})

// Build config for the "platform" (integrator) UX. This is a SEPARATE, static SPA target:
// no Vike/SSR, env baked at build time via VITE_ vars. It shares vocdoni-app's Chakra design
// system (~theme/*) but mounts its own light provider tree (src/platform), so the integrator
// code never ends up in the end-user app bundle and vice versa. The end-user build keeps using
// vite.config.ts unchanged.
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), 'VITE_') }

  return defineConfig({
    base: process.env.VITE_BASE_URL || '/',
    envPrefix: 'VITE_',
    server: { host: true, port: 5273 },
    preview: { host: true, port: 5273 },
    build: {
      outDir: 'dist-platform',
      rollupOptions: { input: 'index.platform.html' },
    },
    plugins: [servePlatformIndex(), tsconfigPaths(), react(), svgr()],
  })
}
