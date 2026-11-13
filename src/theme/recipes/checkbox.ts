import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { checkboxAnatomy } from '@chakra-ui/react/anatomy'

// 16px with a 1.5px `border.strong` outline; checked it fills with the palette and a contrast tick. Chakra's
// 20px `md` and 24px `lg` draw the same 16px box, so call sites keep their size prop.
const box: Record<string, SystemStyleObject> = { control: { boxSize: '4', p: '0' }, label: { textStyle: 'control' } }

export const checkbox = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    label: {
      fontWeight: 'normal',
    },
  },
  variants: {
    size: { sm: box, md: box, lg: box },
    variant: {
      solid: {
        control: {
          borderWidth: 'mark',
          borderColor: 'border.strong',
          bg: 'bg.panel',
          '&:is([data-state=checked], [data-state=indeterminate])': {
            bg: 'colorPalette.solid',
            color: 'colorPalette.contrast',
            borderColor: 'colorPalette.solid',
          },
        },
      },
    },
  },
})
