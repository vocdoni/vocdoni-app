import { statAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

// Figures and labelled values (`Stat`), merged over chakra's own stat recipe: a muted eyebrow label over
// the value, with an optional muted unit after it. Figures keep the font's own letter spacing (chakra
// tightens them).
export const Stat = defineSlotRecipe({
  slots: statAnatomy.keys(),
  base: {
    label: {
      textStyle: 'eyebrow',
      color: 'fg.muted',
    },
    valueText: {
      fontWeight: 'bold',
      letterSpacing: '[normal]',
      alignItems: 'baseline',
    },
    valueUnit: {
      textStyle: 'body-sm',
      color: 'fg.muted',
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
