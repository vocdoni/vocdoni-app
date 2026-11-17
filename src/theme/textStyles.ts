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
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.page',
    },
  },
  // Card, section and settings-block titles (ui/SectionHeader), a step below the page title.
  'section-title': { value: { fontSize: 'control', lineHeight: 'short', fontWeight: 'semibold' } },
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
  control: { value: { fontSize: 'control', lineHeight: '[1.25rem]' } },
  // `control` on a touch screen: 15px on a phone, 14px on a tablet, the desktop size from `lg` (buttons, menu rows).
  'control-touch': { value: { fontSize: { base: 'item', md: 'md', lg: 'control' }, lineHeight: '[1.25rem]' } },
  // The same for what is typed (fields, selects): 16px on a phone, so iOS Safari does not zoom on focus.
  'control-input': { value: { fontSize: { base: 'lg', md: 'md', lg: 'control' }, lineHeight: '[1.25rem]' } },
  // A filter chip: 14px up to `lg`.
  'control-chip': { value: { fontSize: { base: 'md', lg: 'control' }, lineHeight: '[1.25rem]' } },
  // A tab's label: 15px up to `lg`.
  'control-tab': { value: { fontSize: { base: 'item', lg: 'control' }, lineHeight: '[1.25rem]' } },
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
  // A row's title in a list (a vote), and the larger title of the row a list promotes (the live vote).
  'item-title': {
    value: {
      fontSize: { base: 'lg', md: 'item' },
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.item',
    },
  },
  'feature-title': {
    value: {
      fontSize: { base: 'feature', md: 'xl' },
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.section',
    },
  },
  // A vote's page title.
  'vote-title': {
    value: {
      fontSize: { base: 'vote', md: '2xl' },
      lineHeight: 'short',
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
  // Secondary text of a row (dates, counts, who and where): a step under the body on a phone.
  meta: { value: { fontSize: { base: 'md', md: 'sm' }, lineHeight: 'moderate' } },
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
