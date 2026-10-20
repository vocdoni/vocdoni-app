import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Self-tests for the load-test harness. The root `vitest.config.ts` excludes `stress`
// so these stay out of `pnpm test`; run them with `pnpm test:stress` when working on
// the harness. They spawn real processes and never touch the DOM, hence `node`.
export default defineConfig({
  test: {
    root: path.resolve(__dirname, '..'),
    include: ['stress/*.test.ts'],
    environment: 'node',
  },
})
