import { defineSlotRecipe } from '@chakra-ui/react'
import { radioCardAnatomy } from '@chakra-ui/react/anatomy'
import { chosenEdge } from './solidEdge'

// Merged over Chakra's radioCard. Its 0.64 description opacity leaves fg.muted at 3.17:1 on white (needs 4.5:1).
// The full slot list stays: arrays are replaced on merge, and a shorter one drops the other slots' styles.
// Unchecked a 1px `border.emphasized`; checked the palette's 1px border over an `accent.subtle` fill, with the hairline
// outside it when the colour is too pale for the page (`solid.edge`).
export const RadioCard = defineSlotRecipe({
  slots: radioCardAnatomy.keys(),
  base: {
    itemDescription: { opacity: '[1]' },
  },
  variants: {
    variant: {
      outline: {
        item: {
          borderWidth: 'hairline',
          borderColor: 'border.emphasized',
          bg: 'bg.panel',
          _checked: {
            borderColor: 'colorPalette.solid',
            bg: 'accent.subtle',
            boxShadow: chosenEdge(),
            // In dark the border is the text step, which reads on the page by itself.
            _dark: { borderColor: 'colorPalette.fg', boxShadow: '[none]' },
          },
        },
      },
    },
  },
})
