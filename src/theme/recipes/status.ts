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
      letterSpacing: 'none',
      whiteSpace: 'nowrap',
    },
    indicator: {
      width: 'dot',
      height: 'dot',
    },
  },
  variants: {
    // Chakra's sizes set the text style; the 20px line height is restated after it. `sm` (ProcessStatus) is 13px
    // up to `lg` and 12px from `lg`, as the guide's state labels.
    size: {
      // On a touch screen the 13px word sits on the running line, as the boards'.
      sm: { root: { fontSize: { base: 'sm', lg: 'xs' }, lineHeight: { base: 'moderate', lg: '[1.25rem]' } } },
      md: { root: { lineHeight: '[1.25rem]' } },
      lg: { root: { lineHeight: '[1.25rem]' } },
    },
    tone: {
      success: { root: { color: 'status.success.fg' }, indicator: { bg: 'status.success.solid' } },
      warning: { root: { color: 'status.warning.fg' }, indicator: { bg: 'status.warning.fg' } },
      danger: { root: { color: 'status.error.fg' }, indicator: { bg: 'status.error.fg' } },
      gray: { root: { color: 'fg.muted' }, indicator: { bg: 'fg.subtle' } },
      // Ready: ink dot and word, set to go but not started.
      ink: { root: { color: 'fg' }, indicator: { bg: 'fg' } },
      // Nothing happening yet (a draft, a question to open, a voided one): a hollow ring.
      hollow: {
        root: { color: 'fg.muted' },
        indicator: { bg: 'transparent', boxShadow: '[inset 0 0 0 {borderWidths.mark} {colors.fg.subtle}]' },
      },
    },
  },
  defaultVariants: { tone: 'gray' },
})
