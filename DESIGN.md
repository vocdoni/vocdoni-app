# Vocdoni app design

How screens in the app are put together, and how a new design (an issue, a mockup, a redesign canvas) turns into code.
Who the app speaks for and how it sounds is in [`BRAND.md`](BRAND.md). The token-level reference (every token, recipe
variant and shared component, the allowed exceptions and the checks) is [`docs/ui-guidelines.md`](docs/ui-guidelines.md):
read it before writing a style, and use the `ui-change` skill for the step-by-step.

## Principles

1. **The theme decides how things look.** A component picks a role (a semantic token, a text style, a recipe variant, a
   shared component) and never carries a raw value or branches on the colour mode. A redesign, `PRIMARY_COLOR` and dark
   mode all work because of this, and the checks in `src/theme/` enforce most of it.
2. **Reuse before you build.** The screen you need is almost always made of pieces that exist: a page container, a page
   title, section headers, cards, a drawer, a confirmation, a status badge, an empty state. Building a second version of
   one of them, even "just for this feature", is the most common way a change goes wrong.
3. **Defaults first.** A shared piece or recipe variant already looks right: use it bare, and add a prop only for
   what it does not give. Look props on a `Box`, `Flex` or `Stack`, even with tokens, mean a variant or shared
   component is missing or being ignored. Less styling code is better.
4. **One meaning, one look.** Two things that mean the same (a section title, a destructive action, an error) look the
   same everywhere. A new look for an existing meaning is a design decision for the team, not something a PR introduces
   on the side.
5. **Phone first for voters, desk first for organizers.** Public process pages are mostly opened from an email on a
   phone. The dashboard is mostly used on a laptop, but must still work on a phone.
6. **Accessible by default.** Every control is reachable and usable with a keyboard, labelled, and readable in both
   colour modes. Contrast is tested (`textContrast.test.ts`, `palette.test.ts`) and an axe report runs in CI.
7. **Honest states.** Every screen that loads data has a loading, empty and error state, and anything that costs money
   or cannot be undone says so before it happens.

## The app's surfaces

| Surface               | Who            | Rendering                            | Shell                                                                 |
| --------------------- | -------------- | ------------------------------------ | --------------------------------------------------------------------- |
| Process and org pages | Voters, public | Vike SSR (`src/pages/`)              | `PublicLayout`; the ballot is themed in `src/theme/react-components/` |
| Sign-in, sign-up, 2FA | Organizers     | SPA (`src/router/`, `src/elements/`) | `LayoutAuth`                                                          |
| Dashboard             | Organizers     | SPA                                  | `LayoutDashboard` / `DashboardShell`                                  |
| Integrator console    | API customers  | SPA                                  | `LayoutIntegratorsAuth`, `LayoutIntegrators`                          |

Public pages are SSR so they render without JavaScript and have proper metadata: no colour-mode logic in components
(it would flash), no data fetched only on the client that the page needs for its first paint.

## Building a screen

Use the piece that already exists for each job. The full list, with props, is in the UI guide's "Shared components".

| You need                                       | Use                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| A page column                                  | `PageContainer` (`size` `wide`, `medium`, `narrow`) or `PageSection`         |
| The page heading                               | `PageTitle` (the one `h1`) and `PageSubtitle`                                |
| The title of a card, section or settings block | `SectionHeader` (`title`, `description`, `actions`)                          |
| A boxed group                                  | `Card` with a variant (`section`, `outline`, `sunken`, `highlight`…)         |
| A labelled figure or usage                     | the `stat` recipe, `UsageMeter`                                              |
| Tabs that change the URL                       | `RoutedTabs`                                                                 |
| A status                                       | `StatusBadge` with `colorPalette`                                            |
| Nothing to show / loading / failed             | `EmptyState`, `PageLoader` / `ListLoader` / `InlineLoader`, `ListStateAlert` |
| A table on a phone                             | `useTableAsCards` and the card layout of the existing tables                 |
| An icon                                        | a concept from `~theme/icons`, never an icon pack                            |
| The Vocdoni logo                               | `VocdoniLogo`                                                                |

### Choosing a container for a task

- **Page**: the task is a place the user navigates to and may bookmark or share (a process, the members list,
  settings). Long multi-step work (creating a vote) is a page.
- **Side panel** (`PanelDrawer`): editing or adding one thing while keeping the list behind it in view (add a group,
  edit a member). Its actions are pinned in its `footer`.
- **Dialog** (`Dialog` with `DialogHeader`, or `ModalForm` for a short form): a short, focused step that has to finish
  or be dismissed before going on. Centred, never re-placed. A dialog is not a page: if it needs its own scrolling
  layout, sticky header and footer and several steps, question whether it should be one, and if it must, build it from
  the dialog recipe and shared parts, not from a new look.
- **Confirmation** (`ConfirmDialog`): before anything destructive, irreversible or paid. It names the consequence in
  the title and on the button ("End vote", not "OK"); destructive is its default.
- **Toast** (`useToast` from `~components/Toast`): the outcome of an action the user just took, success or failure.
  Not for errors that block a form (show those on the field or in an `Alert` in place) and not for anything the user
  must read later.
- **Inline alert** (`Alert` with `layout`): a condition of the page or form (a warning, a plan limit, an announcement).

### Forms

- Chakra's `Field` anatomy through the existing `FormControl` aliases; react-hook-form for state; validation messages
  through `t(…)`. One primary submit per form, at the end, in the button recipe's default look.
- Labels are visible (no placeholder-only fields), errors sit under their field and say how to fix it.
- Destructive or paid submissions go through a confirmation; long forms save drafts rather than losing input.

### Responsive

- Breakpoints are Chakra's; "mobile" is below `md` (`useIsMobile`). Responsive values go in the style prop
  (`{ base: …, md: … }`), not in JavaScript branches, unless the structure itself changes.
- Section actions drop under the title below `md` (`SectionHeader` does it for you); tables turn into cards.
- Nothing scrolls sideways on a phone except a deliberate horizontal list.

### Accessibility

- Every interactive element is a real `button`, `a` or form control, with an accessible name (`aria-label` through
  `t(…)` for icon-only controls; `CloseButton` ships one).
- Focus is visible (the theme's focus ring), dialogs and drawers trap and return focus, and keyboard order follows the
  visual order. The exception is the publish dialog (`PublishDialog`): from its card step on it is non-modal and makes
  the wizard `inert`, because the focus trap and pointer blocking break Stripe's 3D Secure window, which opens outside
  the dialog (see the `payg-billing` skill).
- Colour is never the only signal: a status has a label, an error has text.
- Run the axe report (`pnpm ui:snapshot -- --label a11y --a11y`) for visual changes; CI runs it on PRs that touch
  what renders.

## From a design to code

A mockup, a canvas board or an issue screenshot shows what the screen must say and do. It does not decide the tokens:
the app's theme does, and the redesign will change the theme, not components.

1. **Read it as roles.** For each element ask what it is (a page title, a section header, a muted description, a card,
   a status, a primary action), not what size or colour it has. Write the structure from shared components and
   existing recipe variants.
2. **Map, do not copy, values.** A mockup's 18px heading is the `section-title` role, its grey text is `fg.muted`, its
   green button is the default button (the accent comes from `PRIMARY_COLOR`). Mockups drawn in the website's palette
   (cream, green, a serif) still use the app's roles today; see `BRAND.md`.
3. **When nothing fits, stop and name the gap.** A look the theme lacks is a design question: say so in the issue or
   PR and propose the smallest addition (a variant named by intent on an existing recipe, or a semantic token named by
   purpose), then add it to the theme first and document it in `docs/ui-guidelines.md`. Never a raw value, and never a
   recipe, variant or token named after the feature or the page (`publishReview`, `pricing-card`).
4. **Keep layout in the component, look in the theme.** Flex, grid, gap and responsive structure belong with the
   component; colour, type, radius, borders and shadows belong to tokens and recipes. A look prop on a `Box`, `Flex` or
   `Stack` is a sign the right variant or component was not used.
5. **Check it like the rest.** `pnpm lint` and `pnpm test` (style inventory, theme integrity, contrast), both colour
   modes, with and without `PRIMARY_COLOR`, and before and after screenshots in the PR.

### Patterns that have gone wrong before

- A feature-specific slot recipe with dozens of parts that re-implements the dialog header, close button, section
  titles, alerts and skeletons, plus tokens named after the feature (#2012). Compose the shared pieces instead, and
  add an intent-named variant only where they really fall short.
- Raising `style-inventory.baseline.json` to make a failing check pass. The baseline only goes down; a new hit means
  the code is missing a token or variant.
- An issue that prescribes an implementation that breaks these rules ("put all styles in one recipe"). The rules win;
  point it out in the PR.
- A `_dark` block, a `useColorModeValue` colour or a hex in a component "just for this case": add the semantic token.
- A `Box` or `Flex` carrying background, border, radius, shadow and padding tokens to imitate a `Card`, a
  `SectionHeader` or an alert. Every value was a token, so every check passed; the fix was to delete the props and use
  the existing piece.
