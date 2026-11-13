import { defineSlotRecipe } from '@chakra-ui/react'
import { radioCardAnatomy } from '@chakra-ui/react/anatomy'

// Merged over Chakra's radioCard. Its 0.64 description opacity leaves fg.muted at 3.17:1 on white (needs 4.5:1).
// The full slot list stays: arrays are replaced on merge, and a shorter one drops the other slots' styles.
// Unchecked a 1px `border.emphasized`; checked the palette's 1px border over an `accent.subtle` fill.
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
          _checked: { borderColor: 'colorPalette.solid', bg: 'accent.subtle', boxShadow: '[none]' },
        },
      },
    },
  },
})
