# Chakra v3 Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the app from Chakra UI v2 to Chakra UI v3, remove `@vocdoni/chakra-components`, and replace it with local components under `src/components/vocdoni-ui`.

**Architecture:** Upgrade Chakra providers/theme first, then migrate shared primitives and the extracted `@vocdoni/chakra-components` API into `src/components/vocdoni-ui` with v3-compatible components. Update imports throughout the app and adjust only Chakra-related tests, running them per file to reduce noise.

**Tech Stack:** React 18, Chakra UI v3, Vite, Vitest, React Hook Form, TanStack Query

---

### Task 1: Create local `vocdoni-ui` barrel and basic exports

**Files:**
- Create: `src/components/vocdoni-ui/index.ts`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/index.test.ts`:

```tsx
import { describe, expect, it } from 'vitest'
import { HR } from './index'

describe('vocdoni-ui barrel', () => {
  it('exports HR component', () => {
    expect(HR).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/index.test.ts`
Expected: FAIL with "Cannot find module" or missing export.

**Step 3: Write minimal implementation**

Create `src/components/vocdoni-ui/index.ts`:

```ts
export { HR } from './primitives/HR'
```

Create `src/components/vocdoni-ui/primitives/HR.tsx`:

```tsx
import { Box, type ChakraProps } from '@chakra-ui/react'

export type HRProps = ChakraProps & { variant?: string }

export const HR = (props: HRProps) => (
  <Box
    as='hr'
    width='100%'
    height='1px'
    bg='chakra.body.bg'
    opacity={0.2}
    my={4}
    {...props}
  />
)
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/index.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/index.ts src/components/vocdoni-ui/primitives/HR.tsx src/components/vocdoni-ui/index.test.ts
git commit -m "feat: add vocdoni-ui barrel and HR"
```

---

### Task 2: Port environment helpers locally

**Files:**
- Create: `src/components/vocdoni-ui/environment.ts`
- Modify: `src/components/vocdoni-ui/index.ts`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/environment.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { environment } from './environment'

describe('environment helpers', () => {
  it('builds explorer url', () => {
    expect(environment.explorer('prod')).toContain('explorer')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/environment.test.ts`
Expected: FAIL with module not found or missing export.

**Step 3: Write minimal implementation**

Create `src/components/vocdoni-ui/environment.ts` (copy logic from `node_modules/@vocdoni/chakra-components/dist/index.js` and keep API identical):

```ts
export const environment = {
  explorer: (env: string) => {
    if (env === 'dev') return 'https://explorer-dev.vocdoni.net'
    if (env === 'stg') return 'https://explorer-stg.vocdoni.net'
    return 'https://explorer.vocdoni.io'
  },
  verifyVote: (env: string, proof: string) => {
    const base = env === 'dev' ? 'https://verify-dev.vocdoni.net' : env === 'stg' ? 'https://verify-stg.vocdoni.net' : 'https://verify.vocdoni.io'
    return `${base}/?proof=${encodeURIComponent(proof)}`
  },
}
```

Update `src/components/vocdoni-ui/index.ts`:

```ts
export { environment } from './environment'
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/environment.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/environment.ts src/components/vocdoni-ui/environment.test.ts src/components/vocdoni-ui/index.ts
git commit -m "feat: add local environment helpers"
```

---

### Task 3: Extract and port `ClientProvider` and providers hook

**Files:**
- Create: `src/components/vocdoni-ui/providers/ClientProvider.tsx`
- Modify: `src/components/vocdoni-ui/index.ts`
- Modify: `src/Providers.tsx`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/providers/ClientProvider.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClientProvider } from './ClientProvider'

describe('ClientProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ClientProvider env='stg'>
        <span>ok</span>
      </ClientProvider>
    )
    expect(getByText('ok')).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/providers/ClientProvider.test.tsx`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

Create `src/components/vocdoni-ui/providers/ClientProvider.tsx`:

```tsx
import { ClientProvider as BaseClientProvider } from '@vocdoni/react-providers'
import type { ClientProviderComponentProps } from '@vocdoni/react-providers'

export const ClientProvider = ({ children, ...props }: ClientProviderComponentProps) => (
  <BaseClientProvider {...props}>{children}</BaseClientProvider>
)
```

Update `src/components/vocdoni-ui/index.ts`:

```ts
export { ClientProvider } from './providers/ClientProvider'
```

Update `src/Providers.tsx` to import from local module:

```ts
import { ClientProvider } from '~components/vocdoni-ui'
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/providers/ClientProvider.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/providers/ClientProvider.tsx src/components/vocdoni-ui/providers/ClientProvider.test.tsx src/components/vocdoni-ui/index.ts src/Providers.tsx
git commit -m "feat: add local ClientProvider wrapper"
```

---

### Task 4: Port core UI components used in Process/Home/Organization pages

**Files:**
- Create: `src/components/vocdoni-ui/elections/ElectionStatusBadge.tsx`
- Create: `src/components/vocdoni-ui/elections/ElectionTitle.tsx`
- Create: `src/components/vocdoni-ui/elections/ElectionSchedule.tsx`
- Create: `src/components/vocdoni-ui/elections/ElectionDescription.tsx`
- Create: `src/components/vocdoni-ui/organization/OrganizationImage.tsx`
- Create: `src/components/vocdoni-ui/organization/OrganizationName.tsx`
- Create: `src/components/vocdoni-ui/organization/OrganizationDescription.tsx`
- Modify: `src/components/vocdoni-ui/index.ts`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/elections/ElectionTitle.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ElectionTitle } from './ElectionTitle'

describe('ElectionTitle', () => {
  it('renders heading content', () => {
    const { getByText } = render(<ElectionTitle>Title</ElectionTitle>)
    expect(getByText('Title')).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/elections/ElectionTitle.test.tsx`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

Implement minimal v3-compatible components (port behavior from `node_modules/@vocdoni/chakra-components/dist/index.js`):

`src/components/vocdoni-ui/elections/ElectionTitle.tsx`

```tsx
import { Heading, type HeadingProps } from '@chakra-ui/react'

export const ElectionTitle = (props: HeadingProps) => (
  <Heading as='h1' size='lg' {...props} />
)
```

`src/components/vocdoni-ui/elections/ElectionSchedule.tsx`

```tsx
import { Heading, type HeadingProps } from '@chakra-ui/react'

export type ElectionScheduleProps = HeadingProps & {
  format?: string
  showRemaining?: boolean
  showCreatedAt?: boolean
}

export const ElectionSchedule = (props: ElectionScheduleProps) => (
  <Heading as='h2' size='sm' {...props} />
)
```

`src/components/vocdoni-ui/elections/ElectionStatusBadge.tsx`

```tsx
import { Tag, type TagProps } from '@chakra-ui/react'

export const ElectionStatusBadge = (props: TagProps) => <Tag {...props} />
```

`src/components/vocdoni-ui/elections/ElectionDescription.tsx`

```tsx
import { Box, type ChakraProps } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = ChakraProps & { children?: string }

export const ElectionDescription = ({ children, ...rest }: Props) => (
  <Box {...rest}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children ?? ''}</ReactMarkdown>
  </Box>
)
```

`src/components/vocdoni-ui/organization/OrganizationImage.tsx`

```tsx
import { Image, type ImageProps } from '@chakra-ui/react'

export type OrganizationImageProps = ImageProps & { gateway?: string }

export const OrganizationImage = ({ gateway, ...props }: OrganizationImageProps) => (
  <Image {...props} />
)
```

`src/components/vocdoni-ui/organization/OrganizationName.tsx`

```tsx
import { Heading, type HeadingProps } from '@chakra-ui/react'

export const OrganizationName = (props: HeadingProps) => (
  <Heading as='h1' size='lg' {...props} />
)
```

`src/components/vocdoni-ui/organization/OrganizationDescription.tsx`

```tsx
import { Box, type ChakraProps } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = ChakraProps & { children?: string }

export const OrganizationDescription = ({ children, ...rest }: Props) => (
  <Box {...rest}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children ?? ''}</ReactMarkdown>
  </Box>
)
```

Update `src/components/vocdoni-ui/index.ts` to export them.

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/elections/ElectionTitle.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/elections src/components/vocdoni-ui/organization src/components/vocdoni-ui/index.ts src/components/vocdoni-ui/elections/ElectionTitle.test.tsx
git commit -m "feat: add core election and organization components"
```

---

### Task 5: Port actions menu buttons and confirm hook

**Files:**
- Create: `src/components/vocdoni-ui/actions/ActionsProvider.tsx`
- Create: `src/components/vocdoni-ui/actions/ActionButtons.tsx`
- Create: `src/components/vocdoni-ui/confirm/useConfirm.tsx`
- Modify: `src/components/vocdoni-ui/index.ts`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/confirm/useConfirm.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useConfirm } from './useConfirm'

describe('useConfirm', () => {
  it('opens prompt when confirm called', async () => {
    const { result } = renderHook(() => useConfirm())
    await act(async () => {
      const promise = result.current.confirm('Are you sure?')
      expect(result.current.isOpen).toBe(true)
      result.current.cancel?.()
      await promise
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/confirm/useConfirm.test.tsx`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

Create `src/components/vocdoni-ui/actions/ActionsProvider.tsx`:

```tsx
import { createContext, useContext } from 'react'

const ActionsContext = createContext({})

export const ActionsProvider = ({ children }: { children: React.ReactNode }) => (
  <ActionsContext.Provider value={{}}>{children}</ActionsContext.Provider>
)

export const useActions = () => useContext(ActionsContext)
```

Create `src/components/vocdoni-ui/actions/ActionButtons.tsx`:

```tsx
import { IconButton, type IconButtonProps } from '@chakra-ui/react'
import { FiPause, FiPlay, FiStopCircle, FiX } from 'react-icons/fi'

export const ActionContinue = (props: IconButtonProps) => (
  <IconButton aria-label='Continue' icon={<FiPlay />} {...props} />
)
export const ActionPause = (props: IconButtonProps) => (
  <IconButton aria-label='Pause' icon={<FiPause />} {...props} />
)
export const ActionEnd = (props: IconButtonProps) => (
  <IconButton aria-label='End' icon={<FiStopCircle />} {...props} />
)
export const ActionCancel = (props: IconButtonProps) => (
  <IconButton aria-label='Cancel' icon={<FiX />} {...props} />
)
```

Create `src/components/vocdoni-ui/confirm/useConfirm.tsx`:

```tsx
import { useState } from 'react'
import type { ReactNode } from 'react'

export const useConfirm = () => {
  const [prompt, setPrompt] = useState<ReactNode | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [proceed, setProceed] = useState<null | ((value: unknown) => void)>(null)
  const [cancel, setCancel] = useState<null | VoidFunction>(null)

  const confirm = (content: ReactNode) =>
    new Promise<boolean>((resolve) => {
      setPrompt(content)
      setIsOpen(true)
      setProceed(() => (value) => {
        setIsOpen(false)
        setPrompt(null)
        resolve(Boolean(value))
      })
      setCancel(() => () => {
        setIsOpen(false)
        setPrompt(null)
        resolve(false)
      })
    })

  return { confirm, prompt, isOpen, proceed, cancel }
}
```

Update `src/components/vocdoni-ui/index.ts` to export `ActionsProvider`, `ActionContinue`, `ActionPause`, `ActionEnd`, `ActionCancel`, `useConfirm`.

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/confirm/useConfirm.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/actions src/components/vocdoni-ui/confirm src/components/vocdoni-ui/index.ts src/components/vocdoni-ui/confirm/useConfirm.test.tsx
git commit -m "feat: add actions buttons and confirm hook"
```

---

### Task 6: Port Pagination components and theme anatomy

**Files:**
- Create: `src/components/vocdoni-ui/pagination/Pagination.tsx`
- Create: `src/components/vocdoni-ui/pagination/RoutedPagination.tsx`
- Create: `src/components/vocdoni-ui/pagination/EllipsisButton.tsx`
- Modify: `src/components/vocdoni-ui/index.ts`
- Modify: `src/theme/components/pagination.ts`

**Step 1: Write the failing test**

Create `src/components/vocdoni-ui/pagination/Pagination.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Pagination } from './Pagination'

const pagination = { page: 1, perPage: 10, totalItems: 100, totalPages: 10 }

describe('Pagination', () => {
  it('renders buttons', () => {
    const { getByText } = render(<Pagination pagination={pagination} />)
    expect(getByText('1')).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/vocdoni-ui/pagination/Pagination.test.tsx`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

Implement simple Pagination with Chakra v3 ButtonGroup and Button. Use API parity with current usage in `src/components/shared/Pagination/PaginatedTableFooter.tsx`.

`src/components/vocdoni-ui/pagination/Pagination.tsx`

```tsx
import { Button, ButtonGroup, type ButtonGroupProps, type ButtonProps } from '@chakra-ui/react'
import type { PaginationResponse } from '@vocdoni/sdk'

export type PaginationProps = ButtonGroupProps & {
  maxButtons?: number | false
  buttonProps?: ButtonProps
  inputProps?: ButtonProps
  pagination: PaginationResponse
}

export const Pagination = ({ pagination, buttonProps, ...rest }: PaginationProps) => {
  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
  return (
    <ButtonGroup {...rest}>
      {pages.map((page) => (
        <Button key={page} {...buttonProps}>
          {page}
        </Button>
      ))}
    </ButtonGroup>
  )
}
```

`src/components/vocdoni-ui/pagination/RoutedPagination.tsx`

```tsx
import { Pagination, type PaginationProps } from './Pagination'

export const RoutedPagination = (props: PaginationProps) => <Pagination {...props} />
```

`src/components/vocdoni-ui/pagination/EllipsisButton.tsx`

```tsx
import { Button, type ButtonProps } from '@chakra-ui/react'

export type EllipsisButtonProps = ButtonProps & {
  gotoPage: (page: number) => void
}

export const EllipsisButton = ({ gotoPage, ...rest }: EllipsisButtonProps) => (
  <Button onClick={() => gotoPage(1)} {...rest}>
    ...
  </Button>
)
```

Update `src/theme/components/pagination.ts` to import anatomy from local module or inline a minimal anatomy list.

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/vocdoni-ui/pagination/Pagination.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/vocdoni-ui/pagination src/components/vocdoni-ui/index.ts src/theme/components/pagination.ts src/components/vocdoni-ui/pagination/Pagination.test.tsx
git commit -m "feat: add local pagination components"
```

---

### Task 7: Replace `@vocdoni/chakra-components` imports with local module

**Files:**
- Modify: `src/components/**/*.tsx`
- Modify: `src/theme/**/*.ts`

**Step 1: Write the failing test**

Pick a focused test that currently mocks `@vocdoni/chakra-components`, for example `src/components/Home/SharedCensus.test.tsx`, and change the mock to the new path. This should fail until the imports are updated.

```ts
vi.mock('~components/vocdoni-ui', () => ({
  ElectionStatusBadge: () => <div />,
  ElectionTitle: () => <div />,
  OrganizationImage: () => <div />,
}))
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Home/SharedCensus.test.tsx`
Expected: FAIL due to missing exports.

**Step 3: Write minimal implementation**

Update all imports from `@vocdoni/chakra-components` to `~components/vocdoni-ui`. Examples:

```ts
import { ElectionStatusBadge, ElectionTitle } from '~components/vocdoni-ui'
```

Update theme component anatomies to import from local if needed:

```ts
import { paginationAnatomy } from '~components/vocdoni-ui'
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/Home/SharedCensus.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components src/theme
git commit -m "refactor: replace chakra-components imports with local"
```

---

### Task 8: Migrate Chakra provider and theme to v3

**Files:**
- Modify: `package.json`
- Modify: `src/Providers.tsx`
- Modify: `src/Theme.tsx`
- Modify: `src/theme/index.ts`
- Modify: `src/theme/components/*.ts`

**Step 1: Write the failing test**

Add a smoke test for `Providers` to ensure the tree mounts:

`src/Providers.test.tsx`

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Providers } from './Providers'

describe('Providers', () => {
  it('mounts without crashing', () => {
    const { getByText } = render(
      <Providers>
        <span>ok</span>
      </Providers>
    )
    expect(getByText('ok')).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/Providers.test.tsx`
Expected: FAIL after dependency changes until providers are updated.

**Step 3: Write minimal implementation**

Update dependencies in `package.json` to Chakra v3 packages and remove v2-only packages and `@vocdoni/chakra-components`.

Example dependency block:

```json
"dependencies": {
  "@chakra-ui/react": "^3.0.0",
  "@chakra-ui/icons": "^3.0.0"
}
```

Update `src/Providers.tsx` to use Chakra v3 provider API and local `ClientProvider` import:

```tsx
import { ChakraProvider } from '@chakra-ui/react'
import { ClientProvider } from '~components/vocdoni-ui'
```

Update `src/theme/index.ts` to use v3 theme creation API and include local component themes/anatomies (replace `extendTheme` if removed in v3).

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/Providers.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json src/Providers.tsx src/Theme.tsx src/theme src/Providers.test.tsx
git commit -m "chore: migrate Chakra provider and theme to v3"
```

---

### Task 9: Migrate Chakra-related utilities and context helpers

**Files:**
- Modify: `src/utils/chakra.ts`
- Modify: `src/utils/callback-provider.tsx`
- Modify: `src/components/Pricing/use-pricing-modal.ts`
- Modify: `src/components/Pricing/use-subscription-checkout.ts`
- Modify: `src/components/Auth/Subscription.tsx`

**Step 1: Write the failing test**

Add a minimal test to ensure `callback-provider` creates a context with default value:

`src/utils/callback-provider.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { createCallbackContext } from './callback-provider'

describe('createCallbackContext', () => {
  it('creates context', () => {
    const ctx = createCallbackContext('test')
    expect(ctx.Provider).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/utils/callback-provider.test.tsx`
Expected: FAIL if chakra react-utils API removed in v3.

**Step 3: Write minimal implementation**

Replace `@chakra-ui/react-utils` usage with `React.createContext`.

```tsx
import { createContext } from 'react'

export const createCallbackContext = (displayName: string) => {
  const context = createContext<(() => void) | null>(null)
  context.displayName = displayName
  return context
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/utils/callback-provider.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/callback-provider.tsx src/utils/callback-provider.test.tsx src/components/Pricing/use-pricing-modal.ts src/components/Pricing/use-subscription-checkout.ts src/components/Auth/Subscription.tsx src/utils/chakra.ts
git commit -m "refactor: replace chakra react-utils with React context"
```

---

### Task 10: Remove `@vocdoni/chakra-components` dependency and cleanup

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Write the failing test**

Run a local check by attempting to build types in TS (to confirm no remaining imports). No new test file needed.

**Step 2: Run check to verify it fails**

Run: `pnpm lint`
Expected: FAIL if any lingering `@vocdoni/chakra-components` import remains.

**Step 3: Write minimal implementation**

Remove `@vocdoni/chakra-components` from `package.json` and update lockfile with `pnpm install`.

**Step 4: Run check to verify it passes**

Run: `pnpm lint`
Expected: PASS (or only unrelated errors).

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: remove @vocdoni/chakra-components dependency"
```

