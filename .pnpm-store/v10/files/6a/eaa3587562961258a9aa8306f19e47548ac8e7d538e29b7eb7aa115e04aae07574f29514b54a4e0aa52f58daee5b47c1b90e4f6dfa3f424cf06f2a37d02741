# look-it-up

> Find a file or directory by walking up parent directories recursively. Zero dependency.

[![npm](https://img.shields.io/npm/v/look-it-up.svg)](https://www.npmjs.com/package/look-it-up)
[![github workflow](https://img.shields.io/github/workflow/status/exuanbo/look-it-up/Node.js%20CI/main.svg)](https://github.com/exuanbo/look-it-up/actions/workflows/nodejs.yml)
[![Codecov branch](https://img.shields.io/codecov/c/gh/exuanbo/look-it-up/main.svg?token=speJkwSMKd)](https://codecov.io/gh/exuanbo/look-it-up)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

## Install

```sh
npm install look-it-up
```

### Usage

```js
import { existsSync } from 'fs'
import { join } from 'path'
import { lookItUp, lookItUpSync, exists } from 'look-it-up'

const contains = async (file, dir) => (await exists(join(dir, file))) ? dir : null
const containsSync = (file, dir) => existsSync(join(dir, file) ? dir : null

;(async () => {
  await lookItUp('.zshrc') //=> '~/.zshrc'

  await lookItUp(dir => containsSync('.zshrc', dir)) //=> '~'

  await lookItUp(async dir => await contains('.zshrc', dir)) //=> '~'
})()

lookItUpSync('.zshrc') //=> '~/.zshrc'

lookItUpSync(dir => containsSync('.zshrc', dir)) //=> '~'
```

## API

```ts
declare type MatcherResult = string | null | symbol
declare type Matcher = string | ((dir: string) => MatcherResult | Promise<MatcherResult>)
declare type MatcherSync = string | ((dir: string) => MatcherResult)

declare const lookItUp: (matcher: Matcher, dir?: string) => Promise<string | null>

declare const lookItUpSync: (matcher: MatcherSync, dir?: string) => string | null | never

declare const exists: (path: string) => Promise<boolean>
declare const stop: unique symbol

export { exists, lookItUp, lookItUpSync, stop }
```

## License

[MIT License](https://github.com/exuanbo/look-it-up/blob/main/LICENSE) © 2021 [Exuanbo](https://github.com/exuanbo)
