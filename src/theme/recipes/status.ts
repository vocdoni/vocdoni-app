import { defineSlotRecipe } from '@chakra-ui/react'
import { statusAnatomy } from '@chakra-ui/react/anatomy'

// A state is a dot and a word, never a filled pill. Colour is meaning: the dot and word are green for live or done,
// amber for something to fix, red for rejected, grey for everything else. `tone` is the meaning, because the
// dot and the word use different steps of the same hue and `gray` has no status roles.
export const Status = defineSlotRecipe({
  slots: statusAnatomy.keys(),
  base: {
    root: {
      gap: '1.5',
      fontWeight: 'medium',
      whiteSpace: 'nowrap',
    },
    indicator: {
      // 7px; no size token is that small.
      width: '[calc({sizes.1} * 1.75)]',
      height: '[calc({sizes.1} * 1.75)]',
    },
  },
  variants: {
    // Chakra's sizes set the text style; the 20px line height is restated after it.
    size: {
      sm: { root: { lineHeight: '[1.25rem]' } },
      md: { root: { lineHeight: '[1.25rem]' } },
      lg: { root: { lineHeight: '[1.25rem]' } },
    },
    tone: {
      success: { root: { color: 'status.success.fg' }, indicator: { bg: 'status.success.solid' } },
      warning: { root: { color: 'status.warning.fg' }, indicator: { bg: 'status.warning.fg' } },
      danger: { root: { color: 'status.error.fg' }, indicator: { bg: 'status.error.fg' } },
      gray: { root: { color: 'fg.muted' }, indicator: { bg: 'fg.subtle' } },
    },
  },
  defaultVariants: { tone: 'gray' },
})
