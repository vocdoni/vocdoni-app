# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Vocdoni's UI Scaffold, a React application for the Vocdoni voting protocol. It uses the Vocdoni SDK and UI Components library to provide a SaaS platform for digital voting. Built with Vite, deployed at https://app.vocdoni.io/.

## Development Commands

### Build & Development
- `pnpm start` or `pnpm dev` - Start development server at http://localhost:5173
- `pnpm build` - Production build to `dist/` folder
- `pnpm lint` - Run TypeScript checks and Prettier validation
- `pnpm lint:fix` - Auto-format code with Prettier

### Testing
- `pnpm test` - Run all Vitest unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Open Vitest UI
- `pnpm test:coverage` - Generate test coverage report

### Other Commands
- `pnpm translations` - Extract i18n strings to `i18n/locales` JSON files

## Environment Configuration

Environment variables are set in `.env.local` or passed as CLI prefixes. Key variables include:

- `VOCDONI_ENVIRONMENT` - Target environment: `dev`, `stg`, or `prod` (defaults to `stg`)
- `BASE_URL` - Public base path for build
- `BUILD_PATH` - Build output directory
- `CUSTOM_ORGANIZATION_DOMAINS` - JSON-stringified object mapping domains to organization IDs

Example:
```bash
VOCDONI_ENVIRONMENT=dev pnpm start
BUILD_PATH=build/dev BASE_URL=/ui-scaffold/dev VOCDONI_ENVIRONMENT=dev pnpm build
```

All environment variables are injected at build time via `vite.config.ts` using `import.meta.env.*`.

## Architecture

### Project Structure
- `src/components/` - Feature-based React components organized by domain (Account, Auth, Organization, Process, etc.)
- `src/elements/` - Smaller UI building blocks (account, dashboard, organization, processes)
- `src/router/` - React Router configuration with route definitions and protected route wrappers
- `src/queries/` - TanStack Query hooks and query keys
- `src/utils/` - Utility functions (analytics, validation, strings, etc.)
- `src/constants/` - App-wide constants including subscription permissions, plans, and helpers
- `src/theme/` - Chakra UI theme customization
- `src/i18n/` - Internationalization setup with i18next

### Path Aliases (defined in `tsconfig.paths.json`)
- `~components/*` → `src/components/*`
- `~elements/*` → `src/elements/*`
- `~routes` → `src/router/routes/index.ts`
- `~queries/*` → `src/queries/*`
- `~utils/*` → `src/utils/*`
- `~constants` → `src/constants/index.ts`
- `~theme` → `src/theme/index.ts`
- `~i18n` → `src/i18n/index.ts`

### Key Architectural Patterns

**Provider Hierarchy** (see `src/Providers.tsx`):
1. Theme (Chakra UI + color mode)
2. WagmiProvider (Web3 wallet connection)
3. QueryClientProvider (TanStack Query)
4. AuthProvider → SubscriptionProvider → SaasAccountProvider (Authentication & authorization)
5. ClientProvider (Vocdoni SDK)
6. ConnectionToastProvider (Network status monitoring)
7. AnalyticsProvider (Plausible/GTM tracking)

**Routing Architecture**:
- Routes defined in `src/router/routes/index.ts` as a typed constant
- Route configuration split across `auth.tsx`, `dashboard.tsx`, and `root.tsx`
- Protected routes use wrapper components: `AccountProtectedRoute`, `OrganizationProtectedRoute`
- All routes use `SuspenseLoader` for code splitting

**State Management**:
- TanStack Query for server state (queries defined in `src/queries/`)
- React Context for auth, subscription, and SaaS account state
- Query keys centralized in `src/queries/keys.ts`

**Environment Handling**:
- `VOCDONI_ENVIRONMENT` controls SDK connection (dev/stg/prod chains)
- Multiple environment-specific URLs (SAAS, OAuth, CSP, Stripe)
- Custom organization domains can override homepage

## Testing

### Unit Tests (Vitest)
- Located alongside source files as `*.test.ts` or `*.test.tsx`
- Setup in `vitest.setup.ts` - includes Chakra UI matchMedia mock and environment variables
- Mock packages in `src/__mocks__/` for analytics and GTM
- Configuration in `vitest.config.ts` - uses jsdom environment, excludes e2e tests

## Deployment & Branching

Three branches map to deployments:
- `develop` → app-dev.vocdoni.io (SaaS api-dev + vochain dev)
- `stage` → app-stg.vocdoni.io (SaaS api-stg + vochain LTS)
- `main` → app.vocdoni.io (SaaS api-lts + vochain LTS)

Standard flow: `feature branch → develop → stage → main`

Hotfixes branch directly from target (`h/fix-name` from `stage` or `main`).

## Key Dependencies

- **Vocdoni SDK** (`@vocdoni/sdk`) - Core voting protocol SDK
- **Vocdoni Packages** - `@vocdoni/chakra-components`, `@vocdoni/react-providers`, `@vocdoni/rainbowkit-wallets`
- **UI Framework** - Chakra UI with custom theme
- **Web3** - Wagmi + RainbowKit for wallet connection
- **State** - TanStack Query for server state
- **Routing** - React Router v6
- **i18n** - i18next with browser language detection
- **Forms** - React Hook Form
- **Testing** - Vitest (unit)

## Important Notes

- TypeScript strict mode is disabled (`strict: false`)
- Node 22.x and pnpm 10.16.1+ required (see `engines` in package.json)
- Custom census size defaults to 5000 (override with `DEFAULT_CENSUS_SIZE`)
- Analytics via Plausible and Google Tag Manager (both optional)
- Stripe integration for payments (optional, controlled by `STRIPE_PUBLIC_KEY`)
