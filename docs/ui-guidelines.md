# UI guidelines

How to style the app so it stays themable. Everything here is enforced by a test, the type checker or CI unless it says
otherwise; where a rule is enforced, the file is named so you can read the real thing.

## The rule

A component never decides how it looks. It picks a role (a token, a text style, a recipe variant, a shared component)
and the theme decides what that role looks like. If the look you need does not exist, add it to the theme first, then
use it.

The payoff: `PRIMARY_COLOR` recolours the accent, dark mode flips from CSS (no flash on SSR pages), and a redesign
touches `src/theme/` instead of hundreds of components.

## Where things live

| What                                                         | Where                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Raw scales (radii, sizes, border widths, z-index, weights)   | `src/theme/tokens.ts`, `src/theme/colors.ts`, `src/theme/fonts.ts`           |
| Meaning of colours (surfaces, text, borders, light and dark) | `src/theme/semantic.ts` and one module per family (below)                    |
| Brand colour and `accent` (generated from `PRIMARY_COLOR`)   | `src/theme/palette.ts`, assembled in `src/theme/system.ts`                   |
| Text roles                                                   | `src/theme/textStyles.ts`                                                    |
| How a component looks and its variants                       | `src/theme/recipes/*.ts`, registered in `recipes/index.ts`                   |
| Voting UI from `@vocdoni/react-components`                   | `src/theme/react-components/*` and `src/theme/recipes/election.ts`           |
| Shared building blocks                                       | `src/components/ui/`                                                         |
| Shared layout pieces                                         | `src/components/Layout/Separators.tsx` (`LabelledSeparator`)                 |
| Icons, by concept                                            | `src/theme/icons.tsx`                                                        |
| The rules that keep the theme from being bypassed            | `src/theme/style-inventory.ts` and `src/theme/style-inventory.baseline.json` |

Import theme modules with the `~theme/*` alias and shared components with `~components/ui/*`.

## Colour

Use semantic tokens. Never a hex, `rgb()`, a CSS colour name (`white`, `black`) or a palette step (`gray.500`) in a
component. The inventory test rejects hex and named colours outright; raw palette steps are on a downward ratchet (see
[The checks](#the-checks)).

```tsx
<Box bg='surface.card' borderColor='border' color='fg.muted' />
```

Token families, each in its own module under `src/theme/` and spread into `colors` in `semantic.ts`:

| Family                           | Tokens                                                                                                                                                                      | Module            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Page text and fills              | `fg`, `fg.muted`, `fg.subtle`, `fg.inverted`, `fg.error`, `bg`, `bg.subtle`, `bg.muted`, `bg.emphasized`, `bg.inverted`, `bg.panel`                                         | `semantic.ts`     |
| Borders                          | `border`, `border.muted`, `border.subtle`, `border.emphasized`, `border.inverted`                                                                                           | `semantic.ts`     |
| Surface layers                   | `surface.canvas`, `.sidebar`, `.content`, `.card`, `.sunken`, `.raised` (`.tooltip`), `.overlay` (`.drawer`), `.inset`, `.inverse` (`.border`, `.rule`, `.fg`, `.fg.muted`) | `semantic.ts`     |
| Brand accent (follows the brand) | `accent.fg`, `accent.solid`, `accent.contrast`                                                                                                                              | `palette.ts`      |
| Dimming layer                    | `scrim`, `scrim.strong` (dialog and drawer backdrops), `scrim.fg`                                                                                                           | `semantic.ts`     |
| Rules and vertical accents       | `separator`, `verticals.generic.900`, `verticals.professional.900`                                                                                                          | `semantic.ts`     |
| Interaction states (bg/fg pairs) | `state.hover`, `state.pressed`, `state.selected`, `state.current`, `state.dragover.border`                                                                                  | `states.ts`       |
| Status                           | `status.{success,warning,error,info,neutral}.{fg,bg,border,solid,contrast}` (`emphasis` on the four tones), `destructive.{fg,solid,contrast}`                               | `status.ts`       |
| Charts and meters                | `chart.1` to `chart.8` (`.icon` is the glyph), `chart.track`, `meter.{ok,warning,critical}` (the info, warning and error `solid`)                                           | `charts.ts`       |
| Public ballot                    | `ballot.choice.{border,ring,bg}`, `ballot.results.track`, `ballot.schedule`, `ballot.error`, `ballot.balance.{success,warning,error}`                                       | `ballot.ts`       |
| Artwork and logos                | `illustration.fg`, `illustration.contrast`, `logo.fg`                                                                                                                       | `illustration.ts` |
| Links                            | `link.fg`, `link.fg.hover`, `link.tile.hover.bg`                                                                                                                            | `recipeColors.ts` |
| Shadows                          | `shadow.card`, `shadow.raised` (`.popover`, `.tooltip`), `shadow.floating` (`.panel`), `shadow.overlay`                                                                     | `semantic.ts`     |

Rules of thumb:

- **Accent**: leave `colorPalette` alone (it is `brand` when `PRIMARY_COLOR` is set, `gray` otherwise) and read
  `colorPalette.solid`, `colorPalette.fg` and so on. Use `colorPalette='gray'` only for things that must stay neutral.
  When a recipe or component paints the brand itself (active tab, featured plan, highlighted notice), read `accent.fg`,
  `accent.solid` and `accent.contrast`, not `brand.*`: they are the brand's slots, except on the dark page for the stock
  black brand, which would be unreadable there and gets white.
- **Status colour**: never a local status-to-colour map. Chips use `StatusBadge`; props that need a palette name read
  `statusPalette[tone]` from `~theme/status`.
- **Dark mode**: a token has a `_light` and a `_dark` value in the theme. Components do not branch on the mode:
  `useColorModeValue`, `colorMode ===` and `_dark={{ … }}` in a component are `colorModeLogic` and fail the inventory
  (they also flash the light value on SSR pages before hydration). The one allowed `_dark` is an image filter, listed in
  the exceptions.
- **Text on a coloured fill**: use the pair the token family ships (`status.error.contrast` on `status.error.solid`,
  `surface.inverse.fg` on `surface.inverse`, `accent.contrast` on `accent.solid`), not an ad hoc black or white.
  `textContrast.test.ts` and `palette.test.ts` check contrast.
- **A token that repeats another role**: alias it (`state.current.bg` is `{colors.bg.emphasized}`, `meter.ok` is
  `{colors.status.info.solid}`) instead of copying the raw steps, so the two cannot drift.

## Text

Typography is a role, not three props.

```tsx
<Text textStyle='caption' color='fg.muted'>
  …
</Text>
```

App roles (`src/theme/textStyles.ts`): `body`, `body-sm`, `caption`, `eyebrow`, `page-title`, `section-title`, `display`.
Chakra's own `2xs` to `7xl` and `label` keep their names. Rules:

- A role holds typography only. Colour stays a separate prop. Do not pass a `textStyle` and a prop that sets the same
  property: they resolve in prop order.
- The page has one `h1`: `PageTitle` from `~components/ui/PageTitle` (`PageSubtitle` is the line under it). Section
  titles use `textStyle='section-title'` on an `h2`.
- Body copy needs no `textStyle`: `body` in `globalCss` (`system.ts`) gives it the `body` role (1rem, line height
  `moderate`), so a bare `Text`, markdown or a list item inherits that. The `text` recipe has no default size, so set
  `textStyle` or `size` on any `Text` that should be something else, and inside a smaller parent (nested text ignores
  the parent's size). For inline emphasis inside smaller text, use `chakra.span` or `Span`.
- Line heights are four tokens: `shorter` (1.2), `short` (1.3), `moderate` (1.5), `tall` (1.6). Letter spacing:
  `heading.snug`, `quote.tight`, `eyebrow.wide`, plus Chakra's own steps.
- Weights: only 300, 400 and 500 ship (`src/theme/fonts.ts`). `normal` and `medium` render 400; `semibold`, `bold` and
  `extrabold` render 500. Numeric weights fail the inventory (`numericFontWeight`). A weight with no file behind it makes
  the browser fake it, and `fonts.test.ts` keeps the CSS imports and the list in step.
- Markdown headings written by users use `proseHeadingSizes`, shared by the editor and the renderer.

## Sizes, spacing and radii

- **Spacing**: scale steps (`p='4'`, `gap='2'`). A pixel value is a `pxSpacing` ratchet hit.
- **Radii**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`, `none`. Pixel radii fail the inventory.
- **Border widths**: `hairline` (1px), `thick` (2px) and `focusRing` (the width of a hand-drawn outline or box-shadow
  focus ring, `thick`): `<Box borderWidth='thick' />`.
- **Icon sizes**: `icon.sm` (1rem, inline), `icon.md` (1.25rem, control), `icon.lg` (1.5rem, feature), `icon.xl` (3rem,
  empty state): `<Icon as={ErrorIcon} boxSize='icon.xl' />`. They alias the size scale (`{sizes.4}`, `5`, `6`, `12`),
  so `boxSize='icon.md'` and `<Icon size='md'>` cannot drift apart.
- **Page widths**: `content.wide` (1600px), `content.medium` (1200px), `content.narrow` (900px), read through
  `PageContainer` (below).
- **Other named sizes**: `card.empty`, `table.action`, `toolbar`, `control.floating` (support chat launcher),
  `control.icon-link` (square icon link), `loader` (min height of `PageLoader`), `wordmark` (width of the Vocdoni
  wordmark: `<Image maxWidth='wordmark' />`), `dashboard.menu.expanded|collapsed`, `dashboard.header`,
  `dashboard.panel`, `voting.sidebar`, `user-profile`, `cookies-consent`.
- **z-index**: tokens only (`background`, `contents`, `sidebar`, `topbar`, `top`, `public-header`, `dashboard-menu`).
- **Opacity**: `inactive` (0.6) for content that cannot be used right now, `dimmed` (0.5) for de-emphasis.
- **Durations**: Chakra's names plus `instant` (0s).

A one-off size with no token is a design question: ask whether it should become one. If it really is a one-off, use the
escape below and expect the inventory to count it.

## Recipes and variants

Variants are named by intent, never by page or place (`navbar`, `pricing-card`). Before adding one, check that the recipe
has no variant that already means the same thing; two looks for one meaning is a design question.

```tsx
<Button variant='danger'>…</Button>
<Card.Root variant='section' size='sm'>…</Card.Root>
<Alert status='warning' layout='compact'>…</Alert>
```

What exists today:

| Recipe            | Variants and axes                                                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`          | `variant`: `link`, `link-underline`, `text`, `text-link`, `nav-item`, `menu-item`, `menu-item-strong`, `menu-trigger`, `segment`, `toggle`, `disclosure`, `danger`, `floating`, `whatsapp`; `size`: `cta`; `multiline`. Chakra's own `solid`, `outline`, `ghost`… stay |
| `card`            | `outline`, `section`, `frame`, `sunken`, `inverse`, `highlight`, `list-item`, `standalone`, `dropzone`, `plan`, `featured`, `logo-tile`, `divided`, `plain`                                                                                                            |
| `alert`           | `layout`: `inline` (default), `banner`, `compact`, `panel`; Chakra's `status` stays                                                                                                                                                                                    |
| `link`            | `variant`: `plain`, `unstyled`, `icon-button`, `subtle`, `tile`; `size`, `emphasis`, `tone` (`muted`, `quiet`)                                                                                                                                                         |
| `tabs`            | `variant`: `pill`                                                                                                                                                                                                                                                      |
| `drawer`          | `variant`: `navigation`, `panel` (dialog and drawer backdrops both paint `scrim.strong`)                                                                                                                                                                               |
| `emptyState`      | `size`: `sm`, `md`, `lg`                                                                                                                                                                                                                                               |
| `text`, `heading` | `text`: `size`, `variant='muted'`; `heading`: `heavy`, `section`, `subsection`                                                                                                                                                                                         |
| `badge`, `tag`    | Badge `size` (`xs` to `lg`); Tag has one look, use `StatusBadge`                                                                                                                                                                                                       |

To add a variant:

1. Add it to the recipe in `src/theme/recipes/`, built only from tokens (a recipe may use `[value]` for `0`, `auto` and
   the like). `system.test.ts` fails on any token name that does not exist, and the inventory counts pixel sizes,
   pixel spacing and palette steps in recipes too (see [Style inventory](#style-inventory)): a size that repeats
   becomes a token, as `control.floating` and `wordmark` did.
2. Register a new recipe in `src/theme/recipes/index.ts`.
3. Use it at the call site with `variant`, `size` or `layout`, with no extra look props next to it.
4. A custom state is a `data-*` attribute styled by the recipe (see `_dragging` in `recipes/dragHandle.ts` and
   `ui/DragHandle.tsx`), not a ternary on style props in the component.

Do not restyle a component from a parent selector (`'& > button'`), and do not put `h`, `px`, `borderRadius`,
`fontWeight` or `bg` on a `Button`: that is a missing variant.

Chakra v2 props (`colorScheme`, `noOfLines`, `isInvalid`, `isLoading`…) are silently ignored by v3. They are the `v2Prop`
category and fail the inventory. Forms use Chakra's `Field` anatomy through the existing `FormControl` aliases; do not
write a custom field wrapper.

## Shared components

All in `src/components/ui/`. Use them instead of rebuilding the pattern.

| Component                                  | Use it for                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageContainer`, `PageSection`             | A page column: `size` (`wide`, `medium`, `narrow`) and `gutter`. `PageSection` is the same without gutters                                  |
| `PageTitle`, `PageSubtitle`                | The page's one `h1` and the line under it                                                                                                   |
| `PageHeader`                               | Title and subtitle with the page's own actions on the right (`PageTitle.tsx`): `title`, `subtitle`, `actions`                               |
| `RoutedTabs`                               | Tabs that are child routes: `tabs` (`{ label, route, count? }`), optional `value`, `outletContext`; renders the `Outlet`                    |
| `ListStateAlert`                           | A list or block that failed to load: `error`, `title`, `fallback` (for a non-`Error`), `show`. Use it instead of a hand-built error `Alert` |
| `Tooltip`                                  | Every tooltip: `content`, `showArrow`, `contentProps`, `portalled` (off inside another portal). No raw `Tooltip.Root`                       |
| `useIsMobile`, `useTableAsCards`           | The mobile breakpoint (below `md`) as a boolean; the second is the same hook, named for tables shown as cards                               |
| `ConfirmDialog` (`ConfirmDialogContent`)   | Every confirmation. `layout`: `panel`, `inline`, `compact`, `shell`, `summary`; `destructive` is on by default                              |
| `StatusBadge`                              | A status chip: `tone` (`success`, `warning`, `error`, `info`, `neutral`), `variant` (`subtle`, `surface`, `solid`)                          |
| `PageLoader`, `ListLoader`, `InlineLoader` | A page with nothing yet, a list or block that is fetching, a wait inside a control                                                          |
| `EmptyState`                               | Nothing to show. `size` `sm` (table row), `md` (inside a card), `lg` (instead of a whole list); `icon` or `image`                           |
| `CloseButton`                              | A close control with a translated `aria-label`                                                                                              |
| `DragHandle`                               | The grip of a sortable item: `placement` `start`, `center` or `corner`, and `dragging`                                                      |

Not in `ui/`: `LabelledSeparator` (`~components/Layout/Separators`), a hairline on each side of a short label, such as
`OrSeparator`'s "or continue with". Do not build one from a `Flex` and two `Box`es.

```tsx
import { PageSection } from '~components/ui/PageContainer'
import { StatusBadge } from '~components/ui/StatusBadge'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { RoutedTabs } from '~components/ui/RoutedTabs'
import { ListStateAlert } from '~components/ui/ListStateAlert'

<PageSection size='medium'>
  <StatusBadge tone='success'>{t('status.ongoing')}</StatusBadge>
</PageSection>

<RoutedTabs tabs={[{ label: t('members'), route: 'members', count: total }, { label: t('groups'), route: 'groups' }]} />
<ListStateAlert error={error} title={t('could_not_load')} fallback={t('try_again')} />

<ConfirmDialog layout='inline' open={open} title={title} onConfirm={revoke} loading={isPending} />
```

New user-facing text in any of these goes through `t(…)`, like everywhere else (see `AGENTS.md`).

### Icons

Import the concept, never an icon pack. `icons.test.ts` fails on a `react-icons` import outside `src/theme/icons.tsx`, and
on one glyph exported under two concept names.

```tsx
import { DeleteIcon, ErrorIcon } from '~theme/icons'

;<Icon as={DeleteIcon} boxSize='icon.sm' />
```

Names are by meaning (`AddIcon`, `CloseIcon`, `SuccessIcon`, `WarningIcon`, `OrganizationIcon`…), so a glyph changes in
one place. To add one, import the Lucide glyph in `src/theme/icons.tsx` and export it under a concept name in the right
group. Third-party brand marks (Google, GitHub, Discord, X, WhatsApp) are the only ones that keep another pack. SVGs use
`currentColor`.

## Allowed exceptions

The exceptions are `STYLE_EXCEPTIONS` in `src/theme/style-inventory.ts`; each has a `glob`, the `categories` it excuses,
an optional `match` on the source text, and a `reason`. Today:

- **PDF report** (`VotingReportPdf`): react-pdf renders outside Chakra, so raw values are the only option.
- **Stripe Elements** (`SubscriptionPayment.tsx`): its appearance API takes raw CSS colours and its own light and dark
  themes.
- **react-select** (`SaasSelector.tsx`, `CensusSearch.tsx`, and the `isLoading`/`isInvalid` props of its wrapper): the
  menu portal needs a raw `zIndex` above Chakra modals.
- **The colour-mode implementation** (`src/theme/color-mode.tsx`).
- **White logo tiles** (`Layout/Logo.tsx`, `auth.logo.tile`): organisation logos are dark artwork on transparent
  backgrounds. Image filters that invert dark artwork (`Footer.tsx`, `Logo.tsx`, `ui/EmptyState.tsx`) are allowed for
  the same reason.
- **The typing indicator bounce** (`SupportChat/Messages.tsx`, `dotBounce`).

Recipes are scanned, but only for `pxSize`, `pxSpacing`, `pxFontSize`, `pxRadius` and `rawPalette`
(`RECIPE_CATEGORIES`): a recipe may use `_dark`, `white`/`black` and its own line heights. Not scanned at all: the theme
definition files (they are checked by `system.test.ts`), tests and `src/theme/test-themes/`.
`src/theme/logoTones.ts` holds committed per-logo panel colours on purpose; regenerate it with
`scripts/logo-tones.mjs` and review each value on screen. Third-party brand colours (the WhatsApp green is the
`whatsapp.*` token) stay as the brand defines them.

To add an exception, add an entry with a reason. The test fails on an entry that excuses nothing, so remove it when the
code goes.

## Adding a token

1. **Decide if it is a meaning or a scale step.** A meaning (a surface, a text role, a status) is a semantic token with
   a `_light` and a `_dark` value that point at raw steps. Add a raw step in `colors.ts` or `tokens.ts` only when the
   scale lacks the value.
2. **Name it by purpose** (`surface.inverse`), never by look (`darkGray`) or mode (`menu.dark`).
3. **Give every parent a `DEFAULT`** when it also has children (`surface.raised.DEFAULT` next to
   `surface.raised.tooltip`, `link.fg.DEFAULT` next to `link.fg.hover`).
4. **Put a new family in its own module** and spread it with one line in `semantic.ts`, as `status.ts`, `charts.ts` and
   `states.ts` do:

   ```ts
   // src/theme/example.ts
   import { defineSemanticTokens } from '@chakra-ui/react'

   export const exampleColors = defineSemanticTokens.colors({
     example: {
       DEFAULT: { value: { _light: '{colors.gray.100}', _dark: '{colors.ink.800}' } },
       strong: { value: { _light: '{colors.gray.200}', _dark: '{colors.gray.800}' } },
     },
   })

   // src/theme/semantic.ts, in the `colors` object
   ...exampleColors,
   ```

   A raw, non-colour token goes in `tokens.ts`: define it with `defineTokens.<category>({ … })` and add the category to
   the `defineTokens({ … })` call at the bottom. The existing token modules are listed in `EXCLUDED_FILES` in
   `style-inventory.ts` so the scanner skips them; add a new one there too.

5. **Mind the collision.** A raw token whose dashed name equals a nested semantic path (a raw `elevation-rest` next to a
   semantic `elevation.rest`) shares a CSS variable with it and white-screens the app at runtime. The "token names" test
   in `system.test.ts` fails on it, in the stock and a branded system. Parents with a `DEFAULT` and raw names without
   the dashed form of a semantic path avoid it.
6. **Regenerate the typings** with `pnpm chakra:typegen` (nothing to commit: the output lives in `node_modules`), then
   check a page in both colour modes, with and without `PRIMARY_COLOR`. If `tsc` complains about a recipe variant or
   token that exists, the generated typings are stale: run typegen again.

Chakra v3 drops unknown token names without an error, so a typo renders as "inherit". That is why `unknownToken` is a
hard category in the inventory and why `system.test.ts` checks every recipe and every `{token.ref}` in the semantic
tokens.

## strictTokens and the `[value]` escape

`createAppSystem` in `src/theme/system.ts` sets `strictTokens: true`: style props accept only theme tokens, and `tsc`
rejects the rest. The way out for a value that is not a design decision (`0`, `auto`, `inherit`, `none`, a `calc()`) is
to wrap it in brackets:

```tsx
<Box p='[0]' mx='[auto]' w='[calc(100% - {sizes.8})]' />
```

Chakra 3.x types `[value]` but never unwraps it, so it would emit the invalid `padding: [0]`. `src/theme/escapeHatch.ts`
(`withEscapeHatch`, applied to the system at the end of `createAppSystem`) unwraps it and still expands token references
inside, as the third prop above shows. `system.test.ts` ("escape hatch") pins both behaviours; check that test before
touching the wrapper or upgrading Chakra.

`[12px]` is still a pixel size or spacing to the inventory: the escape is not a way around the ratchet.

## The checks

| Check                                                 | Command                                             | In CI                                |
| ----------------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| Types, including `strictTokens`                       | `pnpm lint`                                         | `Lint` (PRs to `develop`, `stage`)   |
| Theme integrity (real tokens, no shared CSS variable) | `pnpm test src/theme/system.test.ts`                | `Test`                               |
| Style inventory                                       | `pnpm test src/theme/style-inventory.test.ts`       | `Test`                               |
| Stress theme                                          | `pnpm ui:snapshot -- --label stress --theme stress` | `Stress theme` (PRs touching `src/`) |
| Offline snapshot and diff                             | `pnpm ui:snapshot`, `pnpm ui:diff`                  | not run                              |

### Style inventory

`src/theme/style-inventory.ts` scans the literals in style positions (style props, `css`, condition and recipe objects,
Chakra-typed objects, react-select configs). Strings elsewhere (i18n keys, data, URLs) never count. Each occurrence has a
category:

- **Hard rules, at zero; any new occurrence fails**: `hex`, `namedColor`, `unknownToken`, `pxFontSize`, `pxRadius`,
  `rawLineHeight`, `rawLetterSpacing`, `numericFontWeight`, `rawZIndex`, `rawDuration`, `colorModeLogic`,
  `deprecatedAlias`, `v2Prop`. The baseline cannot hold them. The failure names the file, the line and what to use
  instead.
- **Ratchet, may only go down per file**: the categories in `RATCHET_CATEGORIES` (today `pxSize`, `pxSpacing`,
  `rawPalette`), counted per file in `src/theme/style-inventory.baseline.json`. A new occurrence fails. A removed one
  also fails until you lock the progress in:

  ```bash
  UPDATE_STYLE_BASELINE=1 npx vitest run src/theme/style-inventory.test.ts
  ```

  Commit the lowered baseline with the change that earned it. When a ratchet category reaches zero the test tells you to
  move it out of `RATCHET_CATEGORIES`, and from then on it is a hard rule. Never raise the baseline; if the code is
  right, add a real exception.

`RATCHET_CATEGORIES` is the truth for what is still on the ratchet; this list may lag behind it.

### Stress theme

`src/theme/test-themes/stress.ts` keeps the app's tokens and recipes and moves every value they resolve to: each semantic
colour gets its own saturated colour, fonts are named `Stress …`, and radii, font sizes and spacing are one pixel off the
stock scale. The snapshot renders the app with it, and whatever still shows a stock value bypasses the theme (a hardcoded
colour, a font or size that skipped the token). It needs no backend: it runs against a local fake of the SaaS API.

The run fails on any leak count above `scripts/ui-snapshot/stress-baseline.json`, the leaks known today. After you fix a
leak, lower the baseline with `--update-stress-baseline` (a `--routes` run updates only its captures). An element that
must keep a stock value goes in `STRESS_EXCEPTIONS` in `scripts/ui-snapshot/stress.mjs`, with a reason; leaks waiting for
a fix belong in the baseline, not there. Do not confuse it with `stress/`, which is an HTTP load test of the production
server.

### Snapshot

For a UI change that should not change anything on screen (a token swap, a recipe refactor), take a baseline on
`develop`, a second run on your branch, and compare:

```bash
pnpm ui:snapshot -- --label before
pnpm ui:snapshot -- --label after
pnpm ui:diff -- before after
```

Exit code 0 means no difference in the computed styles of any visible element; a difference you did not expect means
the change leaked outside its scope. A change meant to look different needs before and after screenshots in the PR
(light and dark, with and without `PRIMARY_COLOR`). `scripts/ui-snapshot/README.md` has the options, how determinism
works, how to add a route and the known limits (mock data only: no empty states, errors or other plans).

## Before opening a PR

- `pnpm lint` and `pnpm test` (the second includes the inventory and the theme integrity tests).
- A theme change: `pnpm chakra:typegen`, then a look at both colour modes.
- A UI change: the snapshot diff, and before and after screenshots for anything visible.
- A lowered ratchet count or stress leak: the updated baseline is in the commit.
