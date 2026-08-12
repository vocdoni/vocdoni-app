# UI Flows

This file describes the core user flows of the Vocdoni App that should keep working across changes. It is the human-readable contract behind the automated UI smoke suite.

## Setup

- install: `corepack enable && pnpm install --frozen-lockfile`
- build: (none — the dev server is used directly)
- start: `pnpm start`
- url: http://localhost:3000
- ready: `GET /` returns 200
- notes: The app talks to the real Vocdoni SaaS dev API (`SAAS_URL=https://saas-api-dev.vocdoni.net`, the default in `.env`). No test account is configured or required — all flows below are reachable without signing in and without any backend mutation, so they stay deterministic even though the API is live. Every page is served under a locale prefix (e.g. `/en/...`); force the browser locale to `en-US` so the app resolves to English deterministically. A cookie-consent banner (`role=dialog`, "Cookies consent banner") appears on first load in each fresh browser context unless the `vocdoni-cookie-consent` localStorage key is already set — pre-seed it (or dismiss the banner) before interacting with the page, otherwise it can intercept clicks.

## Flow: Unauthenticated access redirects to sign in

Proves that visiting the app without a session lands on the sign-in page instead of exposing the admin dashboard.

1. Open the app at the root URL (`/`).
   - expect: the browser ends up on the sign-in page (URL contains `/account/signin`).
2. Look at the sign-in page.
   - expect: a "Welcome" heading, an "Email" field, a "Password" field, and a "Log In" button are visible.
3. Directly request the admin dashboard (`/admin`) while still signed out.
   - expect: the app redirects to the sign-in page again instead of showing the dashboard.

## Flow: Sign-in form validation

Proves that the sign-in form validates required input client-side before it would contact the backend.

1. Go to the sign-in page (`/account/signin`).
2. Submit the form by clicking "Log In" without entering a password.
   - expect: a "This field is required" error appears under the Password field, and the page stays on sign-in.

## Flow: Navigating between auth pages

Proves the links connecting the sign-in, sign-up, and password-recovery pages work.

1. Go to the sign-in page (`/account/signin`).
2. Click the "Sign up" link.
   - expect: the app navigates to the sign-up page (URL contains `/account/signup`) showing a "Sign up" heading.
3. Click the "Log In" link on the sign-up page to go back.
   - expect: the app navigates back to the sign-in page (URL contains `/account/signin`).
4. Click the "Forgot your password?" link.
   - expect: the app navigates to the password-recovery page (URL contains `/account/password`) showing a "Forgot your password?" heading and an "Email password reset link" button.

## Flow: Sign-up form validation

Proves the sign-up form enforces required fields and field-specific formats client-side.

1. Go to the sign-up page (`/account/signup`).
2. Submit the form by clicking "Create my account" without filling anything in.
   - expect: "This field is required" errors appear for First name, Last name, Email, Password, and the Terms of Service checkbox.
3. Fill First name, Last name, an invalid email ("not-an-email"), and a short password ("short"), then submit again.
   - expect: "Invalid email address" appears under Email and "Min. 8 characters" appears under Password, while the First name/Last name errors are gone.

## Flow: 404 page and language switch

Proves unknown routes render a friendly not-found page, and that the language switcher changes the UI language on a public page.

1. Open an unknown URL (e.g. `/this-page-does-not-exist`).
   - expect: a "Page Not Found" heading and a "Back to home" button are visible.
2. Open the "user menu" in the header and choose "Català".
   - expect: the URL locale segment changes to `/ca/...` and the not-found heading is now shown in Catalan ("Pàgina No Trobada").
3. Click the "Torna a l'inici" ("Back to home") action.
   - expect: the app navigates away from the 404 page (since the visitor is unauthenticated, it ends up on the sign-in page).
