import { defineTextStyles } from '@chakra-ui/react'

// App text roles, next to Chakra's own `2xs`…`7xl` and `label` (the field label), which keep their names.
// Roles hold typography only: colour stays a separate prop, because a textStyle and a prop setting the
// same property resolve in prop order (and chakra memoizes that per sorted key set), so never pass both.
export const textStyles = defineTextStyles({
  body: { value: { fontSize: 'md', lineHeight: 'moderate' } },
  'body-sm': { value: { fontSize: 'sm', lineHeight: 'moderate' } },
  caption: { value: { fontSize: 'xs', lineHeight: 'moderate' } },
  // Small labels over a figure or a group. Fil has no uppercase: size and weight carry the role.
  eyebrow: { value: { fontSize: 'xs', lineHeight: 'moderate', fontWeight: 'medium' } },
  'page-title': {
    value: {
      fontSize: { base: 'page', md: '2xl' },
      lineHeight: { base: 'page.touch', md: 'page' },
      fontWeight: 'semibold',
      letterSpacing: { base: 'heading.page.touch', md: 'heading.page' },
    },
  },
  // Card, section and settings-block titles (ui/SectionHeader), a step below the page title: 15px up to `lg`.
  'section-title': {
    value: {
      fontSize: { base: 'item', lg: 'control' },
      lineHeight: 'moderate',
      fontWeight: 'semibold',
      letterSpacing: 'body',
    },
  },
  // Public process and organisation names.
  display: {
    value: {
      fontSize: { base: '3xl', md: '4xl' },
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.page',
    },
  },
  // A control's text. The line height is that of Chakra's `sm` style, which its control recipes read. No weight:
  // typed values and option labels are regular; buttons and field labels set 550 in their recipes.
  control: { value: { fontSize: 'control', lineHeight: 'moderate' } },
  // `control` on a touch screen: 15px on a phone, 14px on a tablet, the desktop size from `lg` (buttons, menu rows).
  'control-touch': { value: { fontSize: { base: 'item', md: 'md', lg: 'control' }, lineHeight: 'moderate' } },
  // The same for what is typed (fields, selects): 16px on a phone, so iOS Safari does not zoom on focus.
  'control-input': { value: { fontSize: { base: 'lg', md: 'md', lg: 'control' }, lineHeight: 'moderate' } },
  // A filter chip: 14px up to `lg`.
  'control-chip': { value: { fontSize: { base: 'md', lg: 'control' }, lineHeight: 'moderate' } },
  // A tab's label: 15px up to `lg`, in the body's tracking.
  'control-tab': {
    value: { fontSize: { base: 'item', lg: 'control' }, lineHeight: 'moderate', letterSpacing: 'body' },
  },
  // Numerals, dates, counts and codes, in the mono family at the small size.
  figure: { value: { fontFamily: 'figure', fontSize: 'xs', letterSpacing: 'none' } },
  // The sector over a featured quote (auth showcase).
  'quote-label': { value: { fontSize: 'xs', lineHeight: 'moderate', fontWeight: 'medium' } },
  // The short label between the two rules of a LabelledSeparator ("or continue with").
  'separator-label': { value: { fontSize: 'xs', lineHeight: 'moderate', fontWeight: 'medium' } },
  // A process status shown as a headline (the voting aside).
  'status-title': { value: { fontSize: 'xl', fontWeight: 'semibold' } },
  // A member's role shown from its raw value (`admin`), capitalised like the badge `label` variant.
  'role-name': { value: { fontWeight: 'semibold', textTransform: 'capitalize' } },
  // A row's title in a list (a vote), a question's title in a vote's card, and the larger title of an empty page.
  'item-title': {
    value: {
      fontSize: { base: 'lg', md: 'item' },
      lineHeight: { base: 'row.touch', md: 'row.title' },
      fontWeight: 'semibold',
      letterSpacing: 'heading.row',
    },
  },
  'question-title': {
    value: {
      fontSize: { base: 'lg', md: 'item' },
      lineHeight: { base: 'row.touch', md: 'row.question' },
      fontWeight: 'semibold',
      letterSpacing: 'heading.row',
    },
  },
  'feature-title': {
    value: {
      fontSize: { base: 'feature', lg: 'xl' },
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.section',
    },
  },
  // A vote's page title.
  'vote-title': {
    value: {
      fontSize: { base: 'vote', md: '2xl' },
      lineHeight: { base: 'page.touch', md: 'page' },
      fontWeight: 'semibold',
      letterSpacing: 'heading.page',
    },
  },
  // A confirm dialog's title (ui/ConfirmDialog) and a bottom sheet's: 17px on a phone and a tablet, the page size
  // with the page's tracking from `lg`.
  'dialog-title': {
    value: {
      fontSize: { base: 'sheet', lg: 'page' },
      lineHeight: { base: 'short', md: '[1.45]', lg: '[1.15]' },
      fontWeight: 'semibold',
      letterSpacing: { base: 'heading.item', md: 'body', lg: 'heading.page' },
    },
  },
  // What a confirm dialog says will happen: 15px on a phone, 14px from `md`.
  'dialog-body': { value: { fontSize: { base: 'item', md: 'md' }, lineHeight: '[1.45]', letterSpacing: 'body' } },
  // The line over a bar ("184 of 312 voted", ui/TurnoutBar): 14px, 13.5px from `lg`, medium-plus.
  'bar-caption': {
    value: { fontSize: { base: 'md', lg: 'control' }, lineHeight: '[1.45]', fontWeight: 'medium-plus' },
  },
  // Secondary text of a list row (dates, counts, who and where), on the row's fixed line; `note` is the quiet line
  // under a question's title in a vote's card, on the running line height.
  meta: { value: { fontSize: { base: 'md', md: 'sm' }, lineHeight: { base: 'row.meta-touch', md: 'row.meta' } } },
  note: { value: { fontSize: { base: 'md', md: 'sm' }, lineHeight: 'moderate' } },
  // A question's number at the start of its row, in figures on the question title's line.
  'question-number': {
    value: { fontFamily: 'figure', fontSize: 'sm', lineHeight: 'row.question', letterSpacing: 'none' },
  },
  // The line beside the headline figure ("184 of 312 voted").
  'hero-caption': {
    value: { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium-plus', letterSpacing: 'heading.row' },
  },
  // The headline of the card that says where a vote stands ("Vote ended with 184 votes").
  'state-title': {
    value: { fontSize: 'xl', lineHeight: 'shorter', fontWeight: 'semibold', letterSpacing: 'heading.section' },
  },
  // A fact's value under its label on a phone or tablet (dataList `summary`).
  'fact-value': { value: { fontSize: 'fact', lineHeight: 'fact' } },
  // The one headline figure of a screen and its unit (Stat size `hero`). Sans, not mono: mono is for small data.
  'figure-hero': {
    value: {
      fontSize: { base: 'figure.small', md: 'figure.large', lg: 'figure.hero' },
      lineHeight: 'hero',
      fontWeight: 'semibold',
      letterSpacing: 'figure.hero',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  'figure-hero-unit': {
    value: {
      fontSize: { base: '3xl', md: '5xl' },
      lineHeight: 'hero',
      fontWeight: 'medium',
      letterSpacing: 'figure.unit',
    },
  },
})

// Heading sizes of user-written content by Markdown level, shared by the editor and the rendered Markdown.
export const proseHeadingSizes = { h1: '2xl', h2: 'xl', h3: 'lg', h4: 'md', h5: 'md', h6: 'md' } as const
