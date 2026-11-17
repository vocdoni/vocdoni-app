import { defineSlotRecipe } from '@chakra-ui/react'

// The phone's bottom action bar of a question-by-question vote (board M4VoteOne): fixed to the screen, padded for the
// home indicator, with the active question's name over its buttons (equal parts: the buttons grow). Phone only: from `md` the buttons
// stay in the question's row. `page` goes on the page around it and keeps the content clear of the bar.
export const QuestionDock = defineSlotRecipe({
  slots: ['page', 'root', 'line', 'title', 'note', 'actions'],
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
      borderColor: 'border.strong',
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
})
