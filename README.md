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
    <a href="https://github.com/vocdoni/vocdoni-node">Vocdoni Node</a>
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
- `src/pages/@catchAll/` for the SPA catch-all page
- `src/router/` for the client-side React Router application

### Environment variables

You can create a `.env.local` file to set your custom environment variables
there, here's a list of variables you can use:

- `VOCDONI_ENVIRONMENT`: the vocdoni environment to be used, either
  `dev` or `prod` (defaults to `dev`).
- `BASE_URL` is used to specify the public base page during build.
- `BUILD_PATH` Specifies the destination of built files.
- `CUSTOM_ORGANIZATION_DOMAINS` A JSON.stringified object of custom domains mapped to organization ids, to
  replace the homepage with their profile page.

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

#### `pnpm translations`

Extracts all i18n strings from the code and puts them in the `i18n/locales` json
files. The best way to work with translations is:

### Branching and deploys

Three branches are linked to deploys:

- [![GitHub Actions Workflow Status][build badge develop]][app-dev.vocdoni.io] linked to SaaS api-dev and vochain dev.
- [![GitHub Actions Workflow Status][build badge stage]][app-stg.vocdoni.io] linked to SaaS api-stg and vochain LTS.
- [![GitHub Actions Workflow Status][build badge main]][app.vocdoni.io] linked to SaaS api-lts and vochain LTS.

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
