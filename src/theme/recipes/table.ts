import { defineSlotRecipe } from '@chakra-ui/react'
import { tableAnatomy } from '@chakra-ui/react/anatomy'

export const Table = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  base: {
    caption: {
      p: 4,
    },
  },
  variants: {
    // Opt-in: Chakra's own `interactive` hover reads the color palette, not the shared state tokens.
    rowStates: {
      true: {
        row: {
          _hover: {
            bg: 'state.hover.bg',
          },
          _selected: {
            bg: 'state.selected.bg',
            color: 'state.selected.fg',
          },
        },
      },
    },
  },
})
