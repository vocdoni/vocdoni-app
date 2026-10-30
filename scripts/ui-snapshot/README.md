# Offline UI snapshot

A no-regression check for visual work (theme tokens, recipes, refactors that should change nothing
on screen). It renders the app's main screens against a local fake of the SaaS API, saves a
screenshot and the computed styles of every visible element, and compares two runs.

Nothing leaves the machine: the mock listens on `127.0.0.1` only, its data is invented, and the
browser blocks every request to a host other than localhost.

## Commands

```bash
# 1. Baseline, e.g. on develop
pnpm ui:snapshot -- --label before

# 2. Your change, same machine
pnpm ui:snapshot -- --label after

# 3. Compare. Exit code 0 = no difference, 1 = something changed.
pnpm ui:diff -- before after
```

`pnpm ui:snapshot` options:

| option                  | default       | what it does                                                              |
| ----------------------- | ------------- | ------------------------------------------------------------------------- |
| `--label <name>`        | required      | output folder: `.ui-snapshot/<name>/` (git-ignored; replaced on each run) |
| `--routes a,b`          | all           | only these route slugs (see `routes.mjs`); their states come along        |
| `--viewports 1440,390`  | `1440,390`    | widths; height is 900 (844 below 768)                                     |
| `--modes light,dark`    | `light,dark`  | colour modes                                                              |
| `--primary-color <hex>` | unset         | starts the app with `PRIMARY_COLOR`, to see a brand colour change         |
| `--url <base>`          | spawn the app | use an app you started yourself on localhost (see below)                  |
| `--no-warmup`           | warm-up on    | skip the warm-up pass (faster, but see "How determinism works")           |
| `--theme stress`        | `stock`       | renders with the stress theme and lists leaks (see "Stress theme")        |

`pnpm ui:diff -- <labelA> <labelB>` options: `--ignore width,height` drops properties from the
comparison; `--limit <n>` caps the elements printed per capture (default 50; totals always count
everything).

A full run (22 routes and 8 dialog/menu states at 2 widths and 2 modes: 114 captures) takes about 6
minutes and writes about 18 MB.

### What the snapshot does

1. Starts the mock (`mock-saas.mjs`) on `127.0.0.1:3999`.
2. Starts the dev server (`pnpm exec vike dev`, the same server as `pnpm dev`) on `127.0.0.1:3000` only, with `SAAS_URL` pointing at the mock, every
   third-party integration (GTM, Plausible, PostHog, Crisp, Stripe, Cal.com) switched off, and
   `PRIMARY_COLOR` when given. The values go in the process env, which wins over any `.env` file.
   If port 3000 is taken it stops with a message instead of letting vite move to another port;
   set `UI_SNAPSHOT_PORT=3005` (or any free port) to use another one.
   When `node_modules` is a symlink into another checkout (a shared worktree install), vite would
   refuse to serve the font files from there; the script then runs `pnpm exec vike dev`, the same
   server, with that path allowed through `VITE_CONFIG`.
3. Opens the app once and refuses to go on unless the app really talks to the mock.
4. Opens each route with Playwright (Chromium) and saves, per route × width × mode:
   - `<route>-<width>-<mode>.png`: full-page screenshot.
   - `<route>-<width>-<mode>.json`: computed styles of every visible element.
   - States (dialogs, menus, validation errors) are saved as `<route>--<state>-<width>-<mode>.*`,
     viewport-only.
5. Writes `summary.json` (commit, browser version, per capture the final URL, console errors,
   failed requests and blocked hosts; requests the mock had no handler for), `mock-requests.log`
   and `dev-server.log`, then stops the browser, the dev server and the mock, also on errors and
   Ctrl-C.

Logged-in pages get a fake session in localStorage (the key comes from
`src/providers/ApiClientProvider.tsx`); no form is ever submitted.

### The style JSON

Each visible element is keyed by a path from `body`: tag names, `:n` (nth-of-type) when the parent
has several children with that tag, and `[scope.part]` from Chakra's `data-scope`/`data-part`, e.g.
`body>div>div:2>button[dialog.trigger]`. An `svg` is recorded as a whole, not its shapes.

Saved properties: `color`, `background-color`, `background-image`, `border-color`, `border-width`,
`border-style`, `border-radius`, `box-shadow`, `outline`, `font-family`, `font-size`,
`font-weight`, `line-height`, `letter-spacing`, `text-transform`, `padding`, `margin`, `gap`,
`opacity`, `z-index`, `fill`, `stroke`, plus the rounded width and height. Shorthands cover the
four sides. Rows point into a table of distinct style tuples to keep the files small.

## How determinism works

Two runs on the same commit and machine must give `0` differences. What makes that hold:

- **Fixed clock**: the browser runs with `page.clock.setFixedTime` at 2026-06-15 10:00 UTC, inside
  the ongoing mock vote; timezone `Europe/Madrid` (also for the dev server), locale `en-US`.
- **Fixed data**: the mock uses fixed dates, never "now".
- **Seeded `Math.random`**: the auth pages' testimonial picks the same one every run.
- **No motion**: `reducedMotion: 'reduce'`, injected CSS that turns off transitions, animations,
  smooth scrolling and the caret, and Playwright's own `animations: 'disabled'` on screenshots.
- **No network**: requests to any non-localhost host are blocked and listed in `summary.json`.
  External images get a transparent pixel, iframes a blank page, scripts an empty file (so
  embeds like the YouTube player stay idle instead of throwing), everything else is aborted.
- **Settled pages**: network idle, no visible spinner or skeleton, `document.fonts.ready`, and the
  DOM size, page height and text length unchanged on three polls in a row.
- **Warm-up**: vite optimizes dependencies the first time a route needs them and reloads the page
  when it does. A warm-up pass visits every route first, and repeats while vite keeps reloading.
  Reloads during the capture are listed in `summary.json` (`devServerReloadsDuringCapture`).

Compare runs from the same machine and browser: `ui:diff` warns when the browser versions differ.
The browser is Playwright's bundled Chromium, or Chrome when that is not installed; force one with
`UI_SNAPSHOT_CHANNEL=chrome` (or `chromium`, `msedge`).

## Stress theme

```bash
pnpm ui:snapshot -- --label stress --theme stress
```

`src/theme/test-themes/stress.ts` keeps the app's tokens and recipes and moves every value they resolve
to: each semantic colour (surface layers, states, statuses, charts, palette slots) gets its own saturated
colour, shadows are coloured, fonts are named `Stress …`, and radii, font sizes and spacing are one pixel
off the stock scale. The dev server swaps it in for `~theme/system` with a vite
alias, so the app code is untouched. Whatever still shows a stock value on screen bypasses the theme.

After each capture the script lists, per visible element: text not in a `Stress` font, a stock font size,
radius, padding or gap, a grey colour, background, border or shadow, and a palette step (`gray.500`)
read directly. `stress-report.json` holds the counts with examples. The run fails on any count above
`stress-baseline.json`, the leaks known on the branch it was written on; after a fix, lower it with
`--update-stress-baseline` (a `--routes` run updates only its captures). Elements that keep stock values on
purpose are listed with a reason in `STRESS_EXCEPTIONS` (`stress.mjs`). CI runs it on pull requests that
touch `src/` (the `stress-theme` job in `.github/workflows/test.yml`) and keeps the run as an artifact.

With your own dev server, start it with the alias and pass `--url`; the run stops if the stress theme is
not the one rendering:

```bash
SAAS_URL=http://127.0.0.1:3999 \
  VITE_CONFIG="{\"resolve\":{\"alias\":{\"~theme/system\":\"$PWD/src/theme/test-themes/stress.ts\"}}}" pnpm dev
```

## Use your own dev server

```bash
SAAS_URL=http://127.0.0.1:3999 pnpm dev            # another terminal; the mock starts with the snapshot
pnpm ui:snapshot -- --label mine --url http://localhost:3000
```

Only localhost URLs are accepted, and the run stops if the app is not configured with the mock as
its `SAAS_URL`. Third-party keys from your `.env` stay active in this mode (they are blocked at the
network level anyway), so a self-started server can render slightly differently from a spawned one:
compare like with like.

## Add a route

Add an entry to `ROUTES` in `routes.mjs`:

```js
{ slug: 'settings-billing', path: '/admin/settings/billing' },               // logged in
{ slug: 'some-public-page', path: '/some/page', auth: false },              // logged out
{
  slug: 'memberbase-members',
  path: '/admin/memberbase/members',
  states: [{ slug: 'add-member', open: [[['button', /^Add member$/i]]] }],  // click, then capture
},
```

`path` has no language prefix (the snapshot opens `/en<path>`). Each state step clicks the first
visible match among its candidates (`[role, name]` or `['css', selector]`); use `viewports: [1440]`
when the trigger only exists on desktop. If the screen needs data the mock lacks, add a handler in
`mock-saas.mjs` (`summary.json` lists every request the mock could not answer under
`mockUnmatched`). Take a new baseline after adding routes: `ui:diff` counts a capture that exists on
one side only as a difference.

## Known limits

- **Mock data, no backend.** Screens show what the mock returns: one admin user, one organization
  on the professional plan, three votes (draft, ongoing, ended with results), ten members, two
  groups, a team of three. Screens or states that need other data (empty states, errors, other
  plans, a vote in progress) are not covered. Writes answer `200 {}` and change nothing.
- **Public SSR pages log one hydration error.** `/processes/:id` is server-rendered by the dev
  server with the real clock while the browser runs on the fixed one, so relative dates ("in over 4
  years" vs "3 months ago") differ and React re-renders that tree on the client. What gets captured
  is the client render, which is deterministic.
- **Two more expected console errors**: the admin results page reads each ended question's end
  date from the public vochain gateway (`api-dev.vocdoni.net`), which is blocked, and the app
  logs `[ProcessCreate] Validation failed` on purpose in the `publish-errors` state.
- **Blocked third parties render as placeholders**: the tutorial video is an empty frame, the
  "Schedule a call" dialog says booking is unavailable, Stripe never loads.
- **Full-page captures of fixed elements**: a `100vh` sidebar ends at the viewport height, and
  sticky or fixed bars (mobile vote bar, chat button) appear where the viewport was.
- Desktop-only states: the user menu, the end-vote confirmation and the voter authentication
  dialog sit behind other menus at phone width and are captured at 1440 only.
- Computed styles do not see text content, pseudo-elements or anything inside an `svg`; the
  screenshots do. The diff prints how many screenshots are byte-identical, for information only:
  a few differ between identical runs by some anti-aliased pixels.
