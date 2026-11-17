import { defineSlotRecipe } from '@chakra-ui/react'

// The phone's bottom action bar of a question-by-question vote (board M4VoteOne): fixed to the screen, padded for the
// home indicator, with the active question's name over its buttons (equal parts: the buttons grow). Phone only: from `md` the buttons
// stay in the question's row. `page` goes on the page around it and keeps the content clear of the bar.
// The voter page's action bar (ui/ActionBar) is the `ballot` variant, with the `primary`, `secondary` and `credit` slots.
export const QuestionDock = defineSlotRecipe({
  slots: ['page', 'root', 'line', 'title', 'note', 'actions', 'primary', 'secondary', 'credit'],
  base: {
    page: {
      '&:has([data-scope="question-dock"][data-part="root"])': {
        pb: { base: '[calc({spacing.dock} + env(safe-area-inset-bottom))]', md: '0' },
      },
    },
    root: {
      display: { base: 'flex', md: 'none' },
      flexDirection: 'column',
      gap: '2.5',
      position: 'fixed',
      insetX: '0',
      bottom: '0',
      zIndex: 'sticky',
      pt: '3',
      px: '4',
      pb: '[calc({spacing.4} + env(safe-area-inset-bottom))]',
      bg: 'surface.card',
      borderTopWidth: 'hairline',
      borderColor: 'border.emphasized',
    },
    line: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '3',
      textStyle: 'body',
    },
    title: { minW: '0', fontWeight: 'semibold', truncate: true },
    note: { flexShrink: 0, color: 'fg.subtle' },
    actions: { display: 'flex', gap: '2' },
  },
  variants: {
    variant: {
      // The voter's action bar: fixed to the bottom below `md`, 20px sides, its note on a row of its own above the
      // buttons, the main action growing and the "made with Vocdoni" credit under them, 4px clear of the buttons and
      // padded for the home indicator. From `md` a row in the flow, 32px under the content, the note after the buttons
      // and no credit (the voter shell prints it at the page's foot). The shell keeps its column clear of the bar.
      ballot: {
        root: {
          display: 'flex',
          position: { base: 'fixed', md: 'static' },
          flexDirection: { base: 'column', md: 'row' },
          alignItems: { base: 'stretch', md: 'center' },
          gap: { base: '2.5', lg: '3' },
          mt: { base: '0', md: '8' },
          px: { base: '5', md: '0' },
          pt: { base: '3', md: '0' },
          pb: { base: '[calc({spacing.1} + env(safe-area-inset-bottom))]', md: '0' },
          bg: { base: 'surface.card', md: 'transparent' },
          borderTopWidth: { base: 'hairline', md: '0' },
          borderColor: 'border',
        },
        note: {
          order: { base: -1, md: 0 },
          flexShrink: 1,
          minW: '0',
          ms: { base: '0', md: '2' },
          textStyle: 'body',
          color: 'fg.subtle',
        },
        actions: { gap: { base: '2.5', lg: '3' }, flexShrink: 0 },
        primary: { display: 'grid', flex: { base: '1 1 0', md: '0 0 auto' }, minW: '0' },
        secondary: { display: 'grid', flex: '0 0 auto' },
        credit: {
          display: { base: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          h: 'ballot.credit',
          mt: '-1.5',
        },
      },
    },
  },
})
