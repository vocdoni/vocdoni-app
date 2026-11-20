---
name: integration-pinning
description: "Run vocdoni-app's integration and e2e suite against unmerged upstream work with the /integration PR comment (saas-backend, vocdoni-sequencer, integrator-sdk pins), and read its results. Use when a PR depends on an unmerged saas-backend, vocdoni-sequencer or vocdoni-integrator-sdk change, when asked to pin, re-run or reset the integration run, when the Integration check or its PR comment fails, or when deciding whether a pinned PR may merge."
---

# Pinning upstream changes in the integration run

The integration workflow (`.github/workflows/integration.yml`) runs against the published `:main` images of
`vocdoni/vocdoni-sequencer` and `vocdoni/saas-backend` and the npm `@vocdoni/*` packages from the lockfile. When a PR here
depends on upstream work that is not merged yet, that run fails or proves nothing. Details are in
`integration/README.md` ("Pinning upstream commits").

## The rule

When a PR depends on an unmerged `saas-backend`, `vocdoni-sequencer` or `vocdoni-integrator-sdk` change:

1. Open the PR with its usual description, linking the upstream PR.
2. Post a **separate PR comment** holding only the command, pointing at that upstream PR, for example
   `/integration saas-backend=760`. Use the bare PR number: `#760` also works, but GitHub autolinks it to this repo.
   No signature or other text in that comment. The command does nothing in the PR description.

## Command syntax

- Keys: `vocdoni-sequencer=`, `saas-backend=`, `integrator-sdk=` (the SDK repo, built, packed and installed through pnpm
  overrides for that run only). Each is optional. A ref is a SHA, branch, tag, or PR number (bare `760` or `#760`).
  Upstreams are built from source, so the run takes longer.
- Refs that are all branches, tags or PRs make the pin **sticky**: every later push re-runs against those refs at their
  current heads. Any SHA makes it a one-shot run, and so does a bare `/integration` (`:main` images and npm packages),
  without changing the sticky refs. `/integration reset` goes back to the `:main` images and npm packages.
- Only users with write access can trigger it. The comment trigger runs the workflow from `develop` and replies with a
  PR comment; a failed run's reply includes the failing step's output. Sticky re-runs on push show up as the
  Integration check and post a new PR comment each time.

## When it runs

The workflow runs on merges into `develop`, on PRs to `stage` or `main`, on any PR with sticky pins, and on a
`/integration` comment. A sticky pin also runs the e2e job on PRs into `develop`, which otherwise skip it. Pushes to the
upstream PR re-run nothing here: push to this PR or comment again.

## Merging a pinned PR

A green pinned run is not a green light:

- `saas-backend` or `vocdoni-sequencer`: merge only after the upstream change is merged **and deployed** to the environment
  the base branch uses (`develop` → api-dev and vochain dev).
- `integrator-sdk`: merge only after it is published to npm and bumped here; the pinned run commits nothing.
- The pin only reaches the e2e job. Lint, type checks and unit tests (`test.yml`) still use the lockfile packages, so a
  PR that needs unpublished SDK API stays red there until the bump.

## Running it locally

`pnpm test:e2e:stack` boots the same disposable stack (needs docker) and runs the suite; `e2e/README.md` and
`integration/README.md` cover Stripe mode, reading the mail on `localhost:8025` and using a local upstream checkout.
