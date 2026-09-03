#!/usr/bin/env node
/**
 * Provisions the PostHog funnels/insights and dashboards for the Vocdoni app.
 *
 * Idempotent: objects are matched by name, so re-running updates in place instead
 * of duplicating. Run it again after editing this file to roll changes out.
 *
 *   POSTHOG_PERSONAL_API_KEY=phx_… node scripts/posthog-insights.mjs [--dry-run]
 *
 * The personal API key (https://eu.posthog.com/settings/user-api-keys) needs the
 * `insight:write`, `dashboard:write` and `group:read` scopes. The `phc_…` project
 * key used by the app is write-only for events and cannot create insights.
 *
 * Optional env: POSTHOG_API_HOST (default https://eu.posthog.com — note this is
 * the app host, not the `eu.i.posthog.com` ingestion host), POSTHOG_PROJECT_ID
 * (auto-resolved to the first accessible project when unset).
 */

const API_HOST = (process.env.POSTHOG_API_HOST ?? 'https://eu.posthog.com').replace(/\/$/, '')
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY
const DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !DRY_RUN) {
  console.error('POSTHOG_PERSONAL_API_KEY is required (create one at %s/settings/user-api-keys)', API_HOST)
  process.exit(1)
}

const api = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${API_HOST}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 500)}`)
  return text ? JSON.parse(text) : null
}

// Paginated GET, following `next` until exhausted.
const apiList = async (path) => {
  const results = []
  let next = path
  while (next) {
    const page = await api(next.startsWith('http') ? next.slice(API_HOST.length) : next)
    results.push(...(page.results ?? []))
    next = page.next
  }
  return results
}

// ---------------------------------------------------------------------------
// Query builders
// ---------------------------------------------------------------------------

const event = (name, extra = {}) => ({ kind: 'EventsNode', event: name, name, ...extra })

/** An event step narrowed to one property value, e.g. only pageviews on the marketing site. */
const eventWhere = (name, key, value, label, operator = 'exact') =>
  event(name, {
    ...(label ? { custom_name: label } : {}),
    properties: [{ key, value, operator, type: 'event' }],
  })

// Shared first step of the cross-site funnels. Anchored on `$host` (always
// present) rather than the `site` super property because `site: 'web'` only
// exists once the marketing repo ships its registration — migrate this to
// `site = 'web'` at that point, and it will also stop under-counting if the
// website ever serves under www. or a custom domain.
const webPageview = eventWhere('$pageview', '$host', 'vocdoni.io', 'Pageview on vocdoni.io')

/**
 * `aggregation_group_type_index` makes a funnel count organizations instead of
 * people — the right unit for a B2B product, where several colleagues share one
 * account's journey. Left null for funnels that start before an org exists.
 */
const funnel = ({
  name,
  description,
  steps,
  groupTypeIndex = null,
  windowInterval = 30,
  windowUnit = 'day',
  vizType = 'steps',
  breakdown = null,
  breakdownType = 'event',
  dateFrom = '-90d',
  extraFilter = {},
}) => ({
  name,
  description,
  query: {
    kind: 'InsightVizNode',
    source: {
      kind: 'FunnelsQuery',
      series: steps.map((step) => (typeof step === 'string' ? event(step) : step)),
      dateRange: { date_from: dateFrom },
      filterTestAccounts: true,
      ...(groupTypeIndex === null ? {} : { aggregation_group_type_index: groupTypeIndex }),
      ...(breakdown ? { breakdownFilter: { breakdown, breakdown_type: breakdownType } } : {}),
      funnelsFilter: {
        funnelOrderType: 'ordered',
        funnelVizType: vizType,
        funnelWindowInterval: windowInterval,
        funnelWindowIntervalUnit: windowUnit,
        ...extraFilter,
      },
    },
  },
})

const trend = ({
  name,
  description,
  series,
  breakdown = null,
  breakdownType = 'event',
  interval = 'week',
  dateFrom = '-90d',
  display = 'ActionsLineGraph',
}) => ({
  name,
  description,
  query: {
    kind: 'InsightVizNode',
    source: {
      kind: 'TrendsQuery',
      series,
      interval,
      dateRange: { date_from: dateFrom },
      filterTestAccounts: true,
      ...(breakdown ? { breakdownFilter: { breakdown, breakdown_type: breakdownType } } : {}),
      trendsFilter: { display },
    },
  },
})

// ---------------------------------------------------------------------------
// The plan: dashboards and the insights they hold
// ---------------------------------------------------------------------------

const buildPlan = (orgIndex) => {
  // Aggregating by organization needs the group type to exist in the project. It
  // only appears once the app has sent its first `organization` group, so fall
  // back to person aggregation rather than emitting an invalid query.
  const byOrg = orgIndex
  const orgMath = orgIndex === null ? {} : { math: 'unique_group', math_group_type_index: orgIndex }

  const activationSteps = ['account_signed_up', 'organization_created', 'process_created']

  return [
    {
      dashboard: {
        name: 'Vocdoni · Activation',
        description: 'From signup to a first published election, and what stalls on the way.',
      },
      insights: [
        funnel({
          name: 'Activation · signup → org → first election',
          description:
            'Person-level: signup happens before an organization exists, so this one cannot be aggregated by org. 30-day conversion window.',
          steps: activationSteps,
        }),
        funnel({
          name: 'Activation · time to first election',
          description: 'How long the org creation → first election step takes, distributed across users.',
          steps: activationSteps,
          vizType: 'time_to_convert',
          extraFilter: { funnelFromStep: 1, funnelToStep: 2 },
        }),
        funnel({
          name: 'Activation · conversion over time',
          description: 'Weekly activation rate — the trend behind the funnel, so cohorts can be compared.',
          steps: activationSteps,
          vizType: 'trends',
        }),
        funnel({
          name: 'Memberbase adoption · org → import started → import completed',
          description:
            'Where CSV imports are abandoned. A wide gap between started and completed points at the column-mapping step.',
          steps: ['organization_created', 'members_import_started', 'members_import_completed'],
          groupTypeIndex: byOrg,
        }),
        trend({
          name: 'Organizations created (by name)',
          description:
            'Who signed up, by name. `org_name` rides on the creation event itself, since the group profile is only registered once the organization has been fetched.',
          series: [event('organization_created')],
          breakdown: 'org_name',
          display: 'ActionsTable',
        }),
      ],
    },
    {
      dashboard: {
        name: 'Vocdoni · Monetization',
        description: 'Paywall exposure, checkout conversion, and which blocked features drive upgrades.',
      },
      insights: [
        funnel({
          name: 'Monetization · paywall → checkout → subscription',
          description: 'Organization-level, 7-day window. Broken down by where the paywall was opened from.',
          steps: ['paywall_viewed', 'checkout_started', 'subscription_completed'],
          groupTypeIndex: byOrg,
          windowInterval: 7,
          breakdown: 'source',
        }),
        funnel({
          name: 'Monetization · blocked feature → upgrade',
          description:
            'Which locked feature actually converts. Breakdown by feature uses first-touch attribution, i.e. the feature that started the journey.',
          steps: ['feature_blocked', 'paywall_viewed', 'checkout_started', 'subscription_completed'],
          groupTypeIndex: byOrg,
          windowInterval: 14,
          breakdown: 'feature',
        }),
        trend({
          name: 'Paywall exposure per plan',
          description: 'How often each plan hits a wall — sustained pressure on one plan is a packaging signal.',
          series: [event('feature_blocked', orgMath)],
          breakdown: 'plan',
          display: 'ActionsBar',
        }),
      ],
    },
    {
      dashboard: {
        name: 'Vocdoni · Web → app',
        description:
          'What the marketing site actually produces. vocdoni.io and this app report into one PostHog project, so these funnels can cross the domain boundary.',
      },
      // Every funnel here stays person-level. The existing app funnels aggregate
      // by the `organization` group, which is right for them — but a website
      // visitor has no organization yet, so group aggregation would drop step
      // one and make the funnel look broken rather than empty.
      insights: [
        funnel({
          name: 'Web → app · website visit to first election',
          description:
            "The headline number: what share of website traffic ends in a published election. Broken down by the campaign that produced the first visit — because the anonymous id is created on the website, `$initial_utm_source` records the website's first touch, not the app's landing URL.",
          steps: [
            webPageview,
            eventWhere('cta_clicked', 'target', 'app', 'CTA into the app'),
            'account_signed_up',
            'organization_created',
            'process_created',
          ],
          breakdown: '$initial_utm_source',
          breakdownType: 'person',
        }),
        funnel({
          name: 'Web → app · which vertical converts',
          description:
            'Ten solution pages compete for the same effort. This ranks them by customers produced rather than sessions received, and the two rankings are rarely the same.',
          steps: ['solution_page_viewed', 'cta_clicked', 'account_signed_up', 'process_created'],
          breakdown: 'vertical',
        }),
        funnel({
          name: 'Web → app · blog post to signup',
          description:
            'Which article pays for itself. The 7-day window is deliberately tight: content that converts a month later is really being credited to something else.',
          steps: ['blog_post_viewed', 'cta_clicked', 'account_signed_up'],
          windowInterval: 7,
          breakdown: 'slug',
        }),
        funnel({
          name: 'Web → app · learn article to signup',
          description:
            'The same question for the evergreen guides, which have a different intent profile from the blog. Separate from the blog funnel because a funnel step is a single event.',
          steps: ['learn_article_viewed', 'cta_clicked', 'account_signed_up'],
          windowInterval: 7,
          breakdown: 'slug',
        }),
        funnel({
          name: 'Web → app · sales assist',
          description:
            'Puts a conversion rate on the Cal.com booking flow and, at the last step, a value on a booked call. A wide gap between requested and booked points at the booking widget itself.',
          steps: ['demo_requested', 'demo_booked', 'account_signed_up', 'subscription_completed'],
          windowInterval: 90,
          breakdown: 'location',
        }),
        funnel({
          name: 'Web → app · marketing-sourced revenue',
          description:
            'The money question, end to end, attributed to the campaign that started the journey rather than to the app URL the visitor happened to land on.',
          steps: [
            webPageview,
            'account_signed_up',
            'process_created',
            'paywall_viewed',
            'checkout_started',
            'subscription_completed',
          ],
          windowInterval: 90,
          breakdown: '$initial_utm_source',
          breakdownType: 'person',
        }),
        funnel({
          name: 'Web → app · activation by locale',
          description:
            'Eleven locales are maintained under a strict translation guardrail. This is what that investment returns per language; a locale converting far below its traffic share is usually a copy problem, not a demand problem.',
          steps: [
            webPageview,
            'cta_clicked',
            'account_signed_up',
            'organization_created',
          ],
          breakdown: 'locale',
        }),
        funnel({
          name: 'Web → app · docs to integrator signup',
          description:
            'platform.vocdoni.io is this app under a second domain, onto /integrators, so integrator signups already land in this project. The last step matches on $pathname rather than $host, because the same routes are reachable on app.vocdoni.io too. 14-day window: reading the docs and deciding to build is not a same-session decision.',
          steps: [
            'docs_page_viewed',
            eventWhere('cta_clicked', 'target', 'platform', 'CTA into the integrator dashboard'),
            eventWhere('account_signed_up', '$pathname', '/integrators', 'Integrator signup', 'icontains'),
          ],
          windowInterval: 14,
          breakdown: 'slug',
        }),
        trend({
          name: 'Revenue by first-touch channel',
          description:
            'Subscriptions attributed to the campaign that produced the very first visit. Needs no tagging discipline beyond UTMs on inbound links.',
          series: [event('subscription_completed')],
          breakdown: '$initial_utm_source',
          breakdownType: 'person',
          display: 'ActionsTable',
        }),
        trend({
          name: 'Event volume by site',
          description:
            'Both properties share one project and one 1M/month allowance. This is the split, and the early warning if the website starts eating the budget.',
          series: [event(null, { name: 'All events' })],
          breakdown: 'site',
          display: 'ActionsBar',
        }),
        trend({
          name: 'CTA clicks by page type',
          description:
            'Where intent actually happens on the marketing site. Reads off the `page_type` property, which is resolved at click time from the route.',
          series: [event('cta_clicked')],
          breakdown: 'page_type',
          display: 'ActionsBar',
        }),
      ],
    },
    {
      dashboard: {
        name: 'Vocdoni · Elections & engagement',
        description: 'The election creation wizard, and how many organizations keep coming back.',
      },
      insights: [
        funnel({
          name: 'Election wizard · template → census → created → results',
          description:
            'The creation flow in order: a template is picked, voter authentication (the census) is configured mid-wizard, the process is created, and results are opened later. Organization-level.',
          steps: ['process_template_selected', 'census_configured', 'process_created', 'process_results_viewed'],
          groupTypeIndex: byOrg,
        }),
        funnel({
          name: 'Election wizard · created vs failed',
          description: 'Creation attempts that ended in an error. Anything above a few percent is a bug, not friction.',
          steps: ['process_template_selected', 'process_creation_failed'],
          groupTypeIndex: byOrg,
          windowInterval: 1,
          windowUnit: 'hour',
        }),
        trend({
          name: 'Most active organizations (by name)',
          description:
            'Elections created per organization, named. Reads off the `org_name` super property, which is on every event, so it works without the group analytics add-on.',
          series: [event('process_created')],
          breakdown: 'org_name',
          display: 'ActionsTable',
        }),
        trend({
          name: 'Weekly active organizations',
          description: 'Distinct organizations emitting any event in the week. The retention denominator.',
          series: [event(null, { name: 'All events', ...orgMath })],
        }),
        trend({
          name: 'Elections created by census type',
          description: 'Volume split by how voters are authenticated — the main product-mix signal.',
          series: [event('process_created')],
          breakdown: 'census_type',
          display: 'ActionsBar',
        }),
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

const resolveProjectId = async () => {
  if (process.env.POSTHOG_PROJECT_ID) return process.env.POSTHOG_PROJECT_ID
  const projects = await apiList('/api/projects/?limit=100')
  if (!projects.length) throw new Error('no projects accessible with this key — check its organization/project scope')
  if (projects.length > 1) {
    console.warn(
      'Multiple projects visible; using "%s" (%s). Set POSTHOG_PROJECT_ID to pick another.',
      projects[0].name,
      projects[0].id
    )
  }
  return projects[0].id
}

const resolveOrgGroupIndex = async (projectId) => {
  const types = await api(`/api/projects/${projectId}/groups_types/`)
  const org = (Array.isArray(types) ? types : (types?.results ?? [])).find((t) => t.group_type === 'organization')
  if (!org) {
    console.warn(
      'No "organization" group type in this project yet — it appears after the app sends its first group event.\n' +
        'Funnels will aggregate by person for now; re-run this script once the group exists.'
    )
    return null
  }
  return org.group_type_index
}

const upsert = async (projectId, kind, existingByName, payload) => {
  const existing = existingByName.get(payload.name)
  if (DRY_RUN) {
    console.log('%s %s: %s', existing ? 'would update' : 'would create', kind, payload.name)
    return existing?.id ?? null
  }
  const path = `/api/projects/${projectId}/${kind}s/`
  const result = existing
    ? await api(`${path}${existing.id}/`, { method: 'PATCH', body: payload })
    : await api(path, { method: 'POST', body: payload })
  console.log('%s %s: %s (id %s)', existing ? 'updated' : 'created', kind, payload.name, result.id)
  return result.id
}

const main = async () => {
  // `--dry-run` without a key stays fully offline, so the plan can be reviewed
  // (and the query JSON diffed) before anyone provisions credentials.
  if (!API_KEY) {
    console.log('No POSTHOG_PERSONAL_API_KEY — printing the plan only, assuming organization group index 0.\n')
    for (const { dashboard, insights } of buildPlan(0)) {
      console.log('dashboard: %s', dashboard.name)
      for (const insight of insights) console.log('  %s\n    %s', insight.name, JSON.stringify(insight.query))
    }
    return
  }

  const projectId = await resolveProjectId()
  console.log('project %s @ %s%s', projectId, API_HOST, DRY_RUN ? ' (dry run)' : '')

  const orgIndex = await resolveOrgGroupIndex(projectId)
  const plan = buildPlan(orgIndex)

  const dashboardsByName = new Map(
    (await apiList(`/api/projects/${projectId}/dashboards/?limit=100`))
      .filter((d) => !d.deleted)
      .map((d) => [d.name, d])
  )
  const insightsByName = new Map(
    (await apiList(`/api/projects/${projectId}/insights/?basic=true&limit=500`))
      .filter((i) => !i.deleted && i.name)
      .map((i) => [i.name, i])
  )

  for (const { dashboard, insights } of plan) {
    const dashboardId = await upsert(projectId, 'dashboard', dashboardsByName, { ...dashboard, pinned: true })
    for (const insight of insights) {
      await upsert(projectId, 'insight', insightsByName, {
        ...insight,
        ...(dashboardId ? { dashboards: [dashboardId] } : {}),
      })
    }
  }

  console.log('\nDone. Dashboards: %s/project/%s/dashboard', API_HOST, projectId)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
