// jest-dom ships its own type augmentations, but none of them fit vitest 5.
//
// `@testing-library/jest-dom` (the entrypoint vitest.setup.ts imports) augments the
// global `jest.Matchers` interface, and vitest 5 no longer reads it. Its `/vitest`
// entrypoint is no help either: it declares `interface Assertion<T = any>`, while
// vitest 5's is `Assertion<R, T>` — TypeScript only merges interfaces whose type
// parameter lists are identical, so that augmentation is silently dropped and every
// `expect(el).toBeInTheDocument()` fails to typecheck.
//
// So declare it ourselves against `Matchers<R, T>`, which is vitest 5's documented
// extension point for custom matchers. The signature below must stay identical to
// vitest's own (constraints and defaults included) for the merge to apply. Drop this
// file once jest-dom ships vitest 5 support.
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> extends TestingLibraryMatchers<
    unknown,
    R
  > {}
}
