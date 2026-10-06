# Repository Guidelines

## Required Agent Skills
- The `vocdoni-integrator-sdk` skill is mandatory. This app is built on the Integrator SDK packages
  (`@vocdoni/api-client`, `@vocdoni/api-voting`, `@vocdoni/react-providers`, `@vocdoni/react-components`),
  and the skill documents their current API, auth flows and ballot model.
- Before starting any task, check that the skill is loaded under its current name: `vocdoni-integrator-sdk`
  (or `vocdoni-integrator-sdk:vocdoni-integrator-sdk` when installed as a Claude Code plugin). A skill named
  `integrator-sdk`, including the plugin form `vocdoni-integrator-sdk:integrator-sdk`, is an outdated copy that
  documents removed APIs (e.g. `BundleProvider`); it does not count.
- If it is not loaded, install it for this project yourself, without asking first:
  `npx -y skills@1.7.0 add vocdoni/vocdoni-integrator-sdk -y -a claude-code codex`. Install it only from that
  repository, and keep the `-a` list: without it the CLI may also write to other agents' folders that are not
  git-ignored. This puts the skill in `.agents/skills/` (read by Codex, Gemini CLI, Copilot, OpenCode and others),
  symlinks it into `.claude/skills/` for Claude Code, and writes `skills-lock.json`. All of these are git-ignored;
  never commit them.
- The install is per checkout: every clone or git worktree needs its own, and each one gets the skill's latest
  version at install time. To bring an older install up to date, re-run the same install command (not
  `skills update`, which ignores the `-a` list).
- After installing, load the skill: read `.agents/skills/vocdoni-integrator-sdk/SKILL.md` now, since most agents
  only pick up new skills when a session starts.
- If the install fails (e.g. offline or sandboxed), tell the user. Carry on with tasks that do not touch the
  Integrator SDK packages; for tasks that do, ask the user to install the skill before continuing.
- Claude Code users may install it instead as a plugin from the Vocdoni marketplace
  (`claude plugin marketplace add vocdoni/skills`, then `claude plugin install vocdoni-integrator-sdk@vocdoni`).
  An outdated plugin install is updated with `claude plugin marketplace update vocdoni`, then
  `claude plugin update vocdoni-integrator-sdk@vocdoni`.

## Project Structure & Module Organization
- `src/components/`: reusable UI and feature components (organized by domain).
- `src/elements/`: route-level screens composed from components.
- `src/pages/`: Vike page entries and SSR route definitions.
- `src/router/` and `src/router/routes/`: application routing and route mappings.
- `src/ssr/`: shared SSR data loading and metadata helpers for Vike pages.
- `src/queries/`: API/data access logic and related domain query helpers.
- `src/utils/`: shared utility functions.
- `src/constants/`: static constants and configuration values used in code.
- `src/theme/`: Chakra theme tokens, system config, and visual recipes.
- `src/i18n/` and `src/i18n/locales/`: language setup and translation dictionaries.
- `src/__mocks__/`: test mocks for external/problematic modules.
- `public/`: static files served directly by Vite.

## Build, Test, and Development Commands
- `pnpm start` or `pnpm dev`: run the local Vike + Vite development server.
- `pnpm build`: create the production client and SSR bundles in `dist/client` and `dist/server`.
- `pnpm lint`: run TypeScript checks and Prettier validation on `src/`.
- `pnpm lint:fix`: apply Prettier formatting fixes.
- `pnpm test`: run all Vitest tests once.
- `pnpm test:watch`: run tests in watch mode.
- `pnpm test:coverage`: generate coverage reports.
- `pnpm test:stress`: run the load-test harness self-tests in `stress/` (excluded from `pnpm test`; run after changing that directory).
- `pnpm test:e2e:stack`: boot the disposable backend and run the Playwright end-to-end suite (needs docker).
- `pnpm translations`: extract i18n keys from source code and update locale files.
- `pnpm chakra:typegen`: regenerate Chakra typings after theme/system changes.

## Coding Style & Naming Conventions
- Follow `.editorconfig`: UTF-8, LF, 2-space indentation, final newline.
- Prettier rules are authoritative: no semicolons, single quotes, trailing commas (`es5`), `printWidth: 120`.
- Use TypeScript for new code and keep typing explicit in public interfaces.
- Prefer configured path aliases over long relative imports. Common aliases include `~components/*`, `~queries/*`, `~theme/*`, `~i18n/*`, and `~utils/*`.
- Naming patterns: components/files in PascalCase, hooks in `useX` format, tests as `*.test.ts` or `*.test.tsx` near related code.

## Internationalization Workflow
- Any new user-facing text must go through i18next (`t(...)`/translation keys), not hardcoded strings.
- After adding or changing translation keys, always run `pnpm translations`.
- Review generated locale diffs and translate new keys for every supported locale: each directory under `src/i18n/locales/` (`ca`, `de`, `el`, `es`, `eu`, `fr`, `it`, `pt`, `pt-br`). `pnpm translations` adds them as empty strings, and with `returnEmptyString: false` an empty value falls back to English.
- Avoid leaving partial localization changes unreviewed.
- Per-locale translation guidance lives in `src/i18n/contexts/` (one file per locale, e.g. `es.md`, `ca.md`; `en` is the source language and has none). These files are prompts that capture tone, register, glossary terms, and non-translatable terms (placeholders, component tags, brand/product names) for each language. Read the whole file, glossary included, before translating or reviewing strings for a locale, follow it, and keep it updated whenever its conventions change.
- `react-components.json` overrides the strings `@vocdoni/react-components` ships, which are English only. `pnpm translations` does not manage it, so when the package adds keys (e.g. after an upgrade), add their translations by hand to every non-English locale. English falls back to the package's own text and only needs a key to change its wording.
- `src/i18n/locales/index.test.ts` fails when a locale has an empty, whitespace-only or null value, or lacks a key or CLDR plural form (e.g. `_many`) that English has. For `react-components`, "English" is the keys the installed package ships plus the app's own. It does not compare placeholders, so check that `{{ … }}` variables and component tags match English yourself.

## Testing Guidelines
- Test stack: Vitest + Testing Library (`jsdom` environment).
- Prefer behavior-focused tests over implementation-detail assertions.
- Keep tests close to the module being validated.
- Run targeted tests while iterating (example: `pnpm test src/queries/groups.test.ts`).

### End-to-end tests
- `e2e/` holds a Playwright suite (`*.e2e.ts`) that drives a real browser against a disposable
  full backend (mongo + vocone + saas-backend + MailHog, see `integration/`). Read
  `e2e/README.md` before touching it.
- It is deliberately **not** part of `pnpm test`, which stays fast and unit-only. Run it with
  `pnpm test:e2e:stack` (needs docker); it takes a few minutes.
- It covers what only this app owns: the OTP signup journey and the CSP + email-2FA voter
  journey. The generic voting lifecycle is covered upstream in integrator-sdk — don't duplicate
  it here.
- While the stack is up, every email the backend sends is browsable at `localhost:8025`. This is
  the practical way to debug 2FA/verification flows by hand.
- Prefer structural selectors (`name`, `data-value`, `button[type="submit"]`) over translated
  copy. Add a `data-testid` in `src/` only when there is no such handle, and comment why.

## Internal Dependencies Context
- This repository depends on maintained Vocdoni packages; changes may require validating upstream behavior.
- Key internal dependencies include `@vocdoni/sdk`, `@vocdoni/react-components`, and `@vocdoni/rainbowkit-wallets`.

## Rendering Architecture
- The app is no longer a pure SPA.
- Vike owns SSR for `/organization/:address` and `/processes/:id`.
- The app root (`/` and `/:lang`) is also SSR, but only when `HOME_PROCESS_ID` is set: it then renders
  that process' voting page (`src/pages/home-process/`). Unset, the root stays with the SPA catch-all.
- The rest of the app remains client-rendered behind the Vike SPA catch-all page.
- Keep this split incremental: do not move unrelated routes to SSR unless explicitly requested.
- For public SSR pages, prefer Vike `+data`, `+Head`, and page metadata over client-side document mutations.

## Branching Model
- `develop` is the default and integration branch. Branch new work off `develop` and open PRs against it unless told
  otherwise. It deploys to app-dev.vocdoni.io (SaaS api-dev, vochain dev).
- `stage` deploys to app-stg.vocdoni.io (SaaS api-stg, vochain LTS) and `main` is production, app.vocdoni.io (SaaS
  api-lts, vochain LTS). Do not target them with feature or fix PRs: they only receive release PRs, `develop` →
  `stage` → `main`.
- Hotfixes for an already deployed version are the one exception: branch from `stage` or `main` (e.g. `h/<name>`) and
  PR back to that same branch. Only do this when explicitly asked.
- `d/<name>` branches are long-lived, client-specific deployments that diverge from `develop`. Do not branch from or
  target them unless the task is about that deployment.
- CI follows the base branch (`.github/workflows/test.yml`): PRs to `develop` run lint, tests and the dev build; PRs to
  `stage` or `d/**` run them with the stg build. PRs to any other base (`main`, an `h/` branch, or a feature branch in a
  stacked PR) get neither job, so a green check there means lint and tests never ran: run `pnpm lint` and `pnpm test`
  locally. The integration workflow (`.github/workflows/integration.yml`) runs on merges into `develop` and on every PR
  to `stage` or `main`, release and hotfix alike.
- The full flow and deploy links are in the README's "Branching and deploys" section.

## Commit & Pull Request Guidelines
- Follow existing Conventional Commit patterns from repo history (`fix(scope): ...`, `chore(scope): ...`, `refactor(scope): ...`).
- Keep commits scoped to one concern and use imperative summaries.
- PR descriptions should explain what changed, why, and how it was verified.

## Agent Working Rules
- Treat this file as execution guidance for repository tasks.
- Make sure the required skills are loaded first (see Required Agent Skills).
- Before finishing any code change, always run `pnpm lint` and `pnpm test`.
- When text keys/locales are touched, also run `pnpm translations` before completion.
- Use `git diff` to review only relevant changes and avoid expanding context with unrelated files.
- If required commands fail, do not mark the task complete until failures are fixed or explicitly reported.
- Prefer focused, minimal diffs and avoid repo-wide formatting churn outside task scope.
