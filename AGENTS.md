# Repository Guidelines

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
- Review generated locale diffs and ensure new keys are translated for supported locales (`en`, `es`, `ca`, `it`) when applicable.
- Avoid leaving partial localization changes unreviewed.

## Testing Guidelines
- Test stack: Vitest + Testing Library (`jsdom` environment).
- Prefer behavior-focused tests over implementation-detail assertions.
- Keep tests close to the module being validated.
- Run targeted tests while iterating (example: `pnpm test src/queries/groups.test.ts`).

## Internal Dependencies Context
- This repository depends on maintained Vocdoni packages; changes may require validating upstream behavior.
- Key internal dependencies include `@vocdoni/sdk`, `@vocdoni/react-components`, and `@vocdoni/rainbowkit-wallets`.

## Rendering Architecture
- The app is no longer a pure SPA.
- Vike owns SSR for `/organization/:address` and `/processes/:id`.
- The rest of the app remains client-rendered behind the Vike SPA catch-all page.
- Keep this split incremental: do not move unrelated routes to SSR unless explicitly requested.
- For public SSR pages, prefer Vike `+data`, `+Head`, and page metadata over client-side document mutations.

## Commit & Pull Request Guidelines
- Follow existing Conventional Commit patterns from repo history (`fix(scope): ...`, `chore(scope): ...`, `refactor(scope): ...`).
- Keep commits scoped to one concern and use imperative summaries.
- PR descriptions should explain what changed, why, and how it was verified.

## Agent Working Rules (Codex)
- Treat this file as execution guidance for repository tasks.
- Before finishing any code change, always run `pnpm lint` and `pnpm test`.
- When text keys/locales are touched, also run `pnpm translations` before completion.
- Use `git diff` to review only relevant changes and avoid expanding context with unrelated files.
- If required commands fail, do not mark the task complete until failures are fixed or explicitly reported.
- Prefer focused, minimal diffs and avoid repo-wide formatting churn outside task scope.
