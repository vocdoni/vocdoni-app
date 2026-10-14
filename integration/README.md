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

## Pinning upstream commits

Comment on a pull request to run the suite against upstream built from source.
Each key is optional:

```text
/integration vocdoni-node=<ref> saas-backend=<ref> integrator-sdk=<ref>
```

- A bare `/integration` is an ordinary run: `:main` images and the npm packages
  from the lockfile.
- A ref is a branch, a tag or a commit SHA. A short SHA only resolves for a commit
  reachable from a branch or tag; for any other commit use the full SHA. An upstream
  PR head works as `pull/<N>/head`.
- `vocdoni-node` and `saas-backend` are built into Docker images and the stack
  runs those instead of `:main`.
- `integrator-sdk` is cloned, built and packed. Its `@vocdoni/*` packages are
  installed in place of the npm versions, transitive copies included, through
  pnpm overrides. The overrides are added to `pnpm-workspace.yaml` for that run
  only, so nothing is committed back.
- Only users with write access can trigger it. The PR head is pinned when the
  run starts, so later pushes do not change what runs.
- Source builds take a long time (the Go images and the SDK each take minutes),
  so a pinned run gets 90 minutes instead of 45.
- The result is posted back to the PR with the App head, the upstream SHAs and
  the run link.
- The comment trigger runs the workflow file from `develop` (the default
  branch), so changes to the workflow only take effect once merged.
- The Actions tab's "Run workflow" takes the same refs as the
  `vocdoni_node_ref`, `saas_backend_ref` and `integrator_sdk_ref` inputs.

Locally, build an image and point the stack at it:

```bash
out="$(scripts/integration-build-image.sh vocdoni-node <ref>)"
image="$(sed -n 's/^image=//p' <<<"$out")"
[ -n "$image" ] && VOCDONI_NODE_IMAGE="$image" pnpm test:e2e:stack
```

Use `SAAS_BACKEND_IMAGE` and `saas-backend` the same way.

Locally, pack the SDK and install it in place of the npm packages:

```bash
scripts/integration-build-sdk.sh <ref> /tmp/sdk-tgz
node scripts/integration-use-sdk.mjs /tmp/sdk-tgz
pnpm install --no-frozen-lockfile
# when done, restore the files the last two commands rewrote:
git checkout pnpm-workspace.yaml pnpm-lock.yaml
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
