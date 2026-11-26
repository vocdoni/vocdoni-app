<p align="center" width="100%">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/assets/logo-classic-white.svg" />
      <source media="(prefers-color-scheme: light)" srcset="public/assets/logo-classic.svg" />
      <img alt="Vocdoni logo" src="public/assets/logo-classic.svg" />
  </picture>
</p>

<p align="center" width="100%">
    <a href="https://github.com/vocdoni/vocdoni-app/commits/develop/"><img src="https://img.shields.io/github/commit-activity/m/vocdoni/vocdoni-app" /></a>
    <a href="https://github.com/vocdoni/vocdoni-app/issues"><img src="https://img.shields.io/github/issues/vocdoni/vocdoni-app" /></a>
    <a href="https://chat.vocdoni.io"><img src="https://img.shields.io/badge/discord-join%20chat-blue.svg" /></a>
    <a href="https://twitter.com/vocdoni"><img src="https://img.shields.io/twitter/follow/vocdoni.svg?style=social&label=Follow" /></a>
</p>

  <div align="center">
    Vocdoni is the first universally verifiable, censorship-resistant, anonymous, and self-sovereign governance protocol. <br />
    Our main aim is a trustless voting system where anyone can speak their voice and where everything is auditable. <br />
    We are engineering building blocks for a permissionless, private and censorship resistant democracy.
    <br />
    <a href="https://vocdoni.io/developers"><strong>Explore the developer portal »</strong></a>
    <br />
    <h3>More About Us</h3>
    <a href="https://vocdoni.io">Vocdoni Website</a>
    |
    <a href="https://vocdoni.app">Web Application</a>
    |
    <a href="https://explorer.vote/">Blockchain Explorer</a>
    |
    <a href="https://law.mit.edu/pub/remotevotingintheageofcryptography/release/1">MIT Law Publication</a>
    |
    <a href="https://vocdoni.io/contact">Contact Us</a>
    <br />
    <h3>Key Repositories</h3>
    <a href="https://github.com/vocdoni/vocdoni-app">Vocdoni App</a>
    |
    <a href="https://github.com/vocdoni/vocdoni-integrator-sdk">Vocdoni Integrator SDK</a>
  </div>

# vocdoni-app

Vocdoni App is a React application that uses the [Vocdoni Integrator SDK](https://github.com/vocdoni/vocdoni-integrator-sdk) (including its react-components and react-providers packages) to provide a user interface for the Vocdoni voting protocol.
It is built with [Vite](https://vitejs.dev/guide/) and [Vike](https://vike.dev/), and is deployed at https://app.vocdoni.io/.

### Table of Contents
- [Getting Started](#getting-started)
- [Rendering Architecture](#rendering-architecture)
- [Preview](#preview)
- [Contributing](#contributing)
- [License](#license)
- [SharedCensus configuration](#sharedcensus-configuration)


## Getting Started

## Rendering Architecture

The app now uses a mixed rendering model:

- Vike handles SSR for the public pages:
  - `/organization/:address`
  - `/processes/:id`
- The rest of the application remains client-rendered and is served through the SPA catch-all page:
  - `/`
  - auth and login routes
  - dashboard and backoffice routes
  - all other existing SPA routes

This keeps the migration incremental:

- public organization and process pages get server-rendered HTML and SEO metadata
- the existing React Router application remains the source of truth for the rest of the app
- Vike sits on top of the current Vite app instead of replacing the SPA router entirely

Relevant entry points:

- `src/pages/organization/@address/` for the SSR organization page
- `src/pages/processes/@id/` for the SSR process page
- `src/pages/home-process/` for the SSR single-process homepage (only when `HOME_PROCESS_ID` is set)
- `src/pages/@catchAll/` for the SPA catch-all page
- `src/router/` for the client-side React Router application

### Environment variables

You can create a `.env.local` file to set your custom environment variables
there, here's a list of variables you can use:

- `VOCDONI_ENVIRONMENT`: the vocdoni environment to be used, either
  `dev`, `stg` or `prod` (defaults to `dev`). `stg` selects the staging explorer and vochain gateway.
- `BASE_URL` is used to specify the public base page during build.
- `BUILD_PATH` Specifies the destination of built files.
- `COMMIT_SHA` Commit stamped in the `build-commit` meta tag of every page, read by the server at runtime (shortened to 7 characters). On DigitalOcean App Platform set it as a run-time variable to `${_self.COMMIT_HASH}`. Defaults to `git rev-parse --short HEAD`, or `unknown` without git.
- `CUSTOM_ORGANIZATION_DOMAINS` A JSON.stringified object of custom domains mapped to organization ids, to
  replace the homepage with their profile page.
- `HOME_PROCESS_ID` a single process id that turns the app root into that process' voting page — the same
  view served at `/<lang>/processes/<id>`, server-rendered by Vike. Both `/` and every localized root
  (`/en`, `/es`, …) render it, and its `<title>`, description, canonical URL, `hreflang` alternates and
  structured data all describe that process, with the roots as its canonical URLs. Unset, the root keeps
  behaving exactly as before. It is read at runtime, so a single build/image can be pointed at a process
  with `docker run -e HOME_PROCESS_ID=...`.
- `PRIMARY_COLOR` the accent color of the app as a `#rgb` or `#rrggbb` hex value (e.g. `#1a73e8`). A full
  palette (tints, shades, text and focus-ring colors) is generated from it and applied to buttons, form
  controls, tabs and highlights in both color modes. Filled surfaces (buttons, checked controls) always use
  the exact color, with a white label when it reads at 4.5:1 and a near-black one otherwise; a color under
  3:1 against the page gets a thin grey edge so its shape still shows. Links, accent text, focus rings and
  accent lines take a darker (or, in dark mode, lighter) shade of the same hue when the color itself would
  not read on the page. Unset, the app keeps Fil blue (`#1d62e9`). On the public pages of a vote with
  the branding add-on, the organisation's colour replaces it. It is read at runtime, so a single
  build/image can be recolored with `docker run -e PRIMARY_COLOR=...`.
- `SHOW_ORG_LOGO` set it to `true` to brand the header of process pages with the logo of the organization
  that created the process, instead of the Vocdoni logo. A vote with the branding add-on shows its
  organisation's logo on these pages whatever this flag says; the flag shows the logo on every vote but never
  applies the organisation's colour. It applies to the public voting page
  (`/<lang>/processes/<id>`), its summary (`/<lang>/processes/<id>/summary`) and the `HOME_PROCESS_ID`
  root, which render that logo server-side — there is no client-side swap. Pages with no process behind
  them (the dashboard, auth, pricing…) keep the Vocdoni logo, and so does an organization that has no logo
  set or whose logo URL fails to load. Only the header is affected: the footer logo is always Vocdoni. It is
  read at runtime, so a single build/image can be branded with `docker run -e SHOW_ORG_LOGO=true`.
- `DISABLE_ANONYMOUS_VOTING` set it to `true` to hide the anonymous voting option from the process
  creation wizard. Unset or any other value leaves the option available. Read at runtime.
- `QUESTION_BY_QUESTION` set it to `true` to offer the "Open the questions yourself" switch in the process
  wizard, which starts a vote with its questions paused. It only hides the switch: votes that started paused
  are managed either way.
- `CERT_GATEWAY_URL` the base https origin of the certificate gateway, port included (for example
  `https://cert.vocdoni.io:15140`). When unset, the "digital certificate" voter sign-in option is hidden.
  Each sign-in attempt goes to a fresh random subdomain of it, on the same port (for example
  `https://<label>.cert.vocdoni.io:15140`), so the browser asks for the certificate again on every
  attempt. The gateway's wildcard DNS record (`*.cert.vocdoni.io`) and wildcard certificate must exist.
  For local development use `https://cert.localtest.me:8443`: `*.cert.localtest.me` resolves to
  127.0.0.1.

You can also start the app by prefixing these vars instead of defining your
custom `.env` file:

```bash
VOCDONI_ENVIRONMENT=dev pnpm start
# or an example using many of them...
BUILD_PATH=build/dev BASE_URL=/vocdoni-app/dev VOCDONI_ENVIRONMENT=dev pnpm build
```

### Custom domain names

The custom domain names environment variable allows to map custom domains to organization ids, so that the homepage
rendered will be the mapped organization profile.

~~~bash
CUSTOM_ORGANIZATION_DOMAINS='{"deadcorp.com":"0x000000000000000000000000000000000000dead"}' pnpm build
~~~

With the example above, accessing the app via the `deadcorp.com` domain would render the profile of the organization
with id `0x000000000000000000000000000000000000dead` as the homepage of the app.

## SharedCensus configuration

The SharedCensus page uses the following env vars to drive its UI:

- `PROCESS_IDS`: comma-separated election IDs to display.
- `SHARED_CENSUS_ALWAYS_VISIBLE_TEXT`: JSON object mapping language codes to markdown (e.g. `{"en":"...", "es":"..."}`) rendered via the read-only Editor. Must include the default language (first entry from `LANGUAGES`, default `en`), otherwise the build fails. Always shown at the top of the SharedCensus page.
- `SHARED_CENSUS_DISCONNECTED_TEXT`: JSON object mapping language codes to markdown, shown only when the user is not connected/admin. Must include the default language if set, or the build fails.
- `SHARED_CENSUS_CONNECTED_TEXT`: JSON object mapping language codes to markdown, shown only when the user is connected or an admin. Must include the default language if set, or the build fails.
- `STREAM_URL`: single `http(s)` URL for an embeddable stream (e.g. YouTube). Validated at build time. When the session starts (connected or admin), it renders in a 16:9 player floated right so text flows around it. If only the stream is provided, it renders alone.

When neither pretext nor stream is configured, no top content is shown. When only pretext exists, it remains single-column. After sign-in, the stream (if set) appears as the second column, displacing the pretext to the left.

### Available Scripts

In the project directory, you can run:

#### `pnpm start`

Runs the app in development mode with Vike + Vite.<br /> Open
[http://localhost:5173](http://localhost:5173) to view it in the browser (note
the port may change if already used).

#### `pnpm build`

Builds the app for production to the `dist` folder.<br />
The output now includes both the client bundle and the Vike SSR server bundle:

- `dist/client` for browser assets
- `dist/server` for the SSR entry and page server bundles

#### `pnpm perf:lab`

Loads URLs in headless Chrome, unthrottled and on Fast 4G with a 4x CPU slowdown, and prints the median of
`--runs` (default 3): time to a ready selector, documents loaded, FCP, LCP, blocking time and JS/font bytes.
Needs Google Chrome. Add `--json` for machine output and `--storage-state <file>` for logged-in pages (name it
`perf-lab-state.json`, which is git-ignored: it holds a session token). FCP and LCP count from the start of the first
navigation. Blocking time covers what the last document did up to one second after it was ready; bytes cover every
request from the first navigation up to that point. Without `--ready` the script waits for the network to go quiet,
which adds about 500 ms to the ready time. For a URL that redirects in the browser (such as `/`), pass `--ready`:
network idle can fire between the two documents.

```sh
pnpm perf:lab -- --url https://app.vocdoni.io/en/account/signin --ready 'input[type="email"]'
```

#### `pnpm translations`

Extracts all i18n strings from the code and puts them in the `i18n/locales` json
files. The best way to work with translations is:

### Branching and deploys

Three branches are linked to deploys:

- [![GitHub Actions Workflow Status][build badge develop]][app-dev.vocdoni.io] linked to SaaS api-dev and vochain dev.
- [![GitHub Actions Workflow Status][build badge stage]][app-stg.vocdoni.io] linked to SaaS api-stg and vochain LTS.
- [![GitHub Actions Workflow Status][build badge main]][app.vocdoni.io] linked to SaaS api-lts and vochain LTS.

Only `app.vocdoni.io` allows search engines to crawl: every other hostname serves a `robots.txt` with `Disallow: /`, decided per request in `server/robots.mjs`.

Pushes and pull requests to `develop` and `stage` are validated by the GitHub
Actions test workflow, which runs lint, test, and env-specific production
builds.

The common flow to follow when deploying to `main` is passing through all the
other stages:

    branch from develop => merge to develop => merge to stage => merge to main

The only exception should be when fixing specific versions to a deployment, in
such case, a hotfix should be created from the desired branch to be updated:

    branch from stage (i.e. h/sdk-0.4.1) => PR to stage
    branch from main (i.e. h/sdk-0.5.0) => PR to main

## Contributing

While we welcome contributions from the community, we do not track all of our issues on Github and we may not have the resources to onboard developers and review complex pull requests. That being said, there are multiple ways you can get involved with the project.

Please review our [development guidelines](https://developer.vocdoni.io/development-guidelines).

The working rules are in [AGENTS.md](AGENTS.md) (for people and coding agents alike). Copy, voice and logo use follow
[BRAND.md](BRAND.md); how screens are built follows [DESIGN.md](DESIGN.md), and UI and theme changes follow the
[UI guidelines](docs/ui-guidelines.md). Task-specific procedures live as agent skills in `.agents/skills/`.

### Contributions and pull requests

To avoid unnecessary review overhead, **pull requests that only fix typos, whitespace, punctuation, or other minor changes without functional impact or clear added value will not be accepted**. If you want to correct such issues, please open an issue first. If the change is considered necessary, it may be accepted as a dedicated pull request that groups those corrections together. Accepted contributions must provide a clear benefit, whether through functional improvements, meaningful documentation updates, or the implementation of a feature or bug fix. Minor changes should be made with consideration and strong justification to avoid unnecessary distractions for reviewers.

## License [![License: BSL 1.1](https://img.shields.io/badge/license-BSL%201.1-blue.svg)](https://mariadb.com/bsl11/)

This repository is licensed under the [Business Source License 1.1](./LICENSE).

Copyright © 2025 Vocdoni.


[app-dev.vocdoni.io]: https://app-dev.vocdoni.io
[app-stg.vocdoni.io]: https://app-stg.vocdoni.io
[app.vocdoni.io]: https://app.vocdoni.io
[vocdoni logo]: https://docs.vocdoni.io/Logotype.svg
[commit activity badge]: https://img.shields.io/github/commit-activity/m/vocdoni/vocdoni-app
[discord badge]: https://img.shields.io/badge/discord-join%20chat-blue.svg
[github issues badge]: https://img.shields.io/github/issues/vocdoni/vocdoni-app
[twitter badge]: https://img.shields.io/twitter/follow/vocdoni?style=social&label=Follow
[build badge develop]: https://img.shields.io/github/actions/workflow/status/vocdoni/vocdoni-app/test.yml?branch=develop&label=develop
[build badge stage]: https://img.shields.io/github/actions/workflow/status/vocdoni/vocdoni-app/test.yml?branch=stage&label=stage
[build badge main]: https://img.shields.io/github/actions/workflow/status/vocdoni/vocdoni-app/test.yml?branch=main&label=main

[discord invite]: https://chat.vocdoni.io
[twitter follow]: https://twitter.com/intent/user?screen_name=vocdoni
[github issues]: https://github.com/vocdoni/vocdoni-app/issues
[github commits]: https://github.com/vocdoni/vocdoni-app/commits/main

[SDK]: https://developer.vocdoni.io/sdk
[related react packages]: https://github.com/vocdoni/ui-components#vocdonis-ui-components
