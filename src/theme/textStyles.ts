import { defineTextStyles } from '@chakra-ui/react'

// App text roles, next to Chakra's own `2xs`…`7xl` and `label` (the field label), which keep their names.
// Roles hold typography only: colour stays a separate prop, because a textStyle and a prop setting the
// same property resolve in prop order (and chakra memoizes that per sorted key set), so never pass both.
export const textStyles = defineTextStyles({
  body: { value: { fontSize: 'md', lineHeight: 'moderate' } },
  // Emphasis inside a body paragraph (a bold word in a legal notice): the weight only, the size comes from the text.
  'body-strong': { value: { fontWeight: 'semibold' } },
  'body-sm': { value: { fontSize: 'sm', lineHeight: 'moderate' } },
  caption: { value: { fontSize: 'xs', lineHeight: 'moderate' } },
  // Small labels over a figure or a group. Fil has no uppercase: size and weight carry the role.
  eyebrow: { value: { fontSize: 'xs', lineHeight: 'moderate', fontWeight: 'medium' } },
  'page-title': {
    value: {
      fontSize: { base: 'page', md: '2xl' },
      lineHeight: { base: 'page.touch', lg: 'page' },
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
  // `control` on a touch screen: 15px on a phone, 14px on a tablet, the desktop size from `lg` (buttons, menu rows,
  // what a vote's state card says under its headline).
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
  // A row's title in a list (a vote), a question's title in a vote's card in every state, and the larger title of an
  // empty page.
  'item-title': {
    value: {
      fontSize: { base: 'lg', md: 'item' },
      lineHeight: { base: 'row.touch', md: 'row.title' },
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
      lineHeight: { base: 'page.touch', lg: 'page' },
      fontWeight: 'semibold',
      letterSpacing: { base: 'heading.section', lg: 'heading.page' },
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
  // Secondary text of a list row (dates, counts, who and where) and the quiet line under a question's title in a
  // vote's card, on the row's fixed line.
  meta: { value: { fontSize: { base: 'md', md: 'sm' }, lineHeight: { base: 'row.meta-touch', md: 'row.meta' } } },
  // A question's number at the start of its row, in figures on the question title's line.
  'question-number': {
    value: {
      fontFamily: 'figure',
      fontSize: 'sm',
      lineHeight: { base: 'row.touch', md: 'row.title' },
      letterSpacing: 'none',
    },
  },
  // The headline sentence of a vote's turnout card ("184 of 312 people have voted, 59%."): 22px on a phone, 28px on a
  // tablet, 34px from `lg`.
  'turnout-headline': {
    value: {
      fontSize: { base: 'vote', md: '2xl', lg: 'headline' },
      lineHeight: 'headline',
      fontWeight: 'semibold',
      letterSpacing: { base: 'heading.page.touch', md: 'heading.page' },
    },
  },
  // The line under it (the time left, the pause, the results): 16px on a phone, 20px from `lg`.
  'turnout-line': {
    value: {
      fontSize: { base: 'lg', md: 'feature', lg: 'xl' },
      lineHeight: 'short',
      fontWeight: 'medium',
      letterSpacing: 'heading.line',
    },
  },
  // The voter page (docs/ui-guidelines.md, "Voter page"). Every role is set in the voter's tracking on the running
  // line height unless it says otherwise; a role with no weight is regular, or takes the weight its recipe sets.
  // A question's title, the same at every width.
  'ballot-title': {
    value: {
      fontSize: 'ballot.question',
      lineHeight: 'question',
      fontWeight: 'semibold',
      letterSpacing: 'heading.question',
    },
  },
  // The line over a title ("Pregunta 1 de 4", "Últim pas").
  'ballot-kicker': { value: { fontSize: 'md', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' } },
  // The line under the title on the welcome screen ("La junta et convoca a votar...").
  'ballot-lead': { value: { fontSize: 'ballot.lead', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // The page's running text: a question's help, a field's value, an agenda row; the voter shell's root.
  'ballot-body': { value: { fontSize: 'lg', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // A hint under the options, a notice, a receipt row, the count line, a consent line.
  'ballot-hint': { value: { fontSize: 'item', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // A field's label.
  'ballot-label': { value: { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' } },
  // A voter button's label; the button recipe sets its weight (600, 550 for the secondary).
  'ballot-button': { value: { fontSize: 'ballot.option', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // The vote's title over the strip (15px) and atop the rail from `lg` (17px).
  'ballot-rail-title': {
    value: {
      fontSize: { base: 'item', lg: 'ballot.option' },
      lineHeight: 'short',
      fontWeight: 'semibold',
      letterSpacing: 'heading.item',
    },
  },
  // A quiet line in the vote's head: 13px, 14px from `lg`.
  'ballot-rail-meta': { value: { fontSize: { base: 'sm', lg: 'md' }, lineHeight: 'moderate', letterSpacing: 'voter' } },
  // The strip's label over the progress line ("Pregunta 2 de 4").
  'ballot-progress': {
    value: { fontSize: 'sm', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' },
  },
  // A status line: live, paused, cancelled, closed (Status size `ballot`).
  'ballot-status': {
    value: { fontSize: 'ballot.status', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' },
  },
  // A review row's value: 16px, 17px from `lg`.
  'ballot-row-value': {
    value: {
      fontSize: { base: 'lg', lg: 'ballot.option' },
      lineHeight: 'moderate',
      fontWeight: 'medium-plus',
      letterSpacing: 'voter',
    },
  },
  // A phase while the vote is sent (ui/PhaseList); the current one turns semibold in its recipe.
  'ballot-phase': { value: { fontSize: 'ballot.option', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // The open question's title in its card on a question-by-question vote.
  'ballot-open-title': {
    value: { fontSize: 'vote', lineHeight: 'open-question', fontWeight: 'semibold', letterSpacing: 'heading.open' },
  },
  // The line over a bar ("172 de 312 han votat"), and the points left.
  'ballot-caption': {
    value: { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium-plus', letterSpacing: 'voter' },
  },
  // A question's title over its results.
  'ballot-result-title': {
    value: { fontSize: 'ballot.option', lineHeight: 'short', fontWeight: 'semibold', letterSpacing: 'heading.item' },
  },
  // Figures, in the mono family: a one-time code's digit, a points value, a rank, a step's number, a receipt code
  // (all in the voter's tracking), and an agenda number or a share (`ballot-code`, no tracking).
  'ballot-code-digit': {
    value: { fontFamily: 'figure', fontSize: 'ballot.code', lineHeight: 'moderate', letterSpacing: 'voter' },
  },
  'ballot-rank': { value: { fontFamily: 'figure', fontSize: 'item', lineHeight: 'moderate', letterSpacing: 'voter' } },
  'ballot-figure': { value: { fontFamily: 'figure', fontSize: 'xs', lineHeight: 'moderate', letterSpacing: 'voter' } },
  // A fold's count in the agenda's badge ("+4"): the figure at 11px, no tracking.
  'ballot-figure-fold': {
    value: { fontFamily: 'figure', fontSize: 'ballot.fold', lineHeight: 'moderate', letterSpacing: 'none' },
  },
  'ballot-receipt': { value: { fontFamily: 'figure', fontSize: 'sm', lineHeight: 'moderate', letterSpacing: 'voter' } },
  'ballot-code': { value: { fontFamily: 'figure', fontSize: 'sm', lineHeight: 'moderate', letterSpacing: 'none' } },
  // The voter's top bar: the organisation's name, its links ("Surt") and the language tag (on a 22px line).
  'topbar-name': {
    value: { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium-plus', letterSpacing: 'heading.row' },
  },
  'topbar-link': { value: { fontSize: 'md', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' } },
  'topbar-lang': { value: { fontSize: 'sm', lineHeight: 'row.touch', fontWeight: 'medium', letterSpacing: 'voter' } },
})

// Heading sizes of user-written content by Markdown level, shared by the editor and the rendered Markdown.
export const proseHeadingSizes = { h1: '2xl', h2: 'xl', h3: 'lg', h4: 'md', h5: 'md', h6: 'md' } as const
