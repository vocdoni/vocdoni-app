# End-to-end tests

Playwright specs that drive a real browser through the app's **email-driven
journeys**, against a disposable full stack (mongo + vocone + saas-backend +
MailHog) started from `integration/docker-compose.ci.yml`.

They are **not** part of `pnpm test` — that stays a fast, unit-only run. These
need docker, a live chain and a few minutes.

## Why this exists

The generic voting lifecycle (org → members → census → publish → vote →
tallies) is already covered by
[integrator-sdk](https://github.com/vocdoni/integrator-sdk)'s integration suite.
What had no coverage anywhere is what _this app_ owns: the signup/auth UX and
the voter-facing 2FA journey. Both hinge on emails — OTP codes and verification
links — which were invisible in dev and unassertable in CI.

The MailHog inbox in the stack fixes that in both directions: the suite reads
codes out of it programmatically, and **you can browse it at
<http://localhost:8025>** while debugging a 2FA flow by hand.

## Running

The one-liner — boots the stack, seeds it, builds the app and runs the suite:

```bash
pnpm test:e2e:stack
```

Tear it down afterwards:

```bash
scripts/integration-stack.sh down
```

To iterate (keep one stack, run the suite repeatedly):

```bash
scripts/integration-stack.sh up          # prints SAAS_URL and MAILHOG_URL
SAAS_URL=http://localhost:8080 pnpm build
pnpm test:e2e                            # ...as often as you like
pnpm test:e2e -- --headed                # watch it happen
pnpm test:e2e:ui                         # Playwright's UI mode
```

Playwright starts the app itself (`pnpm serve:ssr` on `:3000`) via its
`webServer` config, so a build must exist first. `SAAS_URL` is read by the SSR
server at boot — the same build works against any backend, with no rebuild.

It deliberately **never reuses a server already listening on the port**, and
fails loudly instead. That is not pedantry: the SSR bundle is loaded into memory
at boot while client assets are served from disk under content-hashed names, so
a server left running across a `pnpm build` serves HTML referencing chunks that
no longer exist. The page still renders but never hydrates, and every click
silently does nothing — indistinguishable from an app bug. Always let Playwright
own the server; it boots in about a second.

If `8080`, `8025` or `3000` are taken (by this stack or by an unrelated dev
server), set `INTEGRATION_HOST_PORT`, `INTEGRATION_MAILHOG_PORT` or
`INTEGRATION_APP_PORT` before `up`.

## When everything suddenly fails

Check the stack is actually alive before debugging the suite —
`docker compose -f integration/docker-compose.ci.yml ps` and
`curl localhost:8080/ping`. A stopped backend surfaces as the _UI_ not
responding (a submit that never navigates), not as an obvious connection error,
because the failing request is made by the page.

## What it covers

| Spec                    | Journey                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signup-otp.e2e.ts`     | Register → read the verification code out of the emailed message (and check its link points back at this app) → verify → create an organization → land in `/admin`. Plus the negative case: a wrong code is rejected.                                                                                                                     |
| `csp-2fa-voting.e2e.ts` | The whole organizer→voter chain: signup → organization → CSV memberbase import → create a process with `memberNumber` credentials and an **email 2FA** census → publish on-chain → then, in a separate browser context, identify as a voter, receive the OTP, submit it and cast a ballot. Plus: a non-member gets no OTP mailed to them. |

Everything runs through the UI. Nothing is provisioned behind the app's back, so
a break anywhere along that chain fails here.

## Layout

- `helpers/mailhog.ts` — read the inbox: `waitForEmail`, `waitForCode`,
  `inboxFor`, `extractCode`, `extractLink`, and the `MailSubjects` the backend
  sends.
- `helpers/flows.ts` — reusable journeys (`registerAndVerify`,
  `createOrganization`, `importMembers`, `createAndPublishTwoFactorProcess`,
  `authenticateVoterWithOtp`, `castVote`).
- `helpers/fixtures.ts` — the `test` export to use instead of
  `@playwright/test` (it suppresses the cookie banner, which otherwise blocks
  clicks), plus helpers for Chakra's checkbox / switch / pin-input / combobox.
- `helpers/data.ts` — unique emails and the generated members CSV.

## Writing specs here

- **Import `test`/`expect` from `./helpers/fixtures`**, not from
  `@playwright/test`. Any context you create yourself needs
  `prepareContext(context)` for the same reason.
- **Prefer structural selectors over copy.** Form inputs carry `name`
  attributes (react-hook-form), Chakra tabs carry `data-value`, choice radios
  carry their ballot `value`, and a form's primary action is
  `button[type="submit"]`. Reach for `data-testid` only where none of those
  exist — each one in `src/` is commented with why.
- **Always pass `since:` to `waitForEmail`.** Without it a re-run can settle for
  a stale code still sitting in the inbox.
- **Select mail by subject.** The account-verification body _contains_ the 2FA
  body as a substring, so matching on the body alone can read the wrong code.

## Notes and gotchas

- **The create-process wizard auto-saves on every focusout**, and when the
  resulting draft read resolves it writes the server's copy back over the form.
  Anything typed in that window is silently discarded.
  `createAndPublishTwoFactorProcess` works around it by creating the draft
  first, reloading, and only then filling the form — see the comment there.
- **A voter's CSP session does not survive a page reload**, so "did the vote
  stick" is asserted from a fresh anonymous context reading the process's vote
  count, not by reloading the voter's tab.
- **The suite runs serially** (`workers: 1`). The specs share one backend and
  one MailHog inbox.
- **Processes are created with live results**, not the wizard's
  hidden-until-the-end default: a secret process seals ballots with encryption
  keys published after the fact, which is a separate feature with its own
  timing. This suite is about the email/OTP journey.

## CI

`.github/workflows/integration.yml` runs this on pushes to `develop` and on
pull requests targeting `stage` or `main` — the merge into the integration
branch, and the two promotions that actually reach users. Feature PRs into
`develop` do not run it (they are covered by `test.yml`); use
**Run workflow** on the Actions tab to trigger it by hand on any branch.

It is deliberately separate from `test.yml`: the stack tracks
`ghcr.io/vocdoni/{saas-backend,vocdoni-node}:main`, so a red run here often
means "upstream moved" rather than "this repo is broken", and that must not gate
the normal lint/unit/build job. The workflow prints the resolved image digests so
such a run is reproducible locally, and uploads the Playwright report (with
traces and video) plus all container logs on failure.
