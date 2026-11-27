---
name: payg-billing
description: "How pay-per-process (PAYG) billing works in vocdoni-app's UI: the organization wallet, process price quotes, paying a shortfall with Stripe Checkout Elements when publishing, wallet top-ups, buying voter places for a census, integrator-managed orgs and spend caps, the payment error codes (40174-40183) and the payg e2e spec. Use for any change to src/components/Pricing, src/components/Wallet, src/queries/{wallet,process-price,process-checkout,census-checkout}.ts, the publish step of the create-vote wizard, billing settings, Stripe, prices, VAT or money copy."
---

# Pay-per-process billing in the UI

There are no subscription plans any more. Every organization pays per published vote (and per voter place added later)
from a prepaid **wallet** in EUR. The backend owns prices, payments and the ledger; the UI quotes, collects the
shortfall through Stripe and then waits for the backend to confirm. Backend side: saas-backend#819. Epic: #1767.

Read the code paths named here before changing them; the comments in them record why each guard exists.

## Invariants

1. **Money is integer EUR cents, VAT excluded.** Stripe Tax adds VAT at checkout. Format with the helpers in
   `src/utils/numbers.ts`: `currency(cents)` in general (whole euros show no decimals), `currencyExact(cents)` inside
   the publish dialog (both cent digits, for every amount), and `amountFigure(cents)` in amount tables (columns of
   amounts, always cents, real minus). Parse user input with `parseEuroAmountCents`. Never divide by 100 or build `€`
   by hand. The Stripe total and VAT lines arrive already formatted from Stripe.
2. **A browser success proves nothing.** Stripe accepting a card does not mean the vote is published or the wallet is
   credited (the wallet is only credited by the verified webhook). Every flow waits for backend evidence: the publish
   job, the process reading `published`, or a new ledger entry.
3. **Never charge twice.** Opening a checkout resumes the open session for the same price; a 409 (40177) reads the
   payment state before doing anything; the wallet publish after a 400 runs once; React StrictMode is guarded with
   refs (`openingRef`, `startedRef`). Keep those guards when refactoring.
4. **Never claim success without proof.** A timeout means "may still land", never "failed". Without the sessionStorage
   snapshot (blocked in private windows, every access is try/catch) the return pages show neutral copy.
5. **No modal focus trap around Stripe.** A trapped dialog breaks Stripe's 3D Secure window. The census checkout renders
   inline; the publish dialog turns non-modal from the card step on and makes the page behind it `inert`.
6. **Stripe's appearance is the only place in billing where raw colours are allowed** (`src/components/Pricing/stripe.ts`, a listed
   style-inventory exception): its iframe cannot read CSS variables. Everything around it uses theme roles.
7. **Prices come from the backend.** No price tables, bands or estimates in the UI. A price query in error shows no
   price (never a stale one) and offers a retry.

## Who can do what

| Organization             | Wallet                                                  | How the UI knows                                         |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------------------- |
| Standard                 | Its own; admins and managers see it, only admins top up | `useWalletAccess()` in `src/queries/wallet.ts`           |
| Managed by an integrator | None: the integrator's wallet pays, within a spend cap  | `useWallet` gets 403 `40181` (`isManagedOrgWalletError`) |
| Integrator               | Pays for its managed orgs; cannot own processes (40174) | Spend caps via `useUpdateManagedOrganization`            |

No flag or env var picks the model: the UI asks the backend. `STRIPE_PUBLIC_KEY` is optional; without it every
checkout shows "payments are temporarily unavailable". Fixed per-org limits are in `src/constants/index.ts`
(`MaxWritersPerOrg`, `MaxDraftsPerOrg`, `MaxMembersPerOrg`…). Self-service stops at 50,000 voters
(`selfServiceVoterLimit`): above it the backend only sells through a custom quote (`quoteRequired`, and a `totalCents`
of 0 there is not free). Above 15,000 a quote is recommended.

## Endpoints and hooks

| Endpoint (SaaS API)                                | Hook / caller                                               |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `GET /processes/{id}/price`                        | `useProcessPrice` (`src/queries/process-price.ts`)          |
| `POST`/`GET`/`DELETE /processes/{id}/checkout`     | `useProcessCheckoutApi` (`src/queries/process-checkout.ts`) |
| `POST /processes/{id}/census/checkout`             | `useCensusCheckout` (`src/queries/census-checkout.ts`)      |
| `GET /organizations/{addr}/wallet`                 | `useWallet`, `useReadWalletHistory`                         |
| `POST /organizations/{addr}/wallet/topup`          | `useWalletTopUp`                                            |
| `PUT /integrator/organizations/{addr}` (spend cap) | `useUpdateManagedOrganization`                              |

The request and response types are in `@vocdoni/api-types` (`ProcessQuote`, `ProcessPriceResponse`,
`ProcessCheckoutResponse`, `ProcessPaymentStatusResponse`, `WalletResponse`, `WalletLedgerEntry`…); load the
`vocdoni-integrator-sdk` skill for the client. A quote is `lines` (`base`, `emailTwoFA`, `smsTwoFA`,
`signedCertificate`, `customUrl`, `branding`, `minimumCharge`) plus `totalCents`. Ledger entries are signed: `topup`,
`payment`, `creditBack`, `refund`; a refund can leave the balance negative.

## Error codes

`src/components/Pricing/payment-errors.ts` turns them into copy; only trust a payload after its `hasNumbers` check.

| Code  | Meaning                                                                                                                  | UI                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 40178 | Payment required. Publish: quote + `balanceCents` + `shortfallCents` (exact). Census growth: `dueCents` (an upper bound) | Admins get the checkout; others a toast. `isCensusGrowthQuote` tells them apart |
| 40177 | A payment session is already open (or branding/custom URL added after paying, on a draft save)                           | Resume or cancel the open payment                                               |
| 40175 | Managed org: integrator wallet short                                                                                     | Message with `requiredCents`/`availableCents` when present                      |
| 40183 | Managed org: spend cap reached                                                                                           | Message only                                                                    |
| 40176 | Quote required (above the self-service limit)                                                                            | Never ask to pay                                                                |
| 40174 | Integrator org cannot own a process                                                                                      | Message only                                                                    |
| 40181 | Managed org has no wallet                                                                                                | "Paid by the integrator"                                                        |
| 40004 | Price of a draft with no voters                                                                                          | `isUnpriceableDraft`: "shows up once saved with voters"                         |

## Flows

- **Price in the wizard.** The sidebar mounts `ProcessPriceBreakdown`; every draft save invalidates the price.
  `WalletCoverage` says whether the wallet covers it or how much is short. `ProcessQuoteAlert` warns about quotes; a
  quote-only draft cannot be published.
- **Publish.** Publish in `src/components/Process/Create/index.tsx` saves the draft and opens `PublishDialog`
  (`src/components/Process/Create/PublishReview/`): a summary of the vote and its cost, then a wallet step when the
  balance covers it or a card step for the shortfall, then the publishing, waiting and outcome states, all inside the
  dialog. The flow is the `useProcessCheckout` hook in `src/components/Pricing/ProcessCheckout.ts` (steps: summary,
  wallet, conflict, opening, checkout, publishing, waiting, published, unconfirmed, unpaid, timeout, error). Opening
  POSTs the checkout (a 400 means the wallet now covers it: publish from the wallet once); the card step
  (`CardStep.tsx`) is Stripe Checkout Elements (`BillingAddressElement`, `TaxIdElement`, `PaymentElement`) and pays the
  shortfall plus any extra the user tops up. From the card step on (its `opening` skeleton included), the dialog
  remounts non-modal and makes the wizard `inert`. It then waits up to 15 minutes for publication. Its look is the
  `publishReview` slot recipe. That feature-named recipe is the pattern DESIGN.md's "Patterns that have gone wrong
  before" flags: when changing the dialog's look, compose the shared pieces per the `ui-change` skill rather than
  extending `publishReview`.
- **Return from a redirect** (3D Secure, bank redirects). Stripe appends `/{sessionId}` to the return routes in
  `src/router/routes/index.ts` (wizard, billing settings, integrator billing, census checkout). The page reads its
  sessionStorage snapshot (`process-checkout-pending`, `wallet-topup-pending`, `census-checkout-pending`), resumes
  waiting and replaces the URL so a reload does not repeat it.
- **Wallet page** (`src/components/Wallet/Wallet.tsx`, admin settings and integrator configuration): balance, top-up for
  admins, negative-balance warning, paginated ledger. A top-up is confirmed only by a new `topup` entry of the requested
  amount (polls every 3 s for 2 minutes).
- **Top-up form** (`TopUp.tsx`): presets and a free amount (100 to 10,000,000 cents, at most 2 decimals), then Stripe.
- **Buying voter places** (`CensusCheckout.tsx`): adding or importing members to a published vote can be refused with
  a growth quote; `useBuyRoomAction` gives admins an "Add voter places" action to
  `/admin/process/:id/census/checkout`. The backend debits the room at once when the wallet covers it (empty
  `clientSecret`). On a shortfall the checkout is a wallet top-up of at least €1 (`amountCents` is the top-up, not the
  places): the card step says so and shows any surplus that stays in the wallet afterwards, computed from the live
  balance (`due` minus the balance) and never from the link's `shortfall`, which can be stale. A refusal with
  `shortfallCents` 0 says the wallet pays, with no card. After a card payment the wait looks for a new `payment` of the
  process; a new `topup` with no `payment` within 5 s triggers one more call to the endpoint (guarded by `recoveryRef`,
  once per mount). An empty `clientSecret` means the wallet bought the room, and an error keeps waiting for the ledger.
  A `clientSecret` (`short`) does not end the wait: this payment's own debit may still land, so a later `payment` gives
  `paid`, and only at the deadline is the "credited, still short" outcome shown. A `bought` recovery counts even after
  the view was left, and never a second card form. The sessionStorage snapshot
  holds `knownTopUpIds` next to `knownIds`; a snapshot without it, or a return without `censusSize`, means no recovery.
- **Refused member kept** (`src/components/Memberbase/Members/memberDraft.ts`): when the add-member form is refused for
  voter places and the user picks "Add voter places", the typed member is kept in memory only (never in storage or
  history), with its password as the hash that was sent. `CensusCheckout`'s `onBought` (bought outcomes only, never a
  timeout) marks it, and the members list's add form (`restoreDraft`) reopens it filled in and sends it once
  (`restoredRef`); otherwise it only reopens, and the user submits again. It is cleared on use, on cancel, on logout and
  on organization switch. A full-page redirect loses it. Import, add to group and add to census do not keep theirs.

## Tests

- Unit: `src/components/Pricing/*.test.ts(x)`, `src/components/Wallet/*.test.tsx`,
  `src/components/Memberbase/Members/memberDraft.test.ts`,
  `src/components/Process/Create/PublishReview/*.test.ts(x)` (the publish dialog, card and wallet steps, summary),
  `src/queries/{wallet,process-price,process-checkout,census-checkout}.test.ts`, `src/utils/numbers.test.ts`.
  `payment-errors.test.ts` checks every locale's `quote_required` copy states the 50,000 limit.
- e2e: `e2e/payg-checkout.e2e.ts` (a refused publish paid by card, then a €50 top-up) runs only in Stripe mode, when
  `INTEGRATION_STRIPE_SECRET_KEY` and `INTEGRATION_STRIPE_PUBLIC_KEY` point at a Stripe sandbox; otherwise it skips. The
  helpers refuse live keys and clean up their sessions. Sandbox requirements (tax origin, product tax code, API
  version) are in `integration/README.md` ("Stripe mode"); the spec and helpers in `e2e/README.md`.
- Stripe test cards: `4242 4242 4242 4242` succeeds; `4000 0027 6000 3184` asks for 3D Secure.

## Copy

Money copy follows `BRAND.md`: say the price before charging, say what the wallet covers and what is short, and say
that VAT is added at checkout. The words are "wallet", "top up", "voter places"; never "credits".
