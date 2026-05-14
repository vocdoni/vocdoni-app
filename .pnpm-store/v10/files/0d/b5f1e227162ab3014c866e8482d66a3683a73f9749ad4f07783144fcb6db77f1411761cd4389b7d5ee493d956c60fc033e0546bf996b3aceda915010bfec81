# vite-plugin-wrapper

Wrap existing modules in Vite.

`vite-plugin-wrapper` lets you transparently replace matched modules with a custom wrapper implementation,
while still resolving the original module underneath.

It is designed for building higher-level Vite plugins and virtual module systems.

---

## Installation

```bash
npm install vite-plugin-wrapper
```

---

## Usage

```ts
import { defineConfig } from "vite";
import { wrapper } from "vite-plugin-wrapper";

export default defineConfig({
  plugins: [
    wrapper({
      resolveId: {
        filter: {
          id: /^virtual:bar$/,
        },
      },

      // Here, `id` is the original module that we are wrapping
      load(id) {
        return `
import mod from ${JSON.stringify(id)};
export default { ...mod, foo: 'foo' };
`;
      },
    }),
  ],
});
```

Now `virtual:bar` will be wrapped with your custom module logic.

---

## What It Does

For every matched module:

- Resolves the module normally
- Replaces its implementation with your `load()` result
- Keeps resolution behavior intact

From the consumer’s perspective, the module simply behaves as your wrapped version.

---

## API

### Options

#### `resolveId.filter`

Defines which modules should be wrapped.

You can use:

**RegExp**

```ts
{ id: /\.tsx$/ }
````

**Include / Exclude**

```ts
{
  id: {
    include: /\.tsx$/,
    exclude: /node_modules/
  }
}
```

**Function**

```ts
(id, importer) => id.startsWith("virtual:")
```

---

#### `load(id)`

Defines the wrapped module implementation.

* Receives the resolved module id
* Must return the new module source code
* Can import the original module using the provided `id`

Example:

```ts
load(id) {
  return `
import original from ${JSON.stringify(id)};
export default { ...original, extra: true };
`;
}
```



---

## License

MIT
