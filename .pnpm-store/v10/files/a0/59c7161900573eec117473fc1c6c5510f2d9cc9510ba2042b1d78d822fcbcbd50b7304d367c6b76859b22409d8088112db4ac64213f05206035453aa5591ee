- [What is this?](#what-is-this)
- [Manual import](#manual-import)
- [How it works](#how-it-works)

&nbsp;


## What is this?

`@brillout/vite-plugin-server-entry` does two things:
 - Generates the server production entry `dist/server/entry.js`.
 - Automatically imports it.

[Vike](https://vike.dev) and [Telefunc](https://telefunc.com) automatically use and configure this plugin on your behalf: there is nothing for you to do and you can usually ignore this plugin.

<p align="center"><sup><a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a></sup></p><br/>


## Manual import

Normally the file `dist/server/entry.js` is automatically imported.

But this automatic importing doesn't work with Yarn PnP, some Docker configurations, and certain production setups. You'll keep getting the following error:

```
[@brillout/vite-plugin-server-entry][Wrong Usage] The server production entry is missing.
(Re-)build your app and try again. If you still get this error, then you need to manually
import the server production entry.
```

The workaround is to manually import `dist/server/entry.js` in your server code:

```js
// server/index.js

// Add this at the beginning of your server entry, or elsewhere at server start
// before receiving HTTP requests.
if (process.env.NODE_ENV === 'production') {
  await import('../dist/server/entry.js') // Or wherever the build directory is
}

// ...
// Your server code (Express.js, Hono, Cloudflare Worker, Vercel, ...)
// ...
```

> [!NOTE]
> The import path may be different:
> - The file extension may differ from `.js` (e.g. `dist/server/entry.mjs`).
> - The build directory may be named and located differently than `dist/` (e.g. `build/server/entry.js` if you or your framework set [`vite.config.js` > `build.outDir`](https://vitejs.dev/config/build-options.html#build-outdir) to `build`).
>
> ```diff
> - import '../dist/server/entry.js
> + import '../build/server/entry.mjs
> ```

> [!NOTE]
> If top-level `await` isn't available, then check out the alternative approaches to conditionally import `dist/server/entry.js` only in production at [Conditional manual import](https://github.com/brillout/vite-plugin-server-entry/issues/6).

> [!NOTE]
> `@brillout/vite-plugin-server-entry` generates a file `node_modules/@brillout/vite-plugin-server-entry/dist/runtime/autoImporter.js`, which automatically imports `dist/server/entry.js`.
>
> The `node_modules/.../autoImporter.js` file is generated at build-time. Consequently, it breaks if:
>  - Your `node_modules/` directory is immutable (Yarn PnP): `node_modules/.../autoImporter.js` cannot be written.
>  - You remove or (re-)install `node_modules/` *after* building your app for production: `node_modules/.../autoImporter.js` is lost.
>    - E.g. you build locally, copy `dist/` to the deployment server, and then run `$ npm install` there.
>    - Some Docker configurations move `dist/`, then re-install `node_modules/`.
>
> In those situations, you must manually import the server entry.
>
> If you aren't using Yarn PnP and you don't modify `node_modules/` after building, then you don't need to manually import and you shouldn't keep getting `The server production entry is missing`. If you do, then [file a bug report](https://github.com/brillout/vite-plugin-server-entry/issues/new).
>
> To learn more, see [How it works](#how-it-works).

<p align="center"><sup><a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a></sup></p><br/>


## How it works

> [!NOTE]
> As a user, you usually don't need to read this. If you have a problem, reading the section [Manual import](#Manual-import) is usually enough.

`@brillout/vite-plugin-server-entry` does two things:
 - Generates a *server production entry*, the file `dist/server/entry.js`.
 - Generates a *auto importer*, the file `node_modules/@brillout/vite-plugin-server-entry/dist/runtime/autoImporter.js`.

The *server production entry* (`dist/server/entry.js`) enables tools like [Vike](https://vike.dev) and [Telefunc](https://telefunc.com) to combine their production entries into a single file.

The *auto importer* file (`node_modules/@brillout/vite-plugin-server-entry/dist/runtime/autoImporter.js`) automatically imports `dist/server/entry.js`, saving you the need to do it manually:

```js
// server/index.js

// Without the auto importer, you need to manually import dist/server/entry.js
if (process.env.NODE_ENV === 'production') {
  await import('../dist/server/entry.js')
}
```

> [!NOTE]
> The `autoImporter.js` file is generated inside `node_modules/` — not in the build directory (`dist/`) — because the whole point of the auto importer is to know where the build directory is. The runtime code of tools (e.g. Telefunc) lives in `node_modules/` and cannot know where the build directory is. The auto importer bridges that gap in the simplest and most minimal way possible.

See [How the auto importer works](https://github.com/brillout/vite-plugin-server-entry/issues/4) for more information.

<p align="center"><sup><a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a></sup></p><br/>
