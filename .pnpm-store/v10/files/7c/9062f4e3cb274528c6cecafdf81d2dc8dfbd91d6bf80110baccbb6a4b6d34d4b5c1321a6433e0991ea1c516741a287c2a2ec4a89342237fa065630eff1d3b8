Usage:

```js
import { import_ } from '@brillout/import'

// Same as `import()`
const module = await import_(moduleName)
```

Same as `import()` but:
 - Avoids bundlers from bundling `moduleName`, such as Webpack or Cloudflare Workers's wrangler bundler.
 - Avoids TypeScript from transpiling `import()` to `require()`.
 - Fixes Node.js windows bug `ERR_UNSUPPORTED_ESM_URL_SCHEME`.

Zero dependency. (And doesn't dependend on any Node.js API.)
