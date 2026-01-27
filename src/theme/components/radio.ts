import { radioGroupAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const sm = {
  itemControl: {
    width: 4,
    height: 4,

    _checked: {
      _disabled: {
        borderWidth: 6,
      },
    },
  },
}

const md = {
  itemControl: {
    width: 5,
    height: 5,

    _checked: {
      _disabled: {
        borderWidth: 7,
      },
    },
  },
}

export const Radio = defineSlotRecipe({
  slots: radioGroupAnatomy.keys(),
  variants: {
    size: {
      sm,
      md,
    },
  },
  defaultVariants: {
    colorPalette: 'black',
  },
})
