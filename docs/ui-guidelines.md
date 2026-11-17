# UI guidelines

How to style the app so it stays themable. A rule that names its check (a test, `tsc` or a CI job)
is enforced, and the file is named so you can read the real thing. The rest are conventions that reviewers check.

## The rule

A component never decides how it looks. It picks a role (a token, a text style, a recipe variant, a shared component)
and the theme decides what that role looks like. If the look you need does not exist, add it to the theme first, then
use it.

The payoff: `PRIMARY_COLOR` recolours the accent, dark mode flips from CSS (no flash on SSR pages), and a redesign
touches `src/theme/` instead of hundreds of components.

The theme is Fil: untinted greys, a 1px ring instead of shadows, one blue. It is light only for now:
`ColorModeProvider` forces the light theme and the colour-mode switchers are not rendered, so dark values are not
designed yet (the `_dark` side of each token is kept as it was).

## Where things live

| What                                                                     | Where                                                                                                                                                     |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw scales (radii, sizes, border widths, z-index, weights, line heights) | `src/theme/tokens.ts`, `src/theme/colors.ts`, `src/theme/fonts.ts`                                                                                        |
| Meaning of colours (surfaces, text, borders, light and dark)             | `src/theme/semantic.ts` and one module per family (below)                                                                                                 |
| Brand colour and `accent` (generated from `PRIMARY_COLOR`)               | `src/theme/palette.ts`, assembled in `src/theme/system.ts`                                                                                                |
| Text roles                                                               | `src/theme/textStyles.ts`                                                                                                                                 |
| How a component looks and its variants                                   | `src/theme/recipes/*.ts`: registered in `recipes/index.ts`, except `page`, `confirmModal`, `loader` and `dragHandle`, which their `ui/` component imports, and `dashboard` (`DashboardContents`) |
| Voting UI from `@vocdoni/react-components`                               | `src/theme/react-components/*` and `src/theme/recipes/election.ts`                                                                                        |
| Shared building blocks                                                   | `src/components/ui/`                                                                                                                                      |
| Shared layout pieces                                                     | `src/components/Layout/Separators.tsx` (`LabelledSeparator`)                                                                                              |
| Icons, by concept                                                        | `src/theme/icons.tsx`                                                                                                                                     |
| The rules that keep the theme from being bypassed                        | `src/theme/style-inventory.ts` and `src/theme/style-inventory.baseline.json`                                                                              |

Import theme modules with the `~theme/*` alias and shared components with `~components/ui/*`.

## Colour

Use semantic tokens. Never a hex, `rgb()`, a CSS colour name (`white`, `black`) or a palette step (`gray.500`) in a
component. The inventory test rejects hex and named colours outright; raw palette steps are on a downward ratchet (see
[The checks](#the-checks)).

```tsx
<Box bg='surface.card' borderColor='border' color='fg.muted' />
```

Token families, each in its own module under `src/theme/` and spread into `colors` in `semantic.ts`:

| Family                           | Tokens                                                                                                                                                                                                                                                                                       | Module            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Page text and fills              | `fg`, `fg.muted`, `fg.subtle`, `fg.faint` (`fg.subtle` today), `fg.inverted`, `fg.error`, `bg`, `bg.subtle`, `bg.muted`, `bg.emphasized`, `bg.track` (the empty track of a progress bar), `bg.inverted`, `bg.panel`                                                                          | `semantic.ts`     |
| Borders                          | `border`, `border.muted`, `border.subtle`, `border.emphasized`, `border.strong` (control outlines, `border.emphasized` today), `border.field` (the ring of fields, selects, textareas and voter options, `#8f8f8f`), `border.inverted`                                                       | `semantic.ts`     |
| Surface layers                   | `surface.canvas`, `.sidebar`, `.content`, `.card`, `.sunken`, `.raised` (`.tooltip`), `.overlay` (`.drawer`), `.inset`, `.inverse` (`.border`, `.rule`, `.fg`, `.fg.muted`)                                                                                                                  | `semantic.ts`     |
| Dimming layer                    | `scrim`, `scrim.strong` (dialog and drawer backdrops), `scrim.sheet` (behind a bottom sheet and a tablet's confirm dialog), `scrim.fg`                                                                                                                                                                                                                            | `semantic.ts`     |
| Rules and vertical accents       | `separator`, `verticals.generic.900`, `verticals.professional.900`                                                                                                                                                                                                                           | `semantic.ts`     |
| Interaction states (bg/fg pairs) | `state.hover`, `state.pressed`, `state.selected`, `state.current`, `state.dragover.border`                                                                                                                                                                                                   | `states.ts`       |
| Status palettes                  | `colorPalette='success' \| 'warning' \| 'danger' \| 'info'`, each with the slots of a Chakra palette (`solid`, `contrast`, `fg`, `muted`, `subtle`, `border`…)                                                                                                                               | `status.ts`       |
| Status by meaning                | `status.{success,warning,error,info}.{fg,bg,border,solid,contrast,emphasis}`, `status.neutral.{fg,bg,border,solid,contrast}`, `danger.action`                                                                                                                                                | `status.ts`       |
| Charts and meters                | `chart.1` to `chart.8` (`.icon` is the glyph), `chart.track`, `meter.{ok,warning,critical}` (the info, warning and error `solid`)                                                                                                                                                            | `charts.ts`       |
| Public ballot                    | `ballot.choice.{border,ring,bg}`, `ballot.results.track`, `ballot.schedule`, `ballot.error`, `ballot.balance.{success,warning,error}`                                                                                                                                                        | `ballot.ts`       |
| Artwork and logos                | `illustration.fg`, `illustration.contrast`, `logo.fg`                                                                                                                                                                                                                                        | `illustration.ts` |
| Links, switch                    | `link.fg`, `link.fg.hover`, `link.tile.hover.bg`, `switch.thumb` (off) and `switch.thumb.checked`                                                                                                                                                                                            | `recipeColors.ts` |
| Toasts                           | `toast.{success,warning}.bg` and `.fg`: no recipe reads them since Fil toasts are a raised neutral card; kept for dark mode                                                                                                                                                                  | `recipeColors.ts` |
| Shadows                          | `shadow.card`, `shadow.raised` (`.popover`, `.tooltip`), `shadow.floating` (`.panel`), `shadow.overlay`, `shadow.control` (a ring around a button or avatar), `shadow.field` (the darker ring of a field), `shadow.ring` (a plain hairline in `border`), `shadow.raised.halo` (a desktop action menu: the ring plus a 4px panel-coloured halo); every shadow is a 1px ring, no blur | `semantic.ts`     |
| Brand accent in dark mode        | `accent.fg`: the brand's `fg`, or white on the dark page for a neutral brand (active tab, highlight card)                                                                                                                                                                                    | `palette.ts`      |
| Accent fills                     | `accent.solid` (`.hover`), `accent.contrast`, `accent.subtle`: the palette `colorPalette` falls back to (always `brand`: Fil blue until `PRIMARY_COLOR` replaces it)                                                                                                                         | `system.ts`       |
| Single-purpose                   | `auth.*`, `footer.bg`, `tabs.*`, `input.placeholder`, `dashboard.menu`, `border.pagination.active`, `gray.focusRing`                                                                                                                                                                         | `semantic.ts`     |

Rules of thumb:

- **Accent**: leave `colorPalette` alone (it is `brand`: Fil blue `#1d62e9`, or `PRIMARY_COLOR` when set) and read
  `colorPalette.solid`, `colorPalette.fg` and so on. Use `colorPalette='gray'` only for things that must stay neutral.
  When a recipe or component paints brand-coloured text (active tab, highlighted notice), read `accent.fg`, not
  `brand.fg`: it is the brand's `fg`, except on the dark page for a neutral brand too dark to read there (such as the
  stock black), which gets white. Borders may still read `brand.fg`.
- **Status colour**: status colours are Chakra semantic palettes defined in `src/theme/status.ts`. Pick one with
  `colorPalette='danger' | 'success' | 'warning' | 'info'`, and `gray` for neutral; never a local status-to-colour map
  or a raw `red`/`green`. `StatusBadge` takes `colorPalette`. Code that reads a colour rather than a palette uses
  `status.<tone>.{fg,bg,border,solid,contrast,emphasis}` (the `danger` palette is `status.error`). `danger.action` is
  the text colour of an action that deletes or ends something.
- **Dark mode**: a token has a `_light` and a `_dark` value in the theme. Components do not branch on the mode:
  `_dark={{ … }}` or `_light={{ … }}`, `colorMode ===` and a `useColorModeValue` call with a colour argument in a component
  are `colorModeLogic` and fail the inventory
  (they also flash the light value on SSR pages before hydration). The only allowed `_dark` are the two listed in the
  exceptions: an image filter on empty-state artwork and the white tile behind organisation logos.
- **Dark greys**: the raw `ink` scale in `colors.ts` is numbered by lightness, like Chakra's scales, so a higher step is
  darker: `ink.950` (#000000), `ink.900` (#0a0a0a, the dark page), `ink.850` (#1f1f22), `ink.800` (#262626), `ink.700`
  (#2e2e2e). Components never read it; the semantic tokens do. The dark `bg.muted` is `ink.850`, so the dark steps run
  `bg.subtle` < `bg.muted` (hover) < `bg.emphasized` (pressed, current), the same order as light. `state.hover.bg` is a 4% black
  wash in light mode so it shows on white and on the sidebar tint alike.
- **Text on a coloured fill**: use the pair the token family ships (`status.error.contrast` on `status.error.solid`,
  `surface.inverse.fg` on `surface.inverse`), not an ad hoc black or white. `textContrast.test.ts` and `palette.test.ts`
  check contrast.
- **A token that repeats another role**: alias it (`state.current.bg` is `{colors.bg.emphasized}`, `meter.ok` is
  `{colors.status.info.solid}`) instead of copying the raw steps, so the two cannot drift.

Fil rules the theme enforces:

- Two rings. A button and an avatar draw `shadow.control`; an input, textarea, native or searchable select and a voter
  option draw `shadow.field` (the darker `border.field`). Focus, invalid and read-only states stay as they are.
- `#8f8f8f` (`fg.faint`, `border.field`) is never a text colour. It is for marks and rules only.
- A progress bar's empty track is `bg.track`; the `results` variant keeps `bg.muted`.
- A `Button` with `loading` keeps its filled look (primary) or its ring and ink (secondary) with the spinner, and is not
  pressable. Grey is only for a truly disabled button: the recipes tell the two apart by `data-loading`.
- Hover of the secondary (`outline`) and the discreet (`ghost`) button is `state.hover.bg`, one step below
  `state.selected.bg`.
- Links are never underlined in any state, apart from the explicit `link-underline` button and links inside
  user-written text (`Markdown`). Hover only darkens to `accent.fg.hover`; keyboard focus keeps the outline.
- The voter ballot scale: `fontSizes.ballot.option` (17px) and `ballot.question` (32px), `lineHeights.question`,
  `letterSpacings.heading.question` and `letterSpacings.voter`.

## Text

Typography is a role, not three props.

```tsx
<Text textStyle='caption' color='fg.muted'>
  …
</Text>
```

App roles (`src/theme/textStyles.ts`): `body`, `body-sm`, `caption`, `eyebrow` (12px, medium; Fil has no uppercase),
`page-title` (24px on a phone, 28px from `md`, semibold, tight tracking), `section-title` (the `control` size, semibold), `display`, `control` (a control's text, on the `control` font
size, with no weight: buttons, field labels and card titles add 550 in their recipes), `figure` (numerals, dates, counts and codes: JetBrains Mono at 12px), `quote-label` (the sector over a featured quote), `separator-label` (the label of a
`LabelledSeparator`), `status-title` (a process status as a headline) and `role-name` (a role shown from its raw
value, capitalised), `item-title` (a row's title in a list, 16px, 15px from `md`), `feature-title` (the larger title of the row a
list promotes, 19px, 20px from `md`), `vote-title` (a vote's page title, 22px, 28px from `md`), `meta` (secondary text of a row, 14px,
13px from `md`), `figure-hero` (the one headline figure of a screen, in sans: 56px, 96px from `md`, 132px from `lg`) and `figure-hero-unit` (its unit),
`question-title` (a question's title in a vote's card, 15px on a 21px line), `question-head` (the open question's title in its row: 16px on a 22px line up to `lg`), `question-line` (a closed or waiting question on one line: 15px medium-plus on touch screens), `question-number` (its number, in figures), `note` (the quiet line under a question's title: 14px on a 20px line on touch screens, 13px on the running line from `lg`), `hero-caption` (the line beside the headline figure), `state-title` (the headline of the card that says where a vote stands: 19px below `lg`), `state-body` (what that card says under it: 15px, 14px, 13.5px), `fact-value` (a fact's value on a touch screen), `dialog-title` (a confirm dialog's and a bottom sheet's title: 17px below `lg`, 24px with the page's tracking from `lg`), `dialog-body` (what a
confirm dialog says: 15px on a phone, 14px from `md`, 1.45) and `bar-caption` (the line over a bar, "184 of 312 voted": 14px, 13.5px from `lg`, 550).
The control roles `control-touch` (15px, 14px, 13.5px), `control-input` (16px, 14px, 13.5px) and `control-chip` (14px, 13.5px from `lg`)
and `control-tab` (15px, 13.5px from `lg`) are what button, field, menu, chip and tab recipes read; do not use them in components. Chakra's own `2xs` to `7xl` and `label` keep their names. Rules:

- A role holds typography only. Colour stays a separate prop. Do not pass a `textStyle` and a prop that sets the same
  property: they resolve in prop order.
- The page has one `h1`: `PageTitle` from `~components/ui/PageTitle` (`PageSubtitle` is the line under it). Every
  card, section or settings-block title is a `SectionHeader` (below): an `h2` in the `section-title` role over a muted
  `body-sm` description. Do not write that pair by hand.
- A labelled figure (a usage count, a date on a card) is the `stat` recipe, not a `Text` with a bigger size: a 12px
  eyebrow label over a figure, with an optional muted unit. See `UsageMeter` below. A vote's turnout is the `Stat` size
  `hero`.
- Body copy needs no `textStyle`: `body` in `globalCss` (`system.ts`) gives it the `body` role, so a bare `Text`,
  markdown or a list item inherits that. The `text` recipe has no default size, so set `textStyle` or `size` on any
  `Text` that should be something else. For inline emphasis inside smaller text, use `chakra.span` or `Span`.
- Line heights are four tokens: `shorter` (1.2), `short` (1.3), `moderate` (1.45, the guide's root: running text and controls), `tall` (1.6), plus `question` (1.08, the voter's question title), `hero` (0.74, the headline figure; `hero.touch` 0.8 below `lg`), `state` (1.25, the state card's headline on a touch screen), `page` (1.1, a page's and a vote's title; `page.touch` 1.15 below `lg`), `fact` (1.35, a fact's value on a touch screen) and the fixed lines the boards set rows on: `row.title` (20px, a list row's title), `row.question` (21px, a question's title and number in a card), `row.touch` (22px, both on a touch screen), `row.meta` (18px, a list row's secondary line; `row.meta-touch` 20px) and `row.label` (17px, the way back over a page title). Letter spacing:
  `body` (the page's -0.006em), `heading.row` (-0.012em, a row's or a question's title), `heading.item`, `heading.feature` (-0.025em, the state card's 19px headline), `heading.section` and `heading.page` (tighter as the type grows; `heading.page.touch` -0.03em on a phone),
  `heading.snug`, `heading.question`, `quote.tight`, `figure.hero` and `figure.unit` (the headline figure and its unit), `voter`, plus Chakra's own steps.
- Families and weights live together in `src/theme/fonts.ts`: each family with the files it ships (`SANS` and `MONO`, a static
  family or a variable range), the stacks (`body`, `heading`, `figure`, `mono`) and the ladder of which weight each
  name renders (`FONT_WEIGHTS`). Commissioner (interface) and JetBrains Mono (figures) are variable, 400 to 700:
  `light` and `normal` render 400, `normal-plus` 450, `medium` 500, `medium-plus` 550, `semibold` and `bold` 600, and
  `bolder` and up stop at 600 too, so the interface tops out at 600. `normal-plus` and `medium-plus` are the half steps a variable family can draw. Numeric weights fail the inventory (`numericFontWeight`). A weight with no face
  behind it makes the browser fake it, and `fonts.test.ts` keeps the CSS imports in `Theme.tsx`, the families and the
  ladder in step.
- Markdown headings written by users use `proseHeadingSizes`, shared by the editor and the renderer.

## Sizes, spacing and radii

- **Spacing tokens of the boards**: `card` (22px), `fact` (7px, above and below a vote's fact), `chip` (7px, a chip's label to its count), `note` (1px, a question's title to its note; `note.paper` 3px, the same on the organiser's ballot from `lg`), `dock` (110px, what a phone page keeps clear under its content for the bottom action bar), `row` (11px, the top of a one-line row; `row.head` 13px, a legend's head), `hero.ruler` and `hero.compact` (34px and 30px, the participation hero from `lg`), `idle` (26px, the card that says where a vote stands; `idle.end` 13px, its footer's end).
- **Spacing**: scale steps (`p='4'`, `gap='2'`), plus `0` and `auto` (`p='0'`, `mx='auto'`). A pixel value is a
  `pxSpacing` ratchet hit.
- **Sizes**: Chakra's named sizes and the tokens below, plus `0` and `auto`. A pixel value is a `pxSize` ratchet hit.
- **Radii**: `xs` (3px), `sm` (4px), `md` and `lg` (6px), `xl` and `2xl` (12px), `bar` (2px, the ends of a 4px bar: the turnout
  track, a sheet's grab handle), `full`, `none`. Pixel radii fail the
  inventory. Chakra's own recipes read the semantic `l1`, `l2` and `l3` (`sm`, `md`, `md`), written out in `semantic.ts`.
- **Font sizes**: the touch steps `page` (24px), `item` (15px), `feature` (19px), `vote` (22px), `sheet` (17px, a sheet's or a tablet dialog's title) and `figure.small`
  (56px) and `figure.large` (96px) sit next to `xs` 12px, `sm` 13px, `control` 13.5px (a control's label and value), `md` 14px, `lg` 16px,
  `xl` 20px, `2xl` 28px, `figure.hero` (8.25rem, the headline figure); `2xs` and `3xl` upward are Chakra's.
- **Responsive** (the whole app, not a screen): the breakpoints are Chakra's, `base` (under 768px, a phone), `md`
  (768 to 1023px, a tablet) and `lg` (1024px and up, a desktop, which is the size every value below keeps). Controls
  grow into touch targets through the recipes, so a component never writes the steps itself:

  | What                            | Phone (`base`) | Tablet (`md`) | Desktop (`lg`) |
  | ------------------------------- | -------------- | ------------- | -------------- |
  | Button height, text, sides      | 44px, 15px, 16px | 40px, 14px, 14px | 34px, 13.5px, 12px |
  | Icon button hit area            | 44px           | 40px          | 28px           |
  | Chip (`variant='chip'`)         | 36px, 14px     | 32px, 14px    | 28px, 13.5px   |
  | Field and select height, text   | 44px, 16px     | 40px, 14px    | 34px, 13.5px   |
  | Menu item height, text          | 52px, 16px     | 40px, 14px    | 32px, 13.5px   |
  | Action menu (`ResponsiveMenu`)  | sheet, 52px rows | fits its items, 40px rows, 18px icons | fits its items, 34px rows, 16px icons |
  | Confirm dialog                  | bottom sheet   | 440px, 22px padding, 12px corners | 460px, 6px corners, ruled footer |
  | Tab height, text (line variant) | 44px, 15px     | 44px, 15px    | text, 13.5px   |

  The tokens are `sizes.control.touch` (44px), `control.tablet` (40px) and `control.row` (52px, a menu or sheet row). The field text is 16px on a phone so iOS Safari does not zoom on
  focus. The `line` tab bar stays on one line and scrolls sideways (no scrollbar), with a 24px gap. A `dialog` is a
  bottom sheet below `md` (full width, 12px top corners, padded for the home indicator) and keeps its centred look from
  `md`. A confirm (`ConfirmDialog`, layout `decision`) is the guide's: a sheet with a grab handle and the action first
  below `md`, a 440px dialog `dialog.top.tablet` (220px) from the top on a tablet, a 460px one `dialog.top` (168px) from the top
  from `lg` (`sizes.dialog.tablet`, `dialog.desktop`). The `drawer` has a `sheet` variant for the same shape (`placement='bottom'`), and the button has the
  `sheet-row` and `sheet-close` variants for its rows. Use `ResponsiveMenu` (below) for a list of actions rather than
  a hand-built `Menu` plus `Drawer`.

  The dashboard shell (`elements/DashboardShell.tsx`) follows the same split:

  | What                 | Phone (`base`)                         | Tablet (`md`)                          | Desktop (`lg`)                                   |
  | -------------------- | -------------------------------------- | -------------------------------------- | ------------------------------------------------ |
  | Navigation           | 52px top bar, 296px drawer (`sidebar`) | 52px top bar, 296px drawer (`sidebar`) | fixed 240px sidebar (48px collapsed)             |
  | Page side gutter     | 16px                                   | 24px                                   | 28px                                             |

  The sizes are `sizes.dashboard.topbar`, `dashboard.drawer` (read by the drawer `sidebar` variant) and
  `dashboard.menu.expanded|collapsed`. The top bar (`Dashboard/TopBar.tsx`) holds the menu button, the organization and
  the account menu, and is hidden from `lg` by CSS; the drawer shows the sidebar's items in the same order and closes on
  navigation, on Escape and from its close button. Only the sidebar collapses. The gutter is the
  `recipes/dashboard.ts` recipe read by `DashboardContents`, so a page never sets its own.

- **Opacity**: `inactive` (0.6), `dimmed` (0.5), `outvoted` (0.4, a choice that lost a final tally), `opaque` (1, undoes Chakra's `_disabled` fade on a control that draws its own unavailable look).
- **Page rhythm**: `DashboardContents rhythm='board'` is the votes screens' page padding (20 40 on a phone, 28 48 on a
  tablet, 48 40 from `lg`, where every page title starts 48px down and a line over it climbs into the padding); the `line` tabs keep the boards' 6px count slot after a label without a count.
- **Border widths**: `hairline` (1px), `thick` (2px) and `focusRing` (the width of a hand-drawn outline or box-shadow
  focus ring, `thick`): `<Box borderWidth='thick' />`. `outlineWidth` has no token category, so a recipe writes it as a
  reference, `'{borderWidths.focusRing}'`: a bare `'focusRing'` is dropped without an error and the ring is not drawn.
- **Icon sizes**: `icon.sm` (1rem, inline, also what a bare `Icon` gets), `icon.md` (1.25rem, control), `icon.lg`
  (1.5rem, feature), `icon.xl` (3rem, empty state): `<Icon as={ErrorIcon} boxSize='icon.xl' />`.
  `icon.sm` to `icon.lg` alias Chakra's Icon sizes (`{sizes.4}`, `5`, `6`), so `boxSize='icon.md'` and
  `<Icon size='md'>` cannot drift apart; `icon.xl` is `{sizes.12}`.
- **Page widths**: `content.wide` (1600px), `content.medium` (1200px), `content.narrow` (900px), read through
  `PageContainer` (below).
- **Other named sizes**: `card.empty`, `table.action`, `list.label` (the leading column of a list row: a vote's state and date, 112px; `list.label.tablet` 104px), `content.list` (920px, the votes list's column), `lead` (560px, the measure of a lead paragraph; `lead.tablet` 584px), `facts` (392px, a vote's facts and Resum's side column), `results.share` (38px, a result bar's share; `results.detail` 520px, the longest a question's turnout and bars grow on a tablet), `actionbar` (60px, a card footer that holds a button), `option` (42px, an option's row on the organiser's ballot; `option.touch` 48px on a phone), `mark.box` and `mark.wide` (24px and 36px, the empty rank and points boxes before an option; `.touch` 26px and 38px below `lg`), `icon.xs` (13px, a mark in small text), `toolbar`, `dashboard.menu.expanded|collapsed`,
  `dashboard.header`, `dashboard.topbar`, `dashboard.drawer`, `dashboard.panel`, `dialog.tablet` and `dialog.desktop` (a confirm dialog's width), `icon.chevron` (15px, the chevron of a control that opens a menu), `control.floating` (support chat launcher), `control.icon-link` (square icon
  link), `control.md` (34px, the default height of buttons, inputs and selects), `control.area` (76px, textarea
  minimum height), `dot` (7px status dot), `loader` (min height of `PageLoader`), `wordmark` (width of the Vocdoni wordmark:
  `<VocdoniLogo w='wordmark' />`), `turnout.max` (420px, the longest a turnout bar grows from `md`), `voting.sidebar`, `voting.contents.min`, `user-profile`, `cookies-consent`.
- **Card inner edge**: 16px on a phone and the `card` spacing token (22px) from `md`, read by the `card` recipe's
  header, body and footer, so a card's content lines up with the guide everywhere.
- **Fil marks**: `borderWidths.mark` (1.5px ring of a checkbox or radio), `borderWidths.radio` (5px, a checked radio's
  filled ring) and `spacing.track` (3px gutter of a segmented control).
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

| Recipe              | Variants and axes                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`            | `variant`: `off` (an action shown but not available now, as "Open" while another question is open: sunken fill, no ring, `cursor.unavailable`; pair it with `aria-disabled` and a described reason, never `disabled`), `link`, `link-underline`, `text`, `text-link`, `nav-item`, `menu-item`, `menu-item-strong`, `sheet-row` (a 52px sheet row under a rule, 18px muted icon), `sheet-close` (the sheet's 44px dismiss button, its ring drawn inside so the scrolling body does not clip it), `menu-trigger`, `dropdown` (a secondary that opens a menu: label and a 15px muted chevron, tighter end), `segment`, `toggle`, `chip` (a filter chip, at `size='sm'`: a 1px border, transparent when chosen, and its count in `fg.subtle`), `disclosure`, `danger` (the destructive secondary: danger text, `bg.error` hover, never filled), `floating`, `whatsapp`; `size`: `cta`, `row` (the small action inside a list row: 40px below `lg`, 28px with 10px sides and 13px text from `lg`); `multiline`; every size carries a 14px icon from `lg`. Chakra's own `solid`, `outline`, `ghost`… stay |
| `card`              | `outline`, `section`, `frame` (a 1px ring, not a border, so it takes no room, as the guide's cards), `sunken`, `inverse`, `highlight`, `list-item`, `standalone`, `dropzone`, `note` (a dashed explanation, no fill), `plain` (a filled card without a border, around a page-level empty state); `Card.Body data-current` marks the row being worked on with an accent rule                                                               |
| `alert`             | `layout`: `inline` (default), `banner`, `compact`, `panel`, `notice` (the guide's notice, a paused vote: tinted band in ink, `status.warning.ring`, 15px icon); Chakra's `status` stays                                                                                                                                                                                                                                                                                 |
| `link`              | `variant`: `plain`, `title` (a title that opens what it names, as a list row's: the heading's ink and weight, the accent on hover), `unstyled`, `icon-button`, `subtle`, `tile`, `back` (the way back over a page title: 14px medium with a chevron up to `lg`, a quiet 12px label from `lg`), `row-action` (a list row's or card's one action: 15px text and a 44/40px hit area up to `lg`, 13.5px text alone from `lg`); `size`, `emphasis`, `tone` (`muted`, `quiet`)                                                                                                                                                                                                                                                      |
| `tabs`              | `variant`: `line` (default: hairline and a 2px ink line under the current tab), `pill` (segmented)                                                                                                                                                                                                                                                                  |
| `drawer`            | `variant`: `panel` (the default, and the shell of `PanelDrawer`), `sidebar` (the dashboard's navigation below `lg`, `dashboard.drawer` wide), `sheet` (a bottom sheet as the boards draw it: grab handle, `dialog-title`, rows under rules, padding 8 16 24, `scrim.sheet`); dialog and drawer backdrops otherwise paint `scrim.strong`                                                                                                                                                                            |
| `dialog`            | `placement` defaults to `center`, which is a bottom sheet below `md`; the header stacks the title over a muted description (`DialogHeader`)                                                                                                                                                                                                                         |
| `menu`              | Items are 52px, 40px, 32px rows by breakpoint, highlight through `_highlighted` with `state.hover`, and keep `state.selected` when selected, never `_focus` (Ark menu items are highlighted, not focused). `variant='actions'` is `ResponsiveMenu`'s dropdown: as wide as its longest item, every item with its icon; 40px rows and 18px icons on a tablet, 34px rows, 16px icons, `shadow.raised.halo` and a rule before the destructive items from `lg` |
| `progress`          | `variant`: `results` (thin bar in ink, one per choice, never dimmed: the slot cannot tell a final tally from a live one), `turnout` (the share that voted, a 4px bar with round ends and a gap after the fill), `meter` (`UsageMeter`), `job` (a background job)                                                                                                                  |
| `stat`              | `size`: `sm` (labelled field), `md`, `lg` (default, headline figure), `hero` (a vote's turnout); parts `label`, `valueText`, `valueUnit`                                                                                                                                                                                                                            |
| `status`            | size `sm` is 13px up to `lg` and 12px from `lg`; `tone`: `success`, `warning`, `danger`, `gray`, `ink`, `hollow` (a dot and a word; `ProcessStatus` picks the tone)                                                                                                                                                                                                                                                  |
| `dataList`          | `variant`: `facts` (label left, value right, rows split by `border.muted`; see `FactList`), `summary` (a vote's facts: label over value in two columns on a phone and four on a tablet, the `facts` rows from `lg`), `ruled` (the rows of a card under its title, each under a rule and padded to the card's edge; the label keeps its line)                                                                                                                                                                                                                                                                          |
| `ballotPaper`       | Slots `header`, `heading`, `count`, `intro`, `introLabel`, `introText`, `head`, `number`, `title`, `description` (a question's own text, as markdown), `note`, `tag`, `option`, `mark`, `statement`, `statementTitle`, `statementNote`, `statementText`, `tile`: the organiser's view of a ballot (Papereta, boards V4VotePaper and M4VotePaper); `kind` (`one`, `many`, `rank`, `points`) picks the empty mark before each option: a radio, a checkbox, a rank box or a points box |
| `questionDock`      | Slots `page`, `root`, `line`, `title`, `note`, `actions`: the phone's bottom action bar of a question-by-question vote (board M4VoteOne), fixed, padded for the home indicator, hidden from `md`; `page` goes on the page around it and keeps its content clear of the bar while it is there (`QuestionDock`) |
| `censusRuler`       | Slots `root`, `track`, `range`, `quorum`, `scale`, `start`, `end`, `marker`, `quorumLabel` (`CensusRuler`); `layout`: `scale` (default), `compact` (the bar alone, 12px tall from `lg`; responsive values work); `closed` (ink fill) |
| `confirmModal`      | Imported by `ui/ConfirmDialog`. `layout`: `decision` (default, the guide's confirm: sheet, tablet dialog, desktop dialog), and the older `panel`, `inline`, `compact`, `summary`; slots include `backdrop`, `positioner`, `content`, `warning`, `warningIcon` |
| `input`, `textarea` | `variant`: `inline` (no border or side padding; the rich-text `Editor` passes its `variant` to the textarea recipe); input `code` (a read-only value to copy, such as a voting link: sunken, no ring, in the figure face)                                                                                                                                                                                                                                                 |
| `list`              | `variant`: `marker`                                                                                                                                                                                                                                                                                                                                                 |
| `emptyState`        | `size`: `sm`, `md`, `lg`                                                                                                                                                                                                                                                                                                                                            |
| `text`, `heading`   | `text`: `size`, `variant='muted'`; `heading`: `variant` `heavy`, `subsection`, `page` (`PageTitle`'s: from `lg` a control-tall box with the text at its foot, so every page title reads on the same line)                                                                                                                                                                                                                                                                                       |
| `badge`, `tag`      | Badge `size` (`xs` to `lg`), `variant`: `count` (tab counter), `label` (neutral role chip, capitalised); Tag has one outlined look (radius `xs`), plus `kind` (the same in `fg.muted`: a question's ballot type) and `proposal` (dashed); for a status use `StatusBadge`                                                                                                                                                                                               |
| `nativeSelect`      | The input's field look (panel, ring, outside focus ring) at the shared control height, whatever the size; `code` is a neutral chip like `badge` (both default to the `gray` palette, not the accent)                                                                                                                                                                |

To add a variant:

1. Add it to the recipe in `src/theme/recipes/`, built only from tokens (a recipe may use the `[value]` escape for CSS
   values with no token, such as `none` or `inherit`). `system.test.ts` fails on any token name that does not exist, in
   every recipe in its `ALL_RECIPES`, and the inventory counts pixel sizes, pixel spacing and palette steps in recipes
   too (see [Style inventory](#style-inventory)): a size that repeats becomes a token, as `control.floating` and
   `control.icon-link` did.
2. Register a new recipe in `src/theme/recipes/index.ts`, unless only one `ui/` component uses it: then import it there
   (as `ui/PageContainer.tsx` does with `recipes/page.ts`) and add it to `ALL_RECIPES` in `system.test.ts`, which does
   not cover `page`, `confirmModal` and `loader` today.
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

| Component                                  | Use it for                                                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageContainer`, `PageSection`             | A page column: `size` (`wide`, `medium`, `narrow`) and `gutter`. `PageSection` is the same without gutters                                                                                                              |
| `PageTitle`, `PageSubtitle`                | The page's one `h1` and the line under it                                                                                                                                                                               |
| `SectionHeader`                            | The title of a card, section or settings block: `title`, `description`, `actions`, `icon`, `rule`. Actions drop below the title under `md`                                                                              |
| `UsageMeter`                               | A usage figure with an optional bar: `label`, `value`, `max`, `unit`, `icon`, `tooltip`, `color`, `softLimit`; `children` render under the bar                                                                          |
| `RoutedTabs`                               | Tabs that are child routes: `tabs` (`{ label, route, count? }`), optional `value`, `outletContext`, `rhythm` (`page`: 20/24/32px to the content, a vote's tabs), `notice` (a banner between the tabs and the content); renders the `Outlet`                                                                                                |
| `ListStateAlert`                           | A list or block that failed to load: `error`, `title`, `fallback` (for a non-`Error`), `show`. Use it instead of a hand-built error `Alert`                                                                             |
| `Tooltip`                                  | Every tooltip: `content`, `showArrow`, `contentProps`, `portalled` (off inside another portal)                                                                                                                          |
| `useIsMobile`, `useTableAsCards`, `useIsDesktop` | The mobile breakpoint (below `md`) as a boolean; the second is the same hook, named for tables shown as cards; the third is `lg` and up (shortcut hints, a labelled "More" button)                                                                                                           |
| `ConfirmDialog` (`ConfirmDialogContent`, `ConfirmDialogShell`) | Every confirmation. `title`, `description`, `warning` (the amber line with the warning icon), `tone` (`danger`, the default: an outline in the danger colour, never filled; `primary`: the filled accent), `layout` (`decision`, the default and the guide's; `panel`, `inline`, `compact`, `summary` for older screens). `useConfirm` prompts render in the same shell |
| `StatusBadge`                              | A status chip: `colorPalette` (`success`, `warning`, `danger`, `info`, `gray`), `variant` (`subtle`, `surface`, `solid`)                                                                                                |
| `ProcessStatus`                            | A vote's or question's state as a dot and a word: `state`, `kind` (`vote`, `question`), `detail` (a quiet note such as the closing day: inline on a phone, under the word from `md`)                                                                                                                                  |
| `CensusRuler`                              | A turnout bar with its scale (`RulerProps`): `value`, `max`, `label` (accessible name), `marker` (the count under the fill's end, from `lg`, clamped clear of 0 and the total), `closed` (ink fill), `quorum` (a dashed mark and "quorum N"), `layout` (`scale`, `compact`; responsive). 0 and the total are always printed |
| `TurnoutBar`                               | "184 of 312 voted" and its share over a `CensusRuler`: `caption`, `share` (formatted), and every `RulerProps` prop                                                                                                            |
| `FactList`                                 | Label and value rows as a `dl`: `facts` (`{ id, label, value, tooltip? }`), `layout` (`rows`, `summary` for a vote's facts, or `ruled` for the rows of a card)                                                                                                                                              |
| `PageLoader`, `ListLoader`, `InlineLoader` | A page with nothing yet, a list or block that is fetching, a wait inside a control                                                                                                                                      |
| `EmptyState`                               | Nothing to show. `size` `sm` (table row), `md` (inside a card), `lg` (instead of a whole list); `icon` or `image`                                                                                                       |
| `CloseButton`                              | A close control with a translated `aria-label`                                                                                                                                                                          |
| `ResponsiveMenu`                           | A list of actions: `label` (trigger name and sheet title), `title` (the sheet's title when it names an item), `trigger`, `items` (`{ value, label, onSelect?, href?, danger?, disabled?, icon? }`). Menu `actions` from `md`, a bottom sheet of 52px rows and a Cancel button below it; danger items last, ruled off from `lg` |
| `PanelDrawer` (`ui/Drawer`)                | Every side panel: `title`, `description`, `footer` (pinned actions), `trigger`; a close button in the corner is built in                                                                                                |
| `DialogHeader`                             | A dialog's `title` (its accessible name) and muted `description`. Dialogs are centred by default; do not set `placement`                                                                                                |
| `DragHandle`                               | The grip of a sortable item: `placement` `start`, `center` or `corner`, and `dragging`                                                                                                                                  |

```tsx
import { PageSection } from '~components/ui/PageContainer'
import { StatusBadge } from '~components/ui/StatusBadge'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { RoutedTabs } from '~components/ui/RoutedTabs'
import { ListStateAlert } from '~components/ui/ListStateAlert'

<PageSection size='medium'>
  <StatusBadge colorPalette='success'>{t('status.ongoing')}</StatusBadge>
</PageSection>

<RoutedTabs tabs={[{ label: t('members'), route: 'members', count: total }, { label: t('groups'), route: 'groups' }]} />
<ListStateAlert error={error} title={t('could_not_load')} fallback={t('try_again')} />

<ConfirmDialog layout='inline' open={open} title={title} onConfirm={revoke} loading={isPending} />
```

A section title, a usage meter and a side panel:

```tsx
import { SectionHeader } from '~components/ui/SectionHeader'
import { UsageMeter } from '~components/ui/UsageMeter'
import { quantity } from '~utils/numbers'
import { PanelDrawer } from '~components/ui/Drawer'

<SectionHeader title={t('team')} description={t('team_hint')} actions={<Button>{t('invite')}</Button>} />

<UsageMeter label={t('votes')} value={used} max={limit} unit={`/ ${quantity(limit)}`} color='chart.1' />

<PanelDrawer open={open} onOpenChange={(e) => setOpen(e.open)} title={t('add_group')} footer={<Button type='submit' form={formId}>{t('save')}</Button>}>
  <form id={formId}>…</form>
</PanelDrawer>
```

`UsageMeter` formats `value` with `quantity()` (the page's locale); `unit` is printed as given, so format any number in it too. With no `max` it shows the figure alone, with no
bar. With a `max` it draws a bar in the `color` series (`chart.1` to `chart.4`, so the brand cannot recolour it; the
`meter.ok` tone when absent), which turns `meter.warning` at 80 % of the limit and `meter.critical` at 100 %. A
`softLimit` (going over is billed, not blocked) never warns, and a `max` of `0` means no limit: the bar stays empty.

The two bars on the `progress` recipe are not interchangeable. `variant='results'` is for one choice of a vote: the
title and tally sit above a thin bar, in the archive and in the public ballot alike. `variant='turnout'` is the
thin bar with a gap after the fill for the share of the census that voted, in the process summary and the dashboard process view:

```tsx
<Progress.Root variant='turnout' value={participation}>
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
```

Not in `ui/`: `LabelledSeparator` (`~components/Layout/Separators`), a hairline on each side of a short label, such as
`OrSeparator`'s "or continue with". Do not build one from a `Flex` and two `Box`es.

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

### Logo

`VocdoniLogo` (`~components/Layout/Logo`) is the only Vocdoni logo: an inline SVG that paints with `currentColor` on the
`logo.fg` token, so it follows the colour mode from CSS. Do not add PNG logos or a dark-mode `invert` filter for it.
Size it with `w`/`h`/`maxH`; `minimal` draws the mark without the wordmark.

## Allowed exceptions

The exceptions are `STYLE_EXCEPTIONS` in `src/theme/style-inventory.ts`; each has a `glob`, the `categories` it excuses,
an optional `match` (a regular expression on the whole source text of the occurrence, such as the full JSX attribute,
that narrows the exception to the occurrences it names) and a `reason`. Today:

- **PDF report** (`VotingReportPdf`): react-pdf renders outside Chakra, so raw values are the only option.
- **Stripe Elements** (`src/components/Pricing/stripe.ts`): its appearance API takes raw CSS colours. The app is light only,
  so it always gets the light theme (`useColorMode` honours the forced theme).
- **react-select**: the menu portal of `SaasSelector.tsx` and `CensusSearch.tsx` needs a raw `zIndex` above Chakra
  modals, and `isLoading` on the react-select wrapper (`SaasSelector.tsx`, `Members/index.tsx`, `CensusCreation.tsx`) is
  a react-select prop, not a Chakra v2 one.
- **The colour-mode implementation** (`src/theme/color-mode.tsx`).
- **Organisation logos on a white tile** (`Layout/Logo.tsx`): they are dark artwork on transparent backgrounds, so dark
  mode puts them on the `auth.logo.tile` tile. The `match` pins the exception to that one `_dark` block. The empty-state
  illustration in `ui/EmptyState.tsx` keeps a dark-mode `invert` filter for the same reason.
- **Sort carets** (`Members/index.tsx`): `lineHeight: '[0]'` collapses the stack's line box, and no line-height token is 0.
- **The typing indicator bounce** (`SupportChat/Messages.tsx`, `dotBounce`).

Recipes are scanned, but only for `pxSize`, `pxSpacing`, `pxFontSize`, `pxRadius` and `rawPalette`
(`RECIPE_CATEGORIES`): a recipe may use `_dark`, `white`/`black` and its own line heights. Not scanned at all: the theme
definition files (`EXCLUDED_FILES` in `style-inventory.ts`, checked by `system.test.ts` instead), tests and
`src/theme/test-themes/`. `src/theme/logoTones.ts` holds committed per-logo panel colours
on purpose; regenerate it with `scripts/logo-tones.mjs` and review each value on screen. Third-party brand colours (the
WhatsApp green is the `whatsapp.*` token) stay as the brand defines them.

To add an exception, add an entry with a reason. The test fails on an entry that excuses nothing (except a `categories: '*'` entry, which it does not check), so remove
it when the code goes.

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
hard category in the inventory and why `system.test.ts` checks every recipe in its `ALL_RECIPES` and every `{token.ref}` in the
semantic tokens.

## strictTokens and the `[value]` escape

`createAppSystem` in `src/theme/system.ts` sets `strictTokens: true`: style props accept only theme tokens, and `tsc`
rejects the rest. Use the token, including `0` and `auto`, which are spacing and sizes tokens
(`p='0'`, `mx='auto'`, `w='auto'`, `minW='0'`). The `[value]` escape is for a real one-off, a CSS value that is not a
design decision and has no token (`inherit`, `none`, `help`, a `calc()`):

```tsx
<Box lineHeight='[0]' cursor='[help]' w='[calc(100% - {sizes.8})]' />
```

Chakra 3.x types `[value]` but never unwraps it at runtime, so on its own it would emit the invalid
`line-height: [0]`. `src/theme/escapeHatch.ts` (`withEscapeHatch`, applied to the system at the end of
`createAppSystem` and to the stress system) unwraps it and still expands token references inside, as the `calc()` above
shows. The "escape hatch" tests in `system.test.ts` and `escapeHatch.test.tsx` pin both behaviours; check them before
touching the wrapper or upgrading Chakra.

`[12px]` is still a pixel size or spacing to the inventory: the rules apply to what is inside the brackets, so the
escape is not a way around the ratchet.

## The checks

| Check                                                 | Command                                             | In CI                                                                    |
| ----------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Types, including `strictTokens`                       | `pnpm lint`                                         | `Lint` step of `Build (dev)` / `Build (stg)`                             |
| Theme integrity (real tokens, no shared CSS variable) | `pnpm test src/theme/system.test.ts`                | `Test` step of the same jobs                                             |
| Style inventory                                       | `pnpm test src/theme/style-inventory.test.ts`       | `Test` step of the same jobs                                             |
| Stress theme                                          | `pnpm ui:snapshot -- --label stress --theme stress` | `Stress theme` job (any PR that touches what renders, whatever its base) |
| Accessibility (axe)                                   | `pnpm ui:snapshot -- --label a11y --a11y`           | `Accessibility (axe)` job (same trigger as `Stress theme`)               |
| Offline snapshot and diff                             | `pnpm ui:snapshot`, `pnpm ui:diff`                  | not run                                                                  |

The build jobs run on PRs to `develop`, `stage` and `d/**` only; on a PR to any other base (a stacked PR), run
`pnpm lint` and `pnpm test` yourself.

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
leak, lower the baseline with `pnpm ui:snapshot -- --label stress --theme stress --update-stress-baseline` (a `--routes` run
updates only its captures). An element that
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

Each run saves a full-page screenshot per route, viewport and colour mode in `.ui-snapshot/<label>/` (git-ignored),
which is where the before and after screenshots for a PR come from. Exit code 0 from `ui:diff` means no difference in the computed styles of any visible element; a difference you did not expect means
the change leaked outside its scope. A change meant to look different needs before and after screenshots in the PR
(light and dark, with and without `PRIMARY_COLOR`). `scripts/ui-snapshot/README.md` has the options, how determinism
works, how to add a route and the known limits (mock data only: no empty states, errors or other plans).

## Before opening a PR

- `pnpm lint` and `pnpm test` (the second includes the inventory and the theme integrity tests).
- A theme change: `pnpm chakra:typegen`, then a look at both colour modes.
- A UI change: the snapshot diff, and before and after screenshots for anything visible.
- A lowered ratchet count or stress leak: the updated baseline is in the commit.
