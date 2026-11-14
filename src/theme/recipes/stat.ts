import { statAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

// Figures and labelled values (`Stat`), merged over chakra's own stat recipe: a quiet label over
// the value, with an optional faint unit after it. The number stays sans: mono is for small data only.
export const Stat = defineSlotRecipe({
  slots: statAnatomy.keys(),
  base: {
    label: {
      textStyle: 'caption',
      color: 'fg.subtle',
    },
    valueText: {
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 'semibold',
      letterSpacing: 'tight',
      alignItems: 'baseline',
    },
    valueUnit: {
      textStyle: 'body-sm',
      color: 'fg.subtle',
    },
  },
  variants: {
    size: {
      // A labelled field, such as a date on a card.
      sm: { valueText: { textStyle: 'body-sm', fontWeight: 'normal' } },
      md: { valueText: { textStyle: 'body' } },
      // A headline figure.
      lg: { valueText: { textStyle: '2xl' } },
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})
