import { statAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

// Figures and labelled values (`Stat`), merged over chakra's own stat recipe. Figures keep the font's
// own letter spacing: chakra tightens them.
export const Stat = defineSlotRecipe({
  slots: statAnatomy.keys(),
  base: {
    valueText: {
      letterSpacing: '[normal]',
    },
  },
})
