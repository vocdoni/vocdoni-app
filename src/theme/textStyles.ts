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
    value: { fontSize: '2xl', lineHeight: 'short', fontWeight: 'semibold', letterSpacing: 'heading.page' },
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
    value: { fontSize: 'lg', lineHeight: 'short', fontWeight: 'semibold', letterSpacing: 'heading.item' },
  },
  'feature-title': {
    value: { fontSize: 'xl', lineHeight: 'short', fontWeight: 'semibold', letterSpacing: 'heading.section' },
  },
  // The one headline figure of a screen and its unit (Stat size `hero`). Sans, not mono: mono is for small data.
  'figure-hero': {
    value: {
      fontSize: { base: '6xl', md: 'figure.hero' },
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
