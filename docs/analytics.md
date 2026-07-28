# Analytics & PostHog

The app fans analytics out to three sinks — Plausible, GTM, and **PostHog** (EU Cloud) — through a single
abstraction: `src/utils/analytics.ts` (vendor modules, lazy-loaded) and `src/components/AnalyticsProvider.tsx`
(React wiring: consent, identity, organization group). PostHog is the primary product-analytics/BI tool;
Plausible/GTM are kept for continuity.

## Configuration (runtime env)

| Variable | Meaning |
| --- | --- |
| `POSTHOG_KEY` | PostHog project API key (`phc_…`). **Unset = PostHog fully disabled** (nothing is loaded). Set it in production only. |
| `POSTHOG_HOST` | Defaults to `https://eu.i.posthog.com` (EU data residency). Point it at a reverse proxy later to mitigate ad-blockers without code changes. |

Env is runtime-injected (see `src/app-env-build.ts`), so a single Docker image works across environments.

## Privacy model

1. **Voters are never tracked — zero events on voting routes.** Two independent layers in
   `src/utils/analytics.ts`:
   - `initializePosthog` refuses to load the SDK when `window.location.pathname` matches
     `isVotingPath` (`/processes/:id`, `/processes/:id/summary`, with or without a language prefix).
     Voters never download the SDK.
   - `posthogBeforeSend` returns `null` for **any** event (pageviews, autocapture, replay snapshots,
     exceptions) whose URL is a voting route — covers admins SPA-navigating into a process view.
   Consequently there are **no voter-side events** in the taxonomy; election participation BI comes from
   admin-side events (`process_results_viewed`) and, later, the backend.
2. **Cookieless until consent.** Before the cookie banner is accepted, PostHog runs with
   `persistence: 'memory'` (no cookies/localStorage) and anonymous events only
   (`person_profiles: 'identified_only'`). On accept: persistence upgrades and dashboard users are
   `identify()`d. On reject: `opt_out_capturing()` — full silence.
3. **URL scrubbing.** `sanitizeAnalyticsUrl` strips `email`, `token`, `code` query params from
   `$current_url`/`$referrer`; exception payloads get email addresses redacted.
4. **Session replay** only for authenticated users who accepted consent, with `maskAllInputs`; ballot
   content carries `.ph-no-capture` as defense in depth.
5. **Memberbase PII is never recorded.** Every surface that renders a member record carries
   `.ph-no-capture`, so rrweb skips the subtree entirely (text *and* attributes): member table cells
   (`Memberbase/Members/index.tsx`), member cards (`MemberCard.tsx` — the checkbox `aria-label`
   embeds the member name, so the whole card is excluded), group member table cells
   (`GroupsBoard.tsx`), and the CSV import error list (`Members/Import.tsx`), which quotes offending
   rows. Member search and the add/edit member form are covered by `maskAllInputs`. Surrounding
   chrome — tabs, headings, buttons, counts, group names — stays visible, so replays remain usable.
   **When adding a component that renders member fields, add `className='ph-no-capture'` to it.**
6. **Opting a field back in.** `maskAllInputs` hides every input value, including ones that are not
   personal data. `posthogMaskInput` (wired as `maskInputFn`) restores the value for inputs inside a
   `data-ph-unmask` subtree; passwords are never restored. The only current use is the organization
   name in Settings → Organization details (`Organization/Form.tsx`).

## Tracking events

Use `useAnalytics().trackEvent(...)` in components, or `trackAnalyticsEvent(...)` from
`~utils/analytics` in hooks/query files. Event names live in `AnalyticsEvents`; the six legacy names
keep their historical strings for Plausible/GTM and are renamed to snake_case for PostHog via
`posthogEventNames`. New events are snake_case everywhere. Properties must be primitives and must never
contain voter identifiers, ballot content, emails, or tokens.

Current taxonomy (PostHog names): `account_signed_up`, `user_logged_in`, `organization_created`,
`process_created`, `subscription_completed`, `multiquestion_multichoice_attempted`, `checkout_started`,
`billing_portal_opened`, `paywall_viewed`, `feature_blocked`, `process_creation_failed`,
`process_template_selected`, `process_action`, `process_results_viewed`, `members_import_started`,
`members_import_completed`, `member_group_created`, `member_group_deleted`, `census_published`,
`onboarding_step_completed`, `team_member_invited`, `team_member_removed`, `pdf_report_downloaded`.

Organization-level BI: every session registers `org_address`/`org_plan` super properties, and the
`organization` group profile carries plan, type, country, size, usage counters, and renewal date
(see `AnalyticsProvider`).

## Feature flags

```tsx
import { useFeatureFlag } from '~utils/use-feature-flag'

const enabled = useFeatureFlag('new-dashboard') // undefined until flags load → render your default
```

- `undefined` means "not loaded / PostHog disabled" — defaults must always be safe.
- Never gate voter-facing functionality on a flag: the SDK does not exist on voting routes.
- No SSR bootstrapping: SSR HTML is LRU-cached across users (`server/ssr-cache.mjs`).

## PostHog workspace checklist (one-time, in app.posthog.com — EU)

1. Create the project in **PostHog Cloud EU**; copy the key to the production deployment as `POSTHOG_KEY`.
2. Project settings: leave **IP capture disabled** (EU default); enable **error tracking** and
   **session replay** products; set replay **sampling** to ~50% initially (free tier: 5K replays/mo).
3. Surveys: target dashboard routes only (`/admin/*`) — never `/processes/*`.
4. Add PostHog to the privacy policy / subprocessor list (legal, outside this repo).
5. Suggested dashboards:
   - **Org acquisition** — `organization_created` per week, broken down by `org_type` / `org_plan` / `client`.
   - **Activation funnel** — `account_signed_up` → `organization_created` → `members_import_completed` →
     `process_created` (+ time-to-value); `onboarding_step_completed` breakdown.
   - **Engagement** — weekly active organizations (unique `org_address`), `process_created` per org.
   - **Monetization** — `paywall_viewed` → `checkout_started` → `subscription_completed` conversion;
     `feature_blocked` by `feature`.
   - **Election operations** — `process_created` by `census_type`, `process_action`, turnout via
     `process_results_viewed` (`turnout_pct`).
6. Free-tier quotas: 1M events, 5K replays, 1M flag requests per month. Voting pages emit nothing, so
   volume is admin-driven. Set billing limits per product as a guardrail.

## Follow-up: server-side events (saas-backend)

The frontend cannot see renewals, churn, payment failures, or final turnout. A follow-up in the
saas-backend repo should send server-authoritative events with `posthog-node`, keyed to the same
`organization` group: `organization_registered`, `subscription_renewed`, `subscription_cancelled`,
`payment_failed`, election finalization with final turnout, and a periodic usage-counter sync to group
properties. That makes PostHog the single BI pane without ever touching voters.

## Verifying locally

```bash
POSTHOG_KEY=phc_yourdevkey pnpm dev
```

- Open a public process page → **zero** requests to `posthog.com`, SDK not loaded.
- Elsewhere, before consent: events flow, no `ph_*` cookie/localStorage entries.
- Accept the banner: `ph_*` storage appears; after login, the person is identified and events carry
  `$groups.organization`.
- Reject the banner: network silence. Logout: `posthog.reset()` (new anonymous id).

Two gotchas when verifying:

- **`window.posthog` is always `undefined`.** The SDK is imported as an ES module, not injected via the
  `<script>` snippet, so it is never attached to `window`. Do not use it to tell whether PostHog loaded
  (it looks identical on voting and non-voting pages), and `posthog.debug()` is not available in the
  console. Use the **Network tab filtered on `posthog`** instead — that is the reliable signal.
- **Headless browsers capture nothing.** posthog-js drops every event when its internal `_is_bot()` check
  is true, which includes Playwright/Puppeteer even with a spoofed user agent and `navigator.webdriver`.
  The SDK still initializes and still calls `/flags/`, so it looks alive while `before_send` is never
  reached and no `/e/` request is ever made. Automated end-to-end checks need `opt_out_useragent_filter:
  true` set temporarily, or a headed real browser.
