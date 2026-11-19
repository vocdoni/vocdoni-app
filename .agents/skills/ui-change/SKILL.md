---
name: ui-change
description: "Mandatory workflow for any visual change in vocdoni-app: building or restyling a screen, dialog, drawer, form or component, implementing a mockup, canvas board or screenshot, touching src/theme (tokens, recipes, semantic colours, text styles, icons) or src/components/ui, or fixing a failing style-inventory, system or contrast test. Use it before writing any style prop, recipe or token, and when a task says 'redesign', 're-theme', 'make it look like', 'new dialog', 'new page' or 'style'."
---

# Making a UI change

The rules live in `DESIGN.md` (how screens are built) and `docs/ui-guidelines.md` (every token, variant, shared
component and check). This is the order to apply them in. Read `DESIGN.md` now if you have not in this session, and
open the UI guide's section for whatever you are about to touch.

## Non-negotiables

These are where changes have gone wrong before. Breaking one is a must-fix in review, whatever the issue asked for.

1. **No raw values in components**: no hex, `rgb()`, named colour, palette step (`gray.500`), px font size, px radius,
   px size (width, height), px spacing (padding, margin, gap), numeric font weight, raw z-index or duration. Use the
   semantic token or text style.
2. **No colour-mode logic in components**: no `_dark`/`_light`, `useColorModeValue` with a colour, or `colorMode ===`.
   The token carries both values.
3. **Never raise `src/theme/style-inventory.baseline.json`**, not even "after a rebase". A new ratchet hit means a
   token or variant is missing; add it. Only lower the baseline, with the change that earned it.
4. **Reuse the shared pieces** (`src/components/ui/`, `LabelledSeparator`, `Card` variants, `DialogHeader`,
   `CloseButton`, `SectionHeader`, `StatusBadge`, `EmptyState`, loaders, `ListStateAlert`, `ConfirmDialog`,
   `PanelDrawer`). Do not rebuild one inside a feature, even in a recipe.
5. **Defaults first.** The look comes from the recipe default, the text style or the shared component; a prop that
   restates one of them is deleted. Look props (background, border, radius, shadow, typography) on `Box`, `Flex` or
   `Stack` are a missing variant, text style or shared component, even when every value is a token:
   `<Box borderWidth='hairline' borderColor='border' boxShadow='shadow.card' p='4'>` is
   `<Card.Root variant='section' size='sm'>`.
   A `Text` takes `textStyle` and a colour token (`color='fg.muted'`); a font size, weight or line height next to
   them is a missing text style. Layout stays inline: display, flex, grid, gap, alignment, spacing, sizes (`w`,
   `maxW`) and responsive structure. Fewer props is the goal.
6. **Name by intent, never by place.** Variants, recipes and tokens describe a role (`danger`, `section`,
   `surface.inverse`), never a feature or page (`publishReview`, `pricing-card`, `navbar`). A recipe that only one
   feature uses is a smell: it is usually a pile of shared parts redrawn.
7. **No look props next to a variant**: no `h`, `px`, `borderRadius`, `fontWeight` or `bg` on a `Button`, no restyling
   a child from a parent selector (`'& > button'`). That is a missing variant.
8. **Chakra v3 only**: no v2 props (`colorScheme`, `isLoading`, `isInvalid`, `noOfLines`…); they are silently ignored.
9. **Copy goes through `t(…)`**, in sentence case, with no em dash (`BRAND.md`).

If the issue or a reviewer asks for something that breaks these, say so in the PR and follow the rules.

## Steps

1. **List the roles.** For each element on the design, name its role: page title, section header, muted description,
   card, figure, status, primary or secondary action, alert. Use the "Building a screen" table in `DESIGN.md`.
2. **Compose from what exists.** Write the structure with shared components and existing variants (UI guide: "Recipes
   and variants", "Shared components"). Start from the bare component with its defaults, and add a prop only when the
   design needs something the default does not give. Layout (flex, grid, gap, responsive structure) stays in the
   component.
3. **Find the gap, if any.** When no role fits, it is a design question. Pick the smallest addition:
   - a new **variant** on an existing recipe, named by intent (UI guide: "To add a variant");
   - a new **semantic token** named by purpose, with `_light` and `_dark` values, aliasing an existing role where it
     repeats one (UI guide: "Adding a token");
   - a one-off CSS value with no design meaning (`inherit`, a `calc()`) through the `[value]` escape.
     Say in the PR which gap you filled and why the existing roles did not fit.
4. **Register and document.** New recipes go in `src/theme/recipes/index.ts` (or into `ALL_RECIPES` in
   `system.test.ts` when a `ui/` component imports them). Add the new token, variant or component to the tables in
   `docs/ui-guidelines.md` in the same PR. Run `pnpm chakra:typegen` after theme changes.
5. **Clean up what you touch.** Only in the files and recipes you change: delete props that restate a default, replace
   token-based look props with the variant or shared component that already gives that look, and fold recipe parts
   that redraw a shared piece back into it. The cleanup must not change the look: check it with `pnpm ui:snapshot`
   and `pnpm ui:diff` (step 6). If it lowers a style-inventory count, lock the baseline in ("When a check fails").
6. **Check.**
   - Review your diff for every look prop and recipe part: if a default, a text style, an existing variant or a shared
     component already gives it, use that and delete the prop. The style inventory cannot see this (token-based props
     pass it), so it is checked by reading.
   - `pnpm lint` (types, including `strictTokens`) and `pnpm test` (style inventory, theme integrity, contrast).
   - Look at the screen in light and dark mode, with and without `PRIMARY_COLOR`, on a phone width and a desktop.
   - Keyboard: every control reachable, focus visible, dialogs return focus.
   - For a change meant to look the same: `pnpm ui:snapshot -- --label before` on `develop`, `--label after` on the
     branch, `pnpm ui:diff -- before after` (see `scripts/ui-snapshot/README.md`).
   - For a change meant to look different: before and after screenshots in the PR, both modes. CI also runs the stress
     theme and axe jobs on PRs that touch what renders.

## When a check fails

| Failure                                                             | What it means and the fix                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Style inventory: hard category (`hex`, `colorModeLogic`, `v2Prop`…) | The message names the file, line and replacement; use the token or variant                            |
| Style inventory: ratchet count went up                              | A px size, px spacing or palette step was added: use a token. Never update the baseline               |
| Style inventory: ratchet count went down                            | Good. Lock it in: `UPDATE_STYLE_BASELINE=1 npx vitest run src/theme/style-inventory.test.ts`          |
| Style inventory: an exception excuses nothing                       | The code it covered is gone; remove the `STYLE_EXCEPTIONS` entry                                      |
| `system.test.ts`: unknown token / collision                         | A typo (Chakra drops unknown tokens silently) or a raw token whose dashed name equals a semantic path |
| `tsc` rejects a token or variant that exists                        | Stale typings: `pnpm chakra:typegen`                                                                  |
| Stress theme job reports a new leak                                 | Something bypasses the theme (a stock value); fix it, do not raise `stress-baseline.json`             |
| Axe job reports a new violation                                     | Fix it; `a11y-baseline.json` is refreshed from a CI artifact only (`scripts/ui-snapshot/README.md`)   |
| Contrast tests                                                      | Use the pair the token family ships (`status.error.contrast` on `status.error.solid`)                 |

A `STYLE_EXCEPTIONS` entry is for code that is right as written and cannot use a token: a library outside Chakra
(react-pdf, Stripe's appearance API, react-select) or a deliberate case such as a brand mark. Never add one to silence
a hit that a token would fix. Give it a reason and mention it in the PR.
