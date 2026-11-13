import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { radioGroupAnatomy } from '@chakra-ui/react/anatomy'

// 16px circle with a 1.5px `border.strong` outline; checked, a 5px ring of the palette around a white centre.
// Chakra's `md` and `lg` draw the same 16px, so call sites keep their size prop.
const box: Record<string, SystemStyleObject> = { itemControl: { boxSize: '4' }, item: { textStyle: 'control' } }

export const RadioGroup = defineSlotRecipe({
  slots: radioGroupAnatomy.keys(),
  variants: {
    size: { sm: box, md: box, lg: box },
    variant: {
      solid: {
        itemControl: {
          borderWidth: '[1.5px]',
          borderColor: 'border.strong',
          bg: 'bg.panel',
          _checked: {
            borderWidth: '[5px]',
            borderColor: 'colorPalette.solid',
            bg: 'bg.panel',
            color: 'colorPalette.solid',
          },
          // The stock dot would paint inside the ring; the thick border is the mark.
          '& .dot': { display: 'none' },
        },
      },
    },
  },
})
