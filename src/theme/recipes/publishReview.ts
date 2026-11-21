import { defineSlotRecipe } from '@chakra-ui/react'

// Inline padding shared by the header, both columns and the footer, so their edges line up.
const gutter = { base: '4', md: '8' } as const

// A short screen (a phone held sideways) gets the phone behaviour whatever its width: the fixed
// header would leave no room for the middle and push the footer out of the dialog
const shortScreen = '@media screen and (max-height: 40em)'

// From md up only the middle of a step scrolls; on a phone the whole step does, so the header
// scrolls away
const scrollArea = {
  flex: { base: 'none', md: '1 1 auto' },
  minH: '0',
  overflowY: { base: 'visible', md: 'auto' },
  overscrollBehavior: 'contain',
  [shortScreen]: { flex: 'none', overflowY: 'visible' },
} as const

/**
 * Layout of the publish dialog's steps. Dialog.Content's `review` size gives the frame, and the theme gives
 * the look; per-row looks are data attributes, since one step mixes several.
 */
export const PublishReview = defineSlotRecipe({
  className: 'publish-review',
  slots: [
    'root',
    'header',
    'topBar',
    'eyebrow',
    'close',
    'lead',
    'intro',
    'introGeneric',
    'columns',
    'column',
    'sectionTitle',
    'list',
    'questionItem',
    'questionNumber',
    'questionTitle',
    'factRow',
    'factLabel',
    'factValue',
    'factText',
    'factChange',
    'costRow',
    'cost',
    'costSkeleton',
    'costToggle',
    'costSummary',
    'costAction',
    'costPanel',
    'amounts',
    'amountRow',
    'footer',
    'footerNote',
    'actions',
    'body',
    'status',
    'progressItem',
    'publishedMark',
    'skeleton',
    'stripeField',
    'stripeMount',
    'secureNote',
  ],
  base: {
    // Fills Dialog.Content (a flex column capped at the viewport) and may shrink below its content,
    // so the middle part scrolls while the header and the footer stay in view
    root: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minW: '0',
      minH: '0',
      overflowY: { base: 'auto', md: 'visible' },
      [shortScreen]: { overflowY: 'auto' },
      color: 'fg',
      textStyle: 'body-sm',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      gap: '3',
      px: gutter,
      pt: { base: '4', md: '7' },
      pb: { base: '5', md: '6' },
    },
    topBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '3',
      minH: '8',
    },
    // The label above the lead, or the title itself on a step without one (Dialog.Title, see anatomy)
    eyebrow: {
      textStyle: 'body-sm',
      fontWeight: 'normal',
      color: 'fg.muted',
      _focus: { outline: 'none' },
    },
    // The corner close button, pulled into the padding so its icon lines up with the gutter
    close: {
      color: 'fg.muted',
      me: '-2',
    },
    // The step's sentence, the dialog's title: a section title on a phone, the page title from md up
    lead: {
      m: '0',
      textStyle: { base: 'section-title', md: 'page-title' },
      textWrap: 'pretty',
      _focus: { outline: 'none' },
    },
    intro: {
      m: '0',
      textStyle: 'body',
      maxW: '[65ch]',
      textWrap: 'pretty',
    },
    // Phones skip the generic sentence
    introGeneric: {
      display: { base: 'none', md: 'inline' },
    },
    // The scrolling middle of a step, like `body` and `status`. A grid, not a flex row: its row grows
    // with the taller column, so the hairline between them runs the whole scrolled height
    columns: {
      ...scrollArea,
      display: 'grid',
      gridTemplateColumns: { base: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
      alignContent: 'start',
      borderTopWidth: 'hairline',
      borderColor: 'border',
    },
    column: {
      minW: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '3',
      px: gutter,
      pt: '5',
      pb: '6',
      '& + &': {
        borderTopWidth: { base: 'hairline', md: '[0]' },
        borderLeftWidth: { base: '[0]', md: 'hairline' },
        borderColor: 'border',
      },
    },
    // Also the title of the cost breakdown (an h4): both are one heading role in the dialog
    sectionTitle: {
      m: '0',
      textStyle: 'body',
      fontWeight: 'semibold',
      // A second section in one column (the card step's billing details)
      '&:not(:first-of-type)': { mt: '2' },
    },
    // The numbered questions and the stages of a wait: both lists with no bullets
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3',
      m: '0',
      p: '0',
      listStyle: 'none',
    },
    questionItem: {
      display: 'flex',
      gap: '3',
    },
    questionNumber: {
      flex: '0 0 auto',
      minW: '4',
      color: 'fg.muted',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 'tall',
    },
    questionTitle: {
      display: 'block',
      textStyle: 'body',
      fontWeight: 'semibold',
      overflowWrap: 'anywhere',
    },
    factRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '3',
      px: '3.5',
      py: '2.5',
      '& + &': { borderTopWidth: 'hairline', borderColor: 'border' },
    },
    factLabel: {
      color: 'fg.muted',
      whiteSpace: 'nowrap',
    },
    factValue: {
      m: '0',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'flex-end',
      columnGap: '3',
      textAlign: 'end',
      '&[data-muted]': { color: 'fg.muted' },
    },
    factText: {
      minW: '0',
      overflowWrap: 'anywhere',
    },
    factChange: {
      flex: '0 0 auto',
      alignSelf: 'center',
    },
    // The frame around the cost disclosure; the disclosure fills it, so the whole box is the button
    costRow: {
      p: '0',
      _hover: { bg: 'state.hover.bg' },
    },
    cost: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '2',
      '&[data-error]': { alignItems: 'flex-start' },
    },
    costSkeleton: {
      h: '11',
      borderRadius: 'l3',
    },
    // The full-width row of the disclosure; "Review the details" drops under a long summary
    costToggle: {
      w: 'full',
      px: '3.5',
      py: '2.5',
      my: '0',
      minH: '11',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      columnGap: '3',
      rowGap: '1',
    },
    // Its natural width, so "Cost: €33.00" and "Review the details" share a line whenever they fit;
    // the row wraps only when they do not. The toggle is muted, the total is not
    costSummary: {
      flex: '1 1 auto',
      minW: '0',
      color: 'fg',
      fontWeight: 'semibold',
    },
    costAction: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      flex: '0 0 auto',
      fontWeight: 'semibold',
      '& svg': { _motionSafe: { transitionProperty: '[transform]', transitionDuration: 'fast' } },
      '&[data-open] svg': { transform: 'rotate(180deg)' },
    },
    // The breakdown under the disclosure; the sunken box of its amounts is the only fill
    costPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2',
      pt: '2',
    },
    // The sunken box of the pay steps and of the cost breakdown
    amounts: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      m: '0',
      px: '4',
      py: '3.5',
      bg: 'surface.inset',
      borderRadius: 'l3',
      fontVariantNumeric: 'tabular-nums',
    },
    amountRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '3',
      color: 'fg.muted',
      '& > :last-child': { whiteSpace: 'nowrap', m: '0' },
      '&[data-ruled]': { mt: '0.5', pt: '2', borderTopWidth: 'hairline', borderColor: 'border' },
      '&[data-strong]': { color: 'fg', fontWeight: 'semibold' },
      '&[data-muted]': { color: 'fg.muted' },
    },
    footer: {
      display: 'flex',
      flexDirection: { base: 'column', md: 'row' },
      flexWrap: { base: 'nowrap', md: 'wrap' },
      alignItems: { base: 'stretch', md: 'center' },
      justifyContent: 'space-between',
      gap: { base: '3.5', md: '6' },
      mt: 'auto',
      flexShrink: 0,
      position: { base: 'sticky', md: 'relative' },
      [shortScreen]: { position: 'sticky' },
      bottom: '0',
      zIndex: 'contents',
      px: gutter,
      pt: { base: '4', md: '4.5' },
      // Clear of the home indicator when the page runs edge to edge
      pb: { base: '[max({spacing.6}, env(safe-area-inset-bottom))]', md: '5' },
      bg: 'bg.subtle',
      borderTopWidth: 'hairline',
      borderColor: 'border',
      borderBottomRadius: { base: 0, md: 'inherit' },
      // A soft edge above the footer while content is scrolled under it (set by PublishReviewStep)
      _before: {
        content: '""',
        position: 'absolute',
        insetInline: '0',
        bottom: '[100%]',
        h: '6',
        pointerEvents: 'none',
        bgGradient: 'to-t',
        gradientFrom: 'scroll.edge',
        gradientTo: 'transparent',
        opacity: '[0]',
        _motionSafe: { transitionProperty: '[opacity]', transitionDuration: 'fast' },
      },
      '&[data-covering]::before': { opacity: '[1]' },
    },
    footerNote: {
      flex: { base: '0 0 auto', md: '1 1 15rem' },
      minW: '0',
      m: '0',
      color: 'fg.muted',
      _empty: { display: 'none' },
      // A refused card, shown where Pay was clicked
      '&:has([data-tone=error])': { color: 'fg.error' },
    },
    actions: {
      display: 'flex',
      gap: { base: '2', md: '2.5' },
      ms: { base: '0', md: 'auto' },
    },
    // A wait or an outcome is about as tall as the summary, so the dialog keeps its size between steps
    body: {
      ...scrollArea,
      minH: { base: '0', md: 'publish-review.step' },
      [shortScreen]: { ...scrollArea[shortScreen], minH: '0' },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '4',
      px: gutter,
      pb: '6',
    },
    status: {
      ...scrollArea,
      minH: { base: '0', md: 'publish-review.step' },
      [shortScreen]: { ...scrollArea[shortScreen], minH: '0' },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4',
      px: gutter,
      pt: '4',
      pb: '10',
      textAlign: 'center',
      textStyle: 'body',
      '& > p': { m: '0' },
    },
    progressItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '2.5',
      '&[data-state=done]': { colorPalette: 'success', color: 'fg.muted' },
      '&[data-state=done] svg': { boxSize: 'icon.md', color: 'colorPalette.fg' },
    },
    publishedMark: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSize: '12',
      borderRadius: 'full',
      colorPalette: 'success',
      bg: 'colorPalette.subtle',
      color: 'colorPalette.fg',
      '& svg': { boxSize: 'icon.lg' },
    },
    // Stand-ins for what Stripe renders once loaded, sized like it
    skeleton: {
      display: 'block',
      w: 'full',
      borderRadius: 'l2',
      '&[data-kind=lead]': { h: '8', maxW: 'sm' },
      '&[data-kind=amounts]': { h: '12' },
      '&[data-kind=field]': { h: '40', borderRadius: 'l3' },
    },
    // A Stripe element mounts hidden, laid out at its final width, under the skeleton that holds its place
    stripeField: {
      position: 'relative',
    },
    stripeMount: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3',
      '.publish-review__stripeField:not([data-ready]) > &': {
        position: 'absolute',
        top: '0',
        insetInline: '0',
        visibility: 'hidden',
      },
    },
    secureNote: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '2',
      m: '0',
      '& > svg': { flex: '0 0 auto', boxSize: 'icon.sm', mt: '0.5' },
    },
  },
})
