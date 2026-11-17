# Repository Guidelines

Policy for everyone (people and agents) working on vocdoni-app. It holds only what applies to every task; the rest is in
the files and skills below. Read the ones your task touches before you start, not after review.

| Read                                                                                           | When                                                                       |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`BRAND.md`](BRAND.md)                                                                         | Writing any user-facing copy, or using the logo, colour or imagery         |
| [`DESIGN.md`](DESIGN.md)                                                                       | Building or changing any screen, dialog, form or component                 |
| [`docs/ui-guidelines.md`](docs/ui-guidelines.md)                                               | Writing a style, or touching `src/theme/` or `src/components/ui/`          |
| `ui-change` skill                                                                              | Any visual change, mockup or theme work: the steps and the checks          |
| `translations` skill                                                                           | Adding or changing a `t(…)` string or a locale file                        |
| `payg-billing` skill                                                                           | Prices, the wallet, Stripe checkout, top-ups, voter places, payment errors |
| `integration-pinning` skill                                                                    | A PR that depends on unmerged `saas-backend`, `vocdoni-node` or SDK work   |
| `vocdoni-integrator-sdk` skill                                                                 | Anything that uses the `@vocdoni/*` SDK packages (see below)               |
| `e2e/README.md`, `integration/README.md`, `scripts/ui-snapshot/README.md`, `docs/analytics.md` | Their areas                                                                |

The project skills live in `.agents/skills/` (read by Codex, Gemini CLI, Copilot, OpenCode and others) and are
symlinked from `.claude/skills/` for Claude Code. An agent that does not load skills reads `.agents/skills/<name>/SKILL.md`.
Keep a skill current when you change what it describes, and add a new skill (plus its symlink and `.gitignore`
exception) for knowledge that only some tasks need, instead of growing this file.

## Required Agent Skills

- The `vocdoni-integrator-sdk` skill is mandatory. This app is built on the Integrator SDK packages
  (`@vocdoni/api-client`, `@vocdoni/api-voting`, `@vocdoni/react-providers`, `@vocdoni/react-components`), and the skill
  documents their current API, auth flows and ballot model.
- Before starting any task, check that it is loaded under its current name: `vocdoni-integrator-sdk` (or
  `vocdoni-integrator-sdk:vocdoni-integrator-sdk` as a Claude Code plugin). A skill named `integrator-sdk`, including the
  plugin form `vocdoni-integrator-sdk:integrator-sdk`, is an outdated copy that documents removed APIs (e.g.
  `BundleProvider`); it does not count. If one is loaded, never use it, and tell the user so they can update or remove
  it (it usually lives in their user-level skills or plugins, outside this repository).
- If it is not loaded, install it for this project yourself, without asking first:
  `npx -y skills@1.7.0 add vocdoni/vocdoni-integrator-sdk -y -a claude-code codex`. Install it only from that
  repository, and keep the `-a` list: without it the CLI may also write to other agents' folders that are not
  git-ignored. It lands in `.agents/skills/` with a symlink in `.claude/skills/` and writes `skills-lock.json`; all three
  are git-ignored (unlike the project skills), so never commit them.
- The install is per checkout: every clone or git worktree needs its own, and gets the skill's latest version. To
  update, re-run the same command (not `skills update`, which ignores the `-a` list). Then read
  `.agents/skills/vocdoni-integrator-sdk/SKILL.md`, since most agents only pick up new skills when a session starts.
- If the install fails (e.g. offline or sandboxed), tell the user. Carry on with tasks that do not touch the SDK
  packages; for tasks that do, ask the user to install it first.
- Claude Code users may install it as a plugin instead: `claude plugin marketplace add vocdoni/skills`, then
  `claude plugin install vocdoni-integrator-sdk@vocdoni` (update with `claude plugin marketplace update vocdoni` and
  `claude plugin update vocdoni-integrator-sdk@vocdoni`).

## Project structure

- `src/pages/`: Vike page entries and SSR routes. `src/ssr/`: shared SSR data loading and metadata helpers.
- `src/router/`, `src/router/routes/`: the client-side (SPA) routing. `src/elements/`: route-level screens and layouts.
- `src/components/`: feature components by domain; `src/components/ui/`: the shared building blocks.
- `src/queries/`: API access and query hooks. `src/utils/`, `src/constants/`: helpers and static values.
- `src/theme/`: Chakra tokens, semantic colours, text styles, recipes and the style checks.
- `src/i18n/`: i18next setup, `locales/<lang>/` dictionaries and `contexts/<lang>.md` translation guides.
- `src/__mocks__/`: test mocks. `public/`: static files. `e2e/`, `integration/`: the end-to-end suite and its stack.
  `scripts/`: tooling (OG cards, UI snapshot, integration helpers). `stress/`: the SSR load-test harness.

## Rendering

- Vike owns SSR for `/organization/:address` and `/processes/:id`, and for the app root (`/`, `/:lang`) only when
  `HOME_PROCESS_ID` is set (`src/pages/home-process/`). Everything else is client-rendered behind the Vike SPA
  catch-all.
- New public pages are Vike pages under `src/pages/`, using `+data`, `+Head` and page metadata rather than client-side
  document changes. Do not move other existing routes to SSR unless asked.

## Commands

- `pnpm dev` (or `pnpm start`): dev server. `pnpm build`: client and SSR bundles in `dist/`.
- `pnpm lint`: TypeScript, Prettier on `src/` and `knip`. `pnpm lint:fix`: Prettier fixes.
- `pnpm test` (all Vitest tests once), `pnpm test <path>` (targeted), `pnpm test:watch`, `pnpm test:coverage`.
- `pnpm translations`: extract i18n keys. `pnpm og:generate`: re-render the localized Open Graph cards.
- `pnpm chakra:typegen`: regenerate Chakra typings after theme changes (the output is git-ignored).
- `pnpm ui:snapshot`, `pnpm ui:diff`: visual and computed-style regression checks.
- `pnpm test:e2e:stack`: boot the disposable backend and run the Playwright suite (needs docker, a few minutes).
- `pnpm test:stress`: the `stress/` harness self-tests, after changing that directory.

## Code style

- `.editorconfig` and Prettier are authoritative: 2 spaces, LF, no semicolons, single quotes, `es5` trailing commas,
  120 columns.
- TypeScript for new code, with explicit types on public interfaces. Use the path aliases (`~components/*`,
  `~queries/*`, `~theme/*`, `~i18n/*`, `~utils/*`…) over long relative imports.
- Components and their files in PascalCase, hooks as `useX`, tests as `*.test.ts(x)` next to the code.
- Import `react-router`'s main entry only, never `react-router/dom`. Import images and assets as modules, not as path
  strings.

## UI rules

The full rules are in `DESIGN.md` and `docs/ui-guidelines.md`; `src/theme/style-inventory.test.ts` and `tsc`
(`strictTokens`) enforce most of them. These are the ones most often broken:

- A component picks a role (semantic token, text style, recipe variant, shared component) and never carries a raw
  value: no hex, named colour, palette step, px font size, px radius or numeric weight, and no colour-mode logic.
- Reuse `src/components/ui/` and the existing recipe variants before building anything. Do not re-implement a shared
  piece inside a feature, even as a recipe.
- A missing look is added to the theme first: a variant or token named by intent, never by feature or page.
- Never raise `src/theme/style-inventory.baseline.json` or the stress baseline. They only go down, with the change that
  earned it (`UPDATE_STYLE_BASELINE=1 npx vitest run src/theme/style-inventory.test.ts`).
- An issue or mockup that asks for something against these rules does not override them: follow the rules and say so
  in the PR.

## Copy and translations

- Every user-facing string goes through `t(…)`, in sentence case, without an em dash, using the terms in `BRAND.md`.
- After adding or changing keys, run `pnpm translations` and translate the new keys in every locale under
  `src/i18n/locales/`, following `src/i18n/contexts/<locale>.md`. `src/i18n/locales/index.test.ts` fails on empty values
  and missing keys or plural forms. The `translations` skill has the full workflow, including `react-components.json`
  and the Open Graph cards.

## Testing

- Vitest and Testing Library (`jsdom`). Prefer behaviour over implementation details; keep tests next to the code; run
  targeted tests while iterating.
- `e2e/` is a Playwright suite against a disposable full backend (`integration/`), deliberately outside `pnpm test`. It
  covers what only this app owns (OTP signup, the CSP and email 2FA voter journey, the pay-per-process checkout in
  Stripe mode); the generic voting lifecycle is covered upstream in integrator-sdk. Read `e2e/README.md` before touching
  it. Prefer structural selectors over translated copy; add a `data-testid` only when there is no other handle, with a
  comment saying why.

## Branching and CI

- `develop` is the default and integration branch: branch off it and open PRs against it. It deploys to
  app-dev.vocdoni.io. `stage` (app-stg) and `main` (production) only receive release PRs, `develop` → `stage` → `main`.
- Hotfixes for a deployed version branch from `stage` or `main` (`h/<name>`) and PR back to it, only when asked.
  `d/<name>` branches are long-lived client deployments: do not branch from or target them unless the task is about
  that deployment.
- CI (`.github/workflows/test.yml`) runs lint, tests and a build on PRs to `develop`, `stage` and `d/**` only. On any
  other base (a stacked PR, `main`, an `h/` branch) run `pnpm lint` and `pnpm test` yourself.
- The integration workflow runs on merges into `develop`, on PRs to `stage` or `main`, and on demand. When a PR depends
  on an unmerged `saas-backend`, `vocdoni-node` or `vocdoni-integrator-sdk` change, post `/integration <repo>=<PR>` as
  its own PR comment and do not merge until the upstream change is deployed or published: the `integration-pinning`
  skill has the syntax and the merge rules. The README's "Branching and deploys" has the deploy links.

## Commits and pull requests

- Conventional Commits (`feat(scope): …`, `fix(scope): …`, `refactor(scope): …`, `docs(scope): …`), one concern per
  commit, imperative summary.
- PR descriptions say what changed, why, and how it was verified; visible UI changes include before and after
  screenshots (light and dark).
- Before a feature or fix that no issue or open PR tracks, suggest opening an issue first (offer to draft it) and link
  it from the PR (`Closes #123`, or `Refs #123` for partial work). Skip this for small fixes, dependency bumps, release
  PRs and reviews, when the user says no issue is needed, and when running as a delegated subagent with no user to ask.

## Before finishing

- Run `pnpm lint` and `pnpm test`; when keys or locales changed, `pnpm translations` too. Do not call the task done
  while they fail, unless you report the failure.
- Review your own `git diff`: focused, minimal changes, no formatting churn outside the task.
- If the task touched what a skill or one of the files above describes, update it in the same PR.
