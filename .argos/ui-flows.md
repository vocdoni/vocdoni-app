# UI Flows

Human-readable contract of the core user flows for the Vocdoni web app. Developers can follow these steps by hand in a browser, and they are compiled into an automated Playwright suite.

Style rule for this file: describe the BEHAVIOR the app must have, not incidental screen details. Concrete numbers, copy variations, and cosmetic layout are free to change; the behaviors below are the contract.

## Setup

- install: `pnpm install --frozen-lockfile`
- build: (none — flows run against the Vite/Vike dev server)
- start: `pnpm start`
- url: http://localhost:3000
- ready: `GET /` returns HTTP 200 (SPA shell; the app boots client-side, so wait for the app's landing content to render before interacting)
- notes: |
    No `.env.local` is required — `VOCDONI_ENVIRONMENT` defaults to `dev` and `SAAS_URL` defaults
    to the public Vocdoni dev backend (`https://saas-api-dev.vocdoni.net`). Requires network
    access to that backend.

    Authenticated flows use a dedicated, disposable test account on the DEV backend (anyone can
    self-register there; the account has no privileges beyond its own empty test organization):

    - email: `argos-uiflows-1786480980@emalupe.com`
    - password: `ArgosUITest1234`
    - organization: "Argos Flows Org" (pre-created, admin role, Free plan)

    Do NOT change this account's password or delete its organization — the flows depend on that
    state. If the account is ever lost, register a fresh one on the dev backend, create one
    organization named "Argos Flows Org", and update the credentials here.

    Determinism rules: flows never mutate backend state — nothing is published, saved, invited,
    imported or reset. Forms may be filled and dialogs opened, but every flow leaves the account
    and organization exactly as it found them. A cookie-consent banner appears on first load and
    must be dismissed (click "Reject") before interacting.

## Flow: Unauthenticated visitors are taken to sign in

Proves the app boots and the root route requires authentication.

1. Open the app's base URL with no session.
2. Wait for the app to finish redirecting.
   - expect: the browser ends up on the sign-in screen (`/account/signin`, language-prefixed).
3. Look at the sign-in screen.
   - expect: the form offers an email field, a password field, and a way to submit, plus paths to sign up and to recover a forgotten password.

## Flow: Sign in rejects invalid credentials

Proves the sign-in form performs real authentication against the backend and surfaces failures.

1. From the sign-in screen, dismiss the cookie-consent banner.
2. Fill the form with a syntactically valid email that has no account and any well-formed password.
3. Submit.
   - expect: an error indicating the credentials are not valid is shown, no session is created, and the browser stays on the sign-in screen.

## Flow: Sign in with the test account reaches the organization dashboard

Proves real authentication end-to-end: login against the live dev backend, session establishment, and the organization dashboard rendering live account data.

1. From the sign-in screen, dismiss the cookie-consent banner.
2. Fill the form with the test account credentials from Setup and submit.
   - expect: the browser lands on the admin dashboard (`/admin`).
3. Look at the dashboard.
   - expect: the screen identifies itself as the dashboard and shows the signed-in user's organization ("Argos Flows Org") in the workspace switcher.
4. Check the plan usage panel.
   - expect: a usage section reports the organization's current consumption against its plan's limits — at least voting processes and memberbase size, each rendered as a usage-out-of-limit pair (whatever the numbers are).
5. Check the quick actions.
   - expect: shortcuts exist to create a new vote, view active votes, and manage the team.

## Flow: Session and route protection behave correctly

Proves deep admin routes are gated behind authentication and sessions persist across reloads.

1. With no session, open a deep admin route directly (the vote composer, `/admin/processes/create`).
   - expect: the app redirects to the sign-in screen instead of rendering any admin content.
2. Dismiss the cookie-consent banner and sign in with the test account.
   - expect: after login the user lands in the authenticated admin area (their organization workspace is shown, not the sign-in screen).
3. Reload the page.
   - expect: the session survives: an authenticated admin screen renders again without asking for credentials.

## Flow: Logout ends the session

Proves the account menu exposes session controls and logging out actually revokes access.

1. Sign in with the test account and land on the dashboard.
2. Open the account menu (the control showing the user/organization identity).
   - expect: the menu shows the signed-in account's email and offers user settings, preferences (theme, language), and a logout action.
3. Choose Logout.
   - expect: the session ends and the browser leaves the admin area.
4. Open any admin route directly (`/admin`).
   - expect: the app redirects to the sign-in screen — the previous session is no longer valid.

## Flow: Password recovery does not reveal whether an account exists

Proves the credential-recovery path works and is enumeration-safe.

1. From the sign-in screen, follow the forgotten-password path.
   - expect: a recovery screen asks for an email address.
2. Submit an email address that has no account.
   - expect: the app responds identically to how it would for a real account — a neutral confirmation that a code was sent IF the address exists, together with the form to enter the code and choose a new password. It must NOT state whether the account exists.

## Flow: Dashboard sidebar navigates all organization sections

Proves the authenticated app shell: every sidebar section routes correctly and renders its own management screen.

1. Sign in with the test account and land on the dashboard.
2. Open the voting-processes section from the sidebar.
   - expect: the URL changes to the processes area, the screen identifies itself as the voting-processes list, and offers filtered views for all/ended/draft processes.
3. Open the memberbase section from the sidebar.
   - expect: the URL changes to the memberbase area, with members and groups views and actions to add or import members.
4. Open the settings section from the sidebar.
   - expect: the URL changes to the settings area, titled for the organization ("Argos Flows Org"), with sections for organization details, team, and the subscription plan.

## Flow: Team page reflects the organization's membership

Proves team management renders live membership data for the organization.

1. Sign in with the test account and open Settings → Team.
   - expect: the team screen states that the signed-in account is currently the organization's only member and offers an action to add/invite more team members. Do not actually invite anyone.

## Flow: Adding a member is offered but can be abandoned safely

Proves the memberbase add-member entry point works and cancelling leaves no trace.

1. Sign in with the test account and open the memberbase section.
   - expect: the members view shows the organization currently has no members.
2. Trigger the add-member action.
   - expect: a form opens asking for the member's identity data (at least name, surname and email among its fields).
3. Close/cancel the form without saving.
   - expect: the form disappears and the members view still shows no members — nothing was created.

## Flow: Vote composer builds a multi-option question without publishing

Proves the deepest organizer surface: the voting-process composer, its dynamic question form, and its configuration sections. This flow must NEVER click "Publish" or "Save".

1. Sign in with the test account and, from the dashboard, use the create-new-vote shortcut.
   - expect: the browser lands on the composer (`/admin/processes/create`), which offers starting templates for common vote kinds.
2. Fill the process title field with "Argos smoke vote".
3. Fill the first question's title with "Which option is best?" and its first two option fields with "Alpha" and "Beta".
4. Scroll the add-option control into view and use it.
   - expect: a third option field appears; fill it with "Gamma".
5. Review the configuration sections.
   - expect: the composer exposes scheduling configuration (start/end), extra configuration (result visibility, voting power), and a census section explaining a voter group is required before the vote can start.
6. Confirm the composer's actions without using them.
   - expect: publish and save actions are present. Do NOT trigger either — leave the page without saving.

## Flow: Public organization page renders a 404 and supports switching language

Proves the SSR-rendered public organization route boots, handles an unknown organization gracefully, and its navigation (language switcher) works.

1. Open the public organization page for an address that does not exist (`/organization/0x0000000000000000000000000000000000dead`).
2. Dismiss the cookie-consent banner.
   - expect: a not-found page is shown (404), with a way back to the home page and the app's public navigation (login, language switcher, theme toggle).
3. Use the language switcher to choose Spanish.
   - expect: the URL gains the Spanish language prefix (`/es/`) and the page content renders translated into Spanish.

## Flow: Public process page renders a 404 for an unknown process

Proves the second SSR-rendered public route (election/process pages) boots and handles an unknown id gracefully.

1. Open the public process page for an id that does not exist (`/processes/0x0000000000000000000000000000000000000000000000000000000000dead`).
2. Dismiss the cookie-consent banner.
   - expect: a not-found page is shown (404), with a way back to the app.
