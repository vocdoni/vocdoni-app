# Analytics & PostHog

The app fans analytics out to three sinks — Plausible, GTM, and **PostHog** (EU Cloud) — through a single
abstraction: `src/utils/analytics.ts` (vendor modules, lazy-loaded) and `src/components/AnalyticsProvider.tsx`
(React wiring: consent, identity, organization group). PostHog is the primary product-analytics/BI tool;
Plausible/GTM are kept for continuity.

## Configuration (runtime env)

| Variable       | Meaning                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTHOG_KEY`  | PostHog project API key (`phc_…`). **Unset = PostHog fully disabled** (nothing is loaded). Set it in production only.                       |
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
   `.ph-no-capture`, so rrweb skips the subtree entirely (text _and_ attributes): member table cells
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

## One project, two sites

`vocdoni.io` (the marketing site, a separate repo) reports into **the same PostHog project** as this
app. That is not a convenience: the free plan allows exactly one project, and PostHog cannot query
across projects, so sharing one is the only way a funnel can start on a landing page and end at a
subscription. Both sites ship the same `phc_…` key.

What makes the two halves join up is a single `distinct_id` surviving the hop between subdomains:

- posthog-js writes its persistence cookie with `cross_subdomain_cookie` (default `true` for
  `vocdoni.io`), so the cookie is scoped to `.vocdoni.io`. The cookie name is derived from the project
  token, and both sites use the same token, so they read and write the same cookie.
- That only works while **both** sites run with cookie persistence, which only happens once consent is
  known. So the consent choice itself lives in a cookie on `.vocdoni.io`
  (`src/components/Cookies/utils.ts`), not in localStorage, which is per-origin. A per-origin choice
  would leave this app in "no decision yet" for a visitor who already accepted on the website: it would
  start in memory persistence, ignore the shared cookie, mint a fresh anonymous id, and every
  website → app funnel would silently report near-zero. A pre-existing localStorage choice is migrated
  on first read, so nobody is asked twice.
- `identify()` on signup then merges that shared anonymous id into the person, so marketing pageviews
  from before the account existed land in the same person's timeline.

Events from the two sites are told apart by the `site` super property (`app` here, `web` on the
marketing site), which is more durable than `$host` across preview hosts and custom domains.

**Both sites must ship the consent cookie together.** Shipping only one leaves the bridge half-built.

## Tracking events

Use `useAnalytics().trackEvent(...)` in components, or `trackAnalyticsEvent(...)` from
`~utils/analytics` in hooks/query files. Event names live in `AnalyticsEvents`; the six legacy names
keep their historical strings for Plausible/GTM and are renamed to snake_case for PostHog via
`posthogEventNames`. New events are snake_case everywhere. Properties must be primitives and must never
contain voter identifiers, ballot content, emails, or tokens.

Current taxonomy (PostHog names): `account_signed_up`, `user_logged_in`, `organization_created`,
`process_created`, `subscription_completed`, `checkout_started`,
`billing_portal_opened`, `paywall_viewed`, `feature_blocked`, `process_creation_failed`,
`process_template_selected`, `process_action`, `process_results_viewed`, `members_import_started`,
`members_import_completed`, `member_group_created`, `member_group_deleted`, `census_configured`,
`team_member_invited`, `team_member_removed`, `pdf_report_downloaded`.

Organization-level BI: every session registers `org_address`/`org_name`/`org_plan` super properties, and
the `organization` group profile carries name, plan, type, country, size, usage counters, and renewal
date (see `AnalyticsProvider`).

The group's `name` property is what PostHog uses to label a group — without it every organization renders
as a bare `0x…` address. It is duplicated as the `org_name` super property because group properties are
only queryable with the group analytics add-on, whereas super properties land on every event.
`organization_created` also carries `org_name`/`org_address` directly, since it fires before the group
profile has been registered. Organization names are business data, not personal data; note that a
one-person organization may still be named after its owner.

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
5. Dashboards: run `pnpm posthog:insights` (see below) instead of clicking them together.
6. Free-tier quotas: 1M events, 5K replays, 1M flag requests per month. Voting pages emit nothing, so
   volume is admin-driven. Set billing limits per product as a guardrail.

## Dashboards & funnels (provisioned from code)

`scripts/posthog-insights.mjs` creates the dashboards and insights through the PostHog API, so they are
reviewable in git and reproducible across projects. It matches objects **by name**, so re-running updates
them in place rather than duplicating.

```bash
POSTHOG_PERSONAL_API_KEY=phx_… pnpm posthog:insights --dry-run   # print the plan
POSTHOG_PERSONAL_API_KEY=phx_… pnpm posthog:insights             # apply
```

The key is a **personal** API key (<https://eu.posthog.com/settings/user-api-keys>) with `insight:write`,
`dashboard:write` and `group:read`. The `phc_…` project key the app ships with is write-only for events
and cannot create insights. `POSTHOG_PROJECT_ID` is optional (first accessible project by default);
`POSTHOG_API_HOST` defaults to `https://eu.posthog.com` — the app host, not the `eu.i.posthog.com`
ingestion host.

What it provisions:

| Dashboard                  | Insights                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Activation**             | signup → org → first election (steps, time-to-convert, weekly trend); memberbase import funnel; onboarding steps completed; organizations created by name                                  |
| **Monetization**           | paywall → checkout → subscription (broken down by `source`); blocked feature → upgrade (by `feature`); paywall exposure per plan                                                           |
| **Elections & engagement** | wizard funnel `process_template_selected` → `census_configured` → `process_created` → `process_results_viewed`; created vs failed; weekly active organizations; elections by `census_type` |

Two things make these worth more than the PostHog defaults:

- **Organization-level aggregation.** Every funnel that starts after an org exists sets
  `aggregation_group_type_index` to the `organization` group, so conversion counts organizations, not
  seats — several colleagues sharing one journey no longer inflate the numerator. The script resolves the
  index from `/api/projects/:id/groups_types/`; if the group does not exist yet (it appears with the first
  group event), it warns and falls back to person aggregation, so re-run it once real traffic has landed.
- **Real conversion windows.** Checkout gets 7 days, activation 30, wizard failures 1 hour — an unbounded
  window makes every funnel look better than it is.

Edit the `buildPlan` function to change a funnel; the query shapes follow PostHog's `FunnelsQuery` /
`TrendsQuery` schema.

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
