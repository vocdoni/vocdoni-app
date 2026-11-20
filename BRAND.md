# Vocdoni app brand

Who the app speaks for, how it sounds, and how it uses the logo, colour and type. The brand itself (positioning,
palette, typefaces, logo geometry) is defined for every Vocdoni surface in vocdoni.io's
[`BRAND.md`](https://github.com/vocdoni/vocdoni.io/blob/main/BRAND.md); this file is how the app applies it, and where
the app differs. How screens are built is in [`DESIGN.md`](DESIGN.md); the token-level rules are in
[`docs/ui-guidelines.md`](docs/ui-guidelines.md).

## Name and products

- **Vocdoni** has a capital V in running text and is never translated, abbreviated or split. The logo wordmark is
  lowercase; text never imitates it.
- The product is the **Vocdoni app** (sentence case; older copy says "Vocdoni App"). Other names keep their exact form
  and are never translated: Vocdoni Petitions, Vocdoni Passport, Vocdoni SDK, Vocdoni Global, Vocdoni Association, the
  VOC token, the DAVINCI protocol.
- The app is white-labelled. A deployment can set its own accent (`PRIMARY_COLOR`) and show the organization's logo in
  process pages (`SHOW_ORG_LOGO`), and `d/<name>` branches are client deployments. Never write copy or styles that
  assume the Vocdoni look: the organizer's organization, not Vocdoni, is often the face the voter sees.

## Who we talk to

- **Organizers**: the admins of an association, union, cooperative or company who create votes, manage members and
  pay. They are not technical and are often running a vote for the first time.
- **Voters**: members who arrive from an email or a link, often on a phone, vote once and leave. They never chose
  Vocdoni and must not need to understand it.

## Voice

Calm, competent and plain, like a person who has run many elections, not a vendor.

- **Say what happens to the person**, not how the technology works: "Members vote from their phone and anyone can
  verify the result", not "zero-knowledge proofs on a blockchain".
- **Confident, not loud.** No hype words, superlatives or exclamation marks, except one in a success message.
- **Direct address.** "You" for the organizer, "your members"; the voter is "you" on the ballot.
- **Short.** A button says what it does (`Publish vote`, `Add members`), a heading names the thing, a description is one
  sentence. Errors say what went wrong and what to do next, never a code or a stack trace.
- **Honest about money and privacy.** Show the price before charging, say when something cannot be undone, and never
  call a vote anonymous when it is only private (see Terminology).

## Copy rules

Apply them to every new or edited string. Existing copy that breaks them is cleaned up with the change that touches it,
not in a sweep.

- **Sentence case everywhere**, headings, buttons, menu items and dialog titles included. Only the first word, proper
  nouns, acronyms (CSV, 2FA, GDPR) and "Vocdoni" take a capital. About 100 English strings are still in title case
  (`Cancel Vote`, `Account Information`); do not copy them.
- **No em dash** (`—`). Use a comma, a colon, parentheses or two sentences.
- **No hardcoded text.** Every user-facing string goes through `t(…)` and ships in every locale (see `AGENTS.md` and the
  `translations` skill).
- **Numbers, dates and money** follow the page's locale: `quantity()` and `currency()` from `src/utils/numbers.ts`, and
  dates through the i18next `format` and `duration` formatters set up in `src/i18n/index.ts` (date-fns with the
  locale). Never `toString()`, a hand-built `€` or a fixed date pattern in a component.
- US English spelling in the source strings ("organization", "color").

## Terminology

The source of truth for each language is its file in `src/i18n/contexts/`. In English:

| Use                     | For                                                                                   | Not                             |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| vote                    | What an organizer creates and members take part in (`New vote`, `Create new vote`)    | poll                            |
| process, voting process | The same thing where "vote" would be ambiguous (settings, results, the API)           |                                 |
| election                | Only in marketing copy about the kind of decision (board elections)                   | the thing the organizer creates |
| members                 | The people of an organization                                                         | users, contacts                 |
| census                  | The list of who can vote in one vote, taken from the members when the vote is created | voter roll, whitelist           |
| anonymous vote          | The mode where no record links a ballot to the voter who cast it                      | private, secret                 |
| private vote            | The default mode: the ballot carries a one-time code instead of a name                | anonymous, private ballot       |
| hidden until the end    | Results that stay hidden until the vote ends                                          | secret results, anonymous       |
| wallet                  | The organization's prepaid balance that pays for votes                                | credits, crypto wallet          |

Anonymity (who voted what) and ballot secrecy (what a ballot says) are different promises: the locale contexts explain
the distinction, and copy must never blur them.

## Logo

- `VocdoniLogo` (`src/components/Layout/Logo.tsx`) is the only Vocdoni logo in the UI: the current mark (the ballot
  leans right) and wordmark as an inline SVG painted with `currentColor` on the `logo.fg` token. `minimal` draws the
  mark alone, for tight spaces. Its geometry matches vocdoni.io's `components/Logo.tsx`; never edit the paths.
- One colour only, from the theme: never the accent, never two colours, never a dark-mode `invert` filter or a PNG.
  The PDF report is the only exception (react-pdf cannot render the component), and uses the PNGs in `public/assets/`.
- With `SHOW_ORG_LOGO` the organization's logo replaces Vocdoni's in process pages; the footer keeps Vocdoni's.
- Partner and client logos are shown as the organization uploaded them, on the light tile in dark mode.

## Colour and type

The app does **not** use the website's palette yet. vocdoni.io is cream, warm ink, Vocdoni green and a Fraunces serif;
the app today is a neutral theme: white and near-black surfaces, a black accent unless `PRIMARY_COLOR` sets one, the
status palettes (success, warning, danger, info) for state, and Inter at weights 300, 400 and 500. A re-theme towards
the brand is planned (#1728) and will land in `src/theme/`, not in components.

So, until then:

- Do not bring website colours, fonts or radii into the app (no Vocdoni green, cream, signal yellow or Fraunces), and do
  not copy them from a mockup. A mockup's look is mapped onto the app's existing roles (see `DESIGN.md`).
- Colour carries meaning: the accent marks the primary action and the current place; status colours mark status;
  everything else is neutral. Brand-coloured text reads `accent.fg`.
- Third-party marks (Google, GitHub, WhatsApp, Stripe) keep their own colours and are not restyled.

## Imagery

- Show the real product: real states (a census, a vote in progress, verified results), not abstract illustration.
  Drawn product screens must match what the app actually displays.
- Drawn illustrations paint with the `illustration.*` tokens, never raw colours. The raster empty-state artwork is the
  one documented exception: `EmptyState` gives it a dark-mode `invert` filter (see the UI guide's allowed exceptions).
- The localized Open Graph cards in `public/assets/og/` are rendered by `pnpm og:generate` from locale copy; never
  edit the PNGs by hand.
