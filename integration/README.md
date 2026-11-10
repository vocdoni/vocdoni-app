# Integration stack

A disposable, self-contained Vocdoni backend for local development and for the
end-to-end suite in [`e2e/`](../e2e/README.md):

| Service   | What it is                            | Published on            |
| --------- | ------------------------------------- | ----------------------- |
| `mongo`   | saas-backend's database               | —                       |
| `vocone`  | single-node Vochain (`voconed`)       | —                       |
| `api`     | `ghcr.io/vocdoni/saas-backend:main`   | `localhost:8080`        |
| `mailhog` | SMTP sink with a readable HTTP inbox  | `localhost:8025`        |

The app under test is **not** part of the stack — it runs on the host
(`pnpm serve:ssr`), so the suite exercises the same server bundle we ship.

## Usage

```bash
scripts/integration-stack.sh up     # start + seed the default plan, leave it running
scripts/integration-stack.sh down   # tear down, dropping volumes
scripts/integration-stack.sh run    # up, build the app, run the e2e suite, then stop
```

`up` leaves the stack running — that is its job: iterate against it and browse
the inbox. `run` is one-shot and stops the containers when it finishes, *unless*
the suite failed (the logs and inbox are the evidence you need) or
`INTEGRATION_KEEP_STACK` is set. It stops with `down`, not `down -v`, so the
cached circuit artifacts survive for a fast next boot; `down` is the explicit
full clean.

Ports are overridable with `INTEGRATION_HOST_PORT`, `INTEGRATION_MAILHOG_PORT`
and `INTEGRATION_APP_PORT`. Re-running `up` against a stack that is already
running just reuses it.

To point the app at it:

```bash
SAAS_URL=http://localhost:8080 pnpm build && pnpm serve:ssr
```

The stack runs the `:main` images of `vocdoni-node` and `saas-backend` and the
npm `@vocdoni/*` packages from the lockfile. To run against unmerged upstream
commits instead, see [Pinning upstream commits](#pinning-upstream-commits).

## Stripe mode (opt-in)

By default the backend gets dummy Stripe keys and a plan is seeded into mongo,
so Stripe is never called. Set `INTEGRATION_STRIPE_SECRET_KEY` to a Stripe
**test** key (`sk_test_...`) to run against a real Stripe sandbox instead: the
backend syncs its plans from the sandbox's products, and a `stripe-listen`
container forwards the sandbox's webhooks to the api
(`integration/docker-compose.stripe.yml`). Also set
`INTEGRATION_STRIPE_PUBLIC_KEY` to the matching test publishable key
(`pk_test_...`): the app gets it at boot, and the checkout spec needs it.
`up` warns if it is missing.

```bash
INTEGRATION_STRIPE_SECRET_KEY=sk_test_... INTEGRATION_STRIPE_PUBLIC_KEY=pk_test_... \
  scripts/integration-stack.sh up
```

It runs the default `:main` saas-backend, the one `develop` deploys. Run
`scripts/integration-stack.sh down` before switching between default and Stripe
mode: `run` keeps volumes, so a stack seeded in one mode keeps that mode's plans.
`up` in Stripe mode deletes the seeded `local-dev` plan, but it does not undo
anything else. The sandbox needs:

- Products that the backend's plan sync can read. Every product it does not skip
  needs valid JSON metadata `organization`, `votingTypes` and `features`. One
  product that fails to parse makes the whole Stripe setup fail, and the only
  symptom from `up` is "no default plan". Use a sandbox that holds only the plan
  product(s).
- A product whose default price has metadata `Default=true`. The backend's
  startup plan sync keeps no default plan without it, and `POST /organizations`
  needs one.
- A tax origin address (Settings > Tax). The backend's checkout sessions enable
  automatic tax.
- An API version on the same release train as the backend's stripe-go (`endive`
  today). The backend's webhook check rejects events from another train, so
  plain `stripe listen` works.
- No webhook endpoint pointing at a real deployment. Stripe sends this run's
  events to every endpoint in the sandbox, and a deployment that does not know
  these organizations answers 500 and gets retried for up to three days.

Stripe mode is for a sandbox you own: the run creates real test-mode payments
there. Live keys (`sk_live_`, `rk_live_`) and live publishable keys (`pk_live_`)
are refused before anything starts.

- The script never prints the key or the webhook signing secret, and it redacts
  both from the stripe-cli and container output it shows on failure. But
  `docker compose ... logs stripe-listen` does show the `whsec_` secret, because
  stripe-cli prints it. Do not share raw container logs from this mode.
- The webhook signing secret is derived from the key with the Stripe CLI.
- The plan seed is skipped. The default plan must come from the Stripe sync, and
  `up` fails with a clear error if it does not. `up` also fails if the
  `stripe-listen` container is not running after startup, and prints its last
  log lines with secrets redacted.
- The stripe-cli image defaults to `stripe/stripe-cli:v1.55.3`. Override it with
  `INTEGRATION_STRIPE_CLI_IMAGE`.
- CI runs this mode in the `e2e-stripe` job of `.github/workflows/integration.yml`.
  It needs the repo secret `INTEGRATION_STRIPE_SECRET_KEY` and a publishable key
  in `INTEGRATION_STRIPE_PUBLIC_KEY` (a repo variable or secret), and it skips
  with a notice naming whichever is missing.

## Pinning upstream commits

Comment on a pull request to run the suite against upstream built from source.
Each key is optional:

```text
/integration vocdoni-node=<ref> saas-backend=<ref> integrator-sdk=<ref>
```

- A bare `/integration` is an ordinary run: `:main` images and the npm packages
  from the lockfile.
- A ref is a commit SHA (7-40 hex), a branch, a tag, or a PR number for that
  upstream repo's PR head. Write the PR number bare (`saas-backend=760`), which is
  the recommended form. `saas-backend=#760` still works. GitHub autolinks `#760` to
  this repo's issue, and copying a rendered comment pastes links the parser rejects.
  A branch or tag named only 1-6 digits cannot be pinned by name.
- `vocdoni-node` and `saas-backend` are built into Docker images and the stack
  runs those instead of `:main`.
- `integrator-sdk` is built and packed. Its `@vocdoni/*` packages are installed in
  place of the npm versions, transitive copies included, through pnpm overrides.
  The overrides are added to `pnpm-workspace.yaml` for that run only, so nothing
  is committed back.
- Only users with write access count: comments from anyone else are ignored
  silently. A `/integration` line that does not parse gets a "rejected" reply.
- The run tests the PR's merge commit, as the `pull_request` check does, as it is
  when the run starts. A push after that is not picked up by that run.
- Each comment starts its own run; earlier ones are not cancelled.
- Images and the SDK are built from source, so allow ~10+ extra minutes. A pinned
  run gets 90 minutes instead of 45.
- The result is posted back to the PR as a comment with the App head, the upstream
  SHAs and the run link. A failed run's comment includes the failing step's output.
  A push run on a pinned PR posts a new comment each time, with the same details.
- The comment trigger runs the workflow file from `develop` (the default branch),
  so changes to the workflow only take effect once merged.

### One-shot or sticky

- A comment with any SHA runs once.
- A comment whose refs are all branches, tags or `#PR`s sticks: every push to the
  PR re-resolves those refs and builds them again, until `/integration reset`. A
  later sticky comment replaces the earlier one, for all three keys.
- A bare `/integration` is one-shot and does not change the sticky state.
- `/integration reset` clears the sticky state, and takes no other token.
- Only sticky refs from users with write access count, checked the same way as
  comment runs. Other comments are ignored for this purpose.
- A sticky pin also runs the end-to-end job on pull requests into `develop`, which
  otherwise skip it, so every push to that PR runs the suite against those refs.
- A push to an upstream PR does not trigger a run: comment the same line again, or
  re-run the workflow from the Actions tab.
- The `pull_request` run uses the workflow from the PR's merge commit, so once this
  is merged into `develop`, open PRs pick it up on their next push, unless they
  conflict with `develop`.

### Actions tab

The "Run workflow" form takes `vocdoni_node_ref`, `saas_backend_ref` (same forms
as above) and `integrator_sdk_ref`: the SDK commit, branch, tag or `#PR` to build
and install. Leave `integrator_sdk_ref` empty for the npm packages from the
lockfile. The branch picked in "Use workflow from" is the app under test.

Locally, build an image and point the stack at it:

```bash
out="$(scripts/integration-build-image.sh vocdoni-node <ref>)"
image="$(sed -n 's/^image=//p' <<<"$out")"
[ -n "$image" ] && VOCDONI_NODE_IMAGE="$image" pnpm test:e2e:stack
```

Use `SAAS_BACKEND_IMAGE` and `saas-backend` the same way. `up` prints the two
images it is using, so a run shows what it tested.

saas-backend is private, so building it locally fetches over SSH and needs your
own GitHub SSH access to `vocdoni/saas-backend`. CI uses the read-only
`SAAS_BACKEND_DEPLOY_KEY` deploy key instead.

Locally, pack the SDK and install it in place of the npm packages:

```bash
scripts/integration-build-sdk.sh <ref> /tmp/sdk-tgz
node scripts/integration-use-sdk.mjs /tmp/sdk-tgz
pnpm install --no-frozen-lockfile
# when done, restore the files the last two commands rewrote, then the npm versions:
git checkout pnpm-workspace.yaml pnpm-lock.yaml
pnpm install
```

## Reading the mail

**This is the debugging tool we were missing.** Every email the backend sends —
account verification codes, CSP 2FA OTPs, password resets, team invites — lands
in MailHog and is browsable at <http://localhost:8025>, with no mail provider
and no real inbox involved. Useful well beyond the test suite: it is the only
way to step through a 2FA voter flow by hand in dev.

Programmatic access is via its HTTP API (`/api/v2/search?kind=to&query=…`);
`e2e/helpers/mailhog.ts` wraps the parts we need.

The `mailhog` service shares the `api` container's **network namespace** on
purpose. saas-backend only permits credential-less SMTP when the server is
`localhost`/`127.0.0.1` (`notifications/smtp/smtp.go`), and Go's `net/smtp`
refuses `PlainAuth` over an unencrypted connection — so sharing the namespace is
what lets `VOCDONI_SMTPSERVER=127.0.0.1` work with no credentials at all.

## The plan seed

`seed-plan.js` inserts one default subscription plan. It is not optional: a
fresh `saasdb.plans` collection is empty, and without a default plan
`POST /organizations` fails with `no default plan available` — the first thing
the signup journey does after verifying an account. Its `features.twoFaEmail`
quota is also what permits the email 2FA channel the voting suite depends on.

`scripts/integration-stack.sh` asserts the seed took (`GET /plans` must return a
non-empty list) rather than letting a silent mismatch surface later as a
confusing organization-creation error.

## Upstream drift

`docker-compose.ci.yml` is **vendored from integrator-sdk's**
`integration/docker-compose.ci.yml`. Both track the moving `:main` tags of
`saas-backend` and `vocdoni-node`, so when upstream changes its startup
contract, re-sync from there rather than rediscovering the fix — the comments in
that file encode real failure modes (notably the sizing of vocone's healthcheck
window around its own 300s zk-circuit download deadline; **do not tighten it**).

The CI workflow prints the resolved image digests on every run, so a job that
goes red with no change in this repo can be reproduced locally. Locally, the
`VOCDONI_NODE_IMAGE` and `SAAS_BACKEND_IMAGE` environment variables override the
`:main` images (see [Pinning upstream commits](#pinning-upstream-commits)).
