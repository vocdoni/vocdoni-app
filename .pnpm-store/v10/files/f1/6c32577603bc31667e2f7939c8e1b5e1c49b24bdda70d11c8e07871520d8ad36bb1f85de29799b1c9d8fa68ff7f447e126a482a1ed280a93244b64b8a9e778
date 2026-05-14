# convert-route

Convert between `path-to-regexp`, `rou3`, `next.js`, `RegExp`, etc. route patterns.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Supported Features](#supported-features)
  - [rou3](#rou3)
  - [Next.js](#nextjs)
  - [path-to-regexp v6](#path-to-regexp-v6)
  - [path-to-regexp v8](#path-to-regexp-v8)
  - [RegExp](#regexp)
  - [URLPattern](#urlpattern)


## Installation

```sh
npm install convert-route
# or
yarn add convert-route
# or
pnpm add convert-route
```

## Usage

```ts
import { fromPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';
import { toRou3 } from 'convert-route/rou3';

// Convert from path-to-regexp v8 format to rou3 format
const rou3Pattern = toRou3(fromPathToRegexpV8('/users/*id'));
console.log(rou3Pattern); // ['/users/**:id']
```

## Supported Features

| Feature              | Next.js        | rou3           | path-to-regexp v6 | path-to-regexp v8 | URLPattern | RegExp |
|----------------------|----------------|----------------|-------------------|-------------------|------------|--------|
| Named Segments       | `[param]`      | `:param`       | `:param`          | `:param`          | `:param`   | Yes    |
| Optional Segments    | No             | `*`, `*:param` | `:param?`         | `{/:param}`       | `:param?`  | Yes    |
| Catch-all (Wildcard) | `[...param]`   | `**:param`     | `:param+`         | `*param`          | `:param+`  | Yes    |
| Optional Catch-all   | `[[...param]]` | `**`           | `:param*`         | `{/*param}`       | `:param*`  | Yes    |
| Suffix Matching      | No             | WIP            | WIP               | WIP               | WIP        | WIP    |
| Prefix Matching      | No             | WIP            | WIP               | WIP               | WIP        | WIP    |

### rou3

```ts
import { fromRou3, toRou3 } from 'convert-route/rou3';

const intermediateRepresentation = fromRou3('/users/:id');
const rou3Pattern = toRou3(intermediateRepresentation);
// Note: toRou3 returns an array of patterns since some patterns need to be expressed as a combination of multiple patterns
console.log(rou3Pattern); // ['/users/:id']
```

### Next.js

```ts
// Note: There is no `toNextFs` function. If you have a need for such helper, please open an issue
import { fromNextFs } from 'convert-route/next-fs';

const intermediateRepresentation = fromNextFs('/users/[id]');
```

### path-to-regexp v6

```ts
import { fromPathToRegexpV6, toPathToRegexpV6 } from 'convert-route/path-to-regexp-v6';

const intermediateRepresentation = fromPathToRegexpV6('/users/:id');
const pathToRegexV6Pattern = toPathToRegexpV6(intermediateRepresentation);
console.log(pathToRegexV6Pattern); // '/users/:id'
```

### path-to-regexp v8

```ts
import { fromPathToRegexpV8, toPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';

const intermediateRepresentation = fromPathToRegexpV8('/users/:id');
const pathToRegexV8Pattern = toPathToRegexpV8(intermediateRepresentation);
console.log(pathToRegexV8Pattern); // '/users/:id'
```

### RegExp

```ts
import { toRegexp } from 'convert-route/regexp';
import { fromPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';

const intermediateRepresentation = fromPathToRegexpV8('/users/:id');
const regexp = toRegexp(intermediateRepresentation);
console.log(regexp); // /^\/users\/(?<id>[^/]+)\/?$/
```

### URLPattern

```ts
import { fromURLPattern, toURLPattern, toURLPatternInput } from 'convert-route/urlpattern';
import { fromPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';

const intermediateRepresentation = fromPathToRegexpV8('/users/:id');

// Convert to URLPattern instance
const pattern = toURLPattern(intermediateRepresentation);
console.log(pattern.pathname); // '/users/:id{/}?'

// Convert to URLPattern input object
const input = toURLPatternInput(intermediateRepresentation);
console.log(input); // { pathname: '/users/:id{/}?' }

// Convert from URLPattern instance (or input object)
const ir = fromURLPattern(pattern);
```
