import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { checkboxAnatomy } from '@chakra-ui/react/anatomy'
import { solidEdge } from './solidEdge'

// 16px with a 1.5px `border.strong` outline; checked it fills with the palette and a contrast tick, edged when the fill
// is too pale for the page. Chakra's
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
    // The voter page's consent box: 22px, 4px corners, a 15px label.
    size: {
      sm: box,
      md: box,
      lg: box,
      ballot: {
        control: { boxSize: 'mark.ballot', p: '0', borderRadius: 'sm', '& svg': { boxSize: '3.5' } },
        label: { textStyle: 'ballot-hint' },
      },
    },
    variant: {
      solid: {
        control: {
          borderWidth: 'mark',
          borderColor: 'border.strong',
          bg: 'bg.panel',
          _dark: { bg: 'transparent' },
          '&:is([data-state=checked], [data-state=indeterminate])': {
            bg: 'colorPalette.solid',
            color: 'colorPalette.contrast',
            borderColor: 'colorPalette.solid',
            boxShadow: solidEdge,
          },
        },
      },
    },
  },
  // The voter's consent box rings like the ballot's marks (conformance pass 2, D-6): the mark shadow on a zero border,
  // as a 1.5px border paints 1px at DPR 1. Checked, the variant's own edge wins.
  compoundVariants: [
    {
      size: 'ballot',
      variant: 'solid',
      css: { control: { borderWidth: '[0]', boxShadow: 'mark.field' } },
    },
  ],
})
