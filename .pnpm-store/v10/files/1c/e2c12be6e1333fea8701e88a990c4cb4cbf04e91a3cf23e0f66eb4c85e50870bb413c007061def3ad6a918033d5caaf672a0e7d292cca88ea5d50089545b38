<p align="center" width="100%">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://developer.vocdoni.io/img/vocdoni_logotype_full_blank.svg" />
      <source media="(prefers-color-scheme: light)" srcset="https://developer.vocdoni.io/img/vocdoni_logotype_full_white.svg" />
      <img alt="Vocdoni" src="https://developer.vocdoni.io/img/vocdoni_logotype_full_white.svg" />
  </picture>
</p>

# @vocdoni/react-components

Headless, framework-agnostic React components for Vocdoni UIs.

This package keeps business logic and component APIs while delegating visual rendering to overridable slots through `ComponentsProvider`.

### Table of Contents
- [Getting Started](#getting-started)
- [How To Use Components](#how-to-use-components)
  - [Pagination](#pagination)
- [How Customization Works](#how-customization-works)
  - [TypeScript](#typescript)
- [i18n (i18next)](#i18n-i18next)
- [Testing](#testing)
- [Reference](#reference)
- [License](#license)

## Getting Started

Install package and peer dependencies:

~~~bash
pnpm add @vocdoni/react-components @vocdoni/sdk react react-i18next i18next date-fns
~~~

Pagination APIs are exported from explicit subpaths:

- `@vocdoni/react-components/pagination`

If you use routed helpers (for example `RoutedPagination`), install `react-router-dom` in your app where routing is configured.

Set providers at app root:

~~~tsx
import { ClientProvider, ComponentsProvider } from '@vocdoni/react-components'

export const App = () => (
  <ComponentsProvider>
    <ClientProvider env='prod'>{/* app */}</ClientProvider>
  </ComponentsProvider>
)
~~~

## How To Use Components

Users consume exported components normally by importing and rendering them:

~~~tsx
import { Election, OrganizationName, Balance, Pagination } from '@vocdoni/react-components'

export const Screen = () => (
  <>
    <Balance />
    <OrganizationName />
    <Election electionId='0x...' />
    <Pagination pagination={{ currentPage: 1, previousPage: 0, nextPage: 2, lastPage: 10, totalItems: 200 }} />
  </>
)
~~~

`ComponentsProvider` must wrap `ClientProvider` so confirmation flows can resolve slot components.
If you do not pass custom slots, built-in defaults are used.

### Pagination

Pagination is intentionally split into explicit subpaths:

- `@vocdoni/react-components`: router-free pagination
- `@vocdoni/react-components/pagination`: full pagination API (router-free + route-synced helpers)

#### Router-Free Pagination

Use this when pagination state lives in React state (no URL sync):

~~~tsx
import { PaginationProvider, Pagination } from '@vocdoni/react-components'

export const Members = ({ pagination }) => (
  <PaginationProvider initialPage={1} pagination={pagination}>
    <Pagination pagination={pagination} />
  </PaginationProvider>
)
~~~

#### Routed Pagination

Use this when page changes should update the URL.

Required dependency in your app:

~~~bash
pnpm add react-router-dom
~~~

Example:

~~~tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RoutedPaginationProvider, RoutedPagination } from '@vocdoni/react-components/pagination'

const ProcessList = ({ pagination }) => (
  <RoutedPaginationProvider path='/processes/:page' initialPage={1} pagination={pagination}>
    <RoutedPagination pagination={pagination} />
  </RoutedPaginationProvider>
)

export const App = ({ pagination }) => (
  <BrowserRouter>
    <Routes>
      <Route path='/processes/:page' element={<ProcessList pagination={pagination} />} />
    </Routes>
  </BrowserRouter>
)
~~~

Notes:

- The route must include a `:page` param if you use `RoutedPaginationProvider`.
- Use `initialPage` consistently with your backend pagination convention (`0`-based or `1`-based).
- If you only use `@vocdoni/react-components/pagination`, you do not need `react-router-dom`.

## Default HTML Rendering

`@vocdoni/react-components` does not include a markdown parser dependency.

By default, description-like fields are rendered as trusted HTML (`dangerouslySetInnerHTML`).
If your app needs markdown parsing or sanitization, override the corresponding slots in `ComponentsProvider`.

## How Customization Works

The canonical customization API is a **flat object**:

~~~tsx
import type { ComponentsDefinition } from '@vocdoni/react-components'

const components: Partial<ComponentsDefinition> = {
  ElectionTitle: ({ title, ...props }) => <h1 {...props}>{title}</h1>,
  PaginationButton: ({ children, ...props }) => <button className='my-btn' {...props}>{children}</button>,
}
~~~

Then provide it:

~~~tsx
<ComponentsProvider components={components}>{/* app */}</ComponentsProvider>
~~~

### Confirm Customization

Confirmation modals are fully slot-driven:

- `ConfirmShell`: modal wrapper/shell (open state and close action)
- `QuestionsConfirmation`: vote confirmation content

Example:

~~~tsx
import { ComponentsProvider, composeComponents, defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'

const components: ComponentsPartialDefinition = composeComponents({
  ConfirmShell: defineComponent<'ConfirmShell'>(({ isOpen, onClose, content }) =>
    isOpen ? (
      <div role='dialog'>
        <button onClick={onClose}>Close</button>
        {content}
      </div>
    ) : null
  ),
  QuestionsConfirmation: defineComponent<'QuestionsConfirmation'>(({ answersView, onConfirm, onCancel }) => (
    <div>
      {answersView.map((item) => (
        <div key={item.question}>
          <strong>{item.question}</strong>: {item.answers.join(', ')}
        </div>
      ))}
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  )),
})

export const App = () => (
  <ComponentsProvider components={components}>
    <ClientProvider env='prod'>{/* app */}</ClientProvider>
  </ComponentsProvider>
)
~~~

The package also exports optional domain helper types and a merge helper for DX:

- `ElectionComponentsDefinition`
- `OrganizationComponentsDefinition`
- `PaginationComponentsDefinition`
- `AccountComponentsDefinition`
- `composeComponents(...partials)`

~~~tsx
import {
  composeComponents,
  type ElectionComponentsDefinition,
  type PaginationComponentsDefinition,
} from '@vocdoni/react-components'

const electionComponents: Partial<ElectionComponentsDefinition> = {
  ElectionTitle: ({ title }) => <h1>{title}</h1>,
}

const paginationComponents: Partial<PaginationComponentsDefinition> = {
  PaginationSummary: ({ text }) => <p>{text}</p>,
}

const components = composeComponents(electionComponents, paginationComponents)
~~~

No nested `components.election.*` API is used.

### TypeScript

For strongly typed slot overrides with UI-library props, use `defineComponent` with a slot key and your extra props:

~~~tsx
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'
import type { HeadingProps } from '@chakra-ui/react'

const components: ComponentsPartialDefinition = {
  ElectionTitle: defineComponent<'ElectionTitle', HeadingProps>(({ title, ...props }) => (
    <h1 {...props}>{title}</h1>
  )),
}
~~~

This keeps both slot props (for example `title`, `description`, `label`) and your UI props strongly typed.

## i18n (i18next)

This package exports i18n resources via the `react-components` namespace:

- `reactComponentsNamespace`
- `reactComponentsDefaultLanguage`
- `reactComponentsResources`

Example setup:

~~~ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  reactComponentsNamespace,
  reactComponentsResources,
} from '@vocdoni/react-components'

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: reactComponentsResources,
  ns: [reactComponentsNamespace],
  defaultNS: reactComponentsNamespace,
})
~~~

Base English template:

`src/i18n/locales/en/react-components.json`

## Testing

From package directory:

~~~bash
pnpm lint
pnpm test
pnpm build
~~~

## Reference

https://developer.vocdoni.io/ui-components

## License

This repository is licensed under the [GNU Affero General Public License v3.0.](./LICENSE)
