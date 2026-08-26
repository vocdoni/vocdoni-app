import { defineConfig, devices } from '@playwright/test'

// End-to-end suite: drives a real browser against the production SSR bundle
// (`pnpm serve:ssr`), pointed at the disposable full stack booted by
// scripts/integration-stack.sh. See e2e/README.md.
//
// These tests are intentionally NOT part of `pnpm test`: they need docker, a
// live chain and several minutes. `*.e2e.ts` also falls outside vitest's default
// `**/*.{test,spec}.*` glob, so the two suites cannot collide.

const appPort = Number(process.env.INTEGRATION_APP_PORT || 3000)
const baseURL = process.env.APP_URL || `http://localhost:${appPort}`
const saasUrl = process.env.SAAS_URL || `http://localhost:${process.env.INTEGRATION_HOST_PORT || 8080}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // The journeys are long by nature (a real signup, a real on-chain publish, a
  // real vote). Budget accordingly rather than chasing flaky timeouts.
  timeout: 5 * 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Serial: both flows register users and publish on-chain processes against a
  // single shared backend. Parallel workers would contend for the same MailHog
  // inbox and the same faucet.
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : [['list']],
  use: {
    baseURL,
    // Bounded per-action and per-navigation budgets. Without them both default
    // to "no limit", so a single stuck click consumes the whole test timeout
    // and the failure reports as an unhelpful "test timeout exceeded" from
    // whatever ran last — instead of naming the action that never completed.
    // Individual slow steps (publishing on-chain, casting a vote) pass their
    // own longer timeout at the call site.
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Serves dist/, so `pnpm build` must have run first (integration-stack.sh
    // `run` and the CI workflow both do it as an explicit step).
    command: 'pnpm serve:ssr',
    url: baseURL,
    // Never reuse a server that is already listening, not even locally.
    //
    // The SSR bundle is loaded into memory at boot while client assets are
    // served from disk with content-hashed names, so a server left running
    // across a `pnpm build` emits HTML pointing at chunks that no longer
    // exist. The page then renders (SSR still works) but never hydrates, and
    // every click silently does nothing — which looks exactly like an app bug
    // and cost real debugging time. Booting takes about a second; a stale
    // server is never worth it. If port 3000 is busy, this fails loudly.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'production',
      PORT: String(appPort),
      APP_URL: baseURL,
      SAAS_URL: saasUrl,
      VOCDONI_ENVIRONMENT: 'dev',
      // Every third-party integration is disabled when its key is empty (see
      // buildAppEnv in src/app-env-build.ts). Keep them empty so no test run
      // phones home to GTM/Plausible/PostHog/Crisp, and so no external script
      // can slow down or block the page.
      GTM_CONTAINER_ID: '',
      PLAUSIBLE_DOMAIN: '',
      POSTHOG_KEY: '',
      CRISP_WEBSITE_ID: '',
      ANALYTICS_CLIENT_ID: '',
      STRIPE_PUBLIC_KEY: '',
    },
  },
})
