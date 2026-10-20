import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    // `e2e` holds the Playwright suite. Its specs are `*.e2e.ts`, which already
    // falls outside vitest's default `**/*.{test,spec}.*` glob — this is a
    // belt-and-braces guard so a future `*.test.ts` helper in there can never
    // be picked up by the unit run (it would try to launch a browser).
    //
    // `stress` holds the load-test harness. Its self-tests fake Docker and spawn
    // about ten Node processes per case; they are meant to be run on demand when
    // stress testing (`pnpm test:stress`), not on every unit run.
    exclude: ['.worktrees', 'node_modules', 'dist', 'e2e', 'stress'],
    setupFiles: './vitest.setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        'src/test-utils.tsx',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
      ],
    },
    server: {
      deps: {
        inline: ['@plausible-analytics/tracker', 'react-gtm-module', 'posthog-js'],
      },
    },
  },
  resolve: {
    alias: {
      // Mock problematic packages for testing
      '@plausible-analytics/tracker': path.resolve(__dirname, './src/__mocks__/@plausible-analytics/tracker.ts'),
      'react-gtm-module': path.resolve(__dirname, './src/__mocks__/react-gtm-module.ts'),
      'posthog-js': path.resolve(__dirname, './src/__mocks__/posthog-js.ts'),
    },
  },
})
