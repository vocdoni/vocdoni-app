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
scripts/integration-stack.sh up     # start + seed the default plan
scripts/integration-stack.sh down   # tear down, dropping volumes
scripts/integration-stack.sh run    # up, build the app, run the e2e suite
```

Ports are overridable with `INTEGRATION_HOST_PORT`, `INTEGRATION_MAILHOG_PORT`
and `INTEGRATION_APP_PORT`.

To point the app at it:

```bash
SAAS_URL=http://localhost:8080 pnpm build && pnpm serve:ssr
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
goes red with no change in this repo can be reproduced locally.
