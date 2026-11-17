import { defineSlotRecipe } from '@chakra-ui/react'
import { fieldAnatomy } from '@chakra-ui/react/anatomy'

// The label sits 6px above its control (the root's `gap`, as Chakra's own); help is `sm` and quiet, errors are red.
export const Field = defineSlotRecipe({
  slots: fieldAnatomy.keys(),
  base: {
    label: { textStyle: 'control', fontWeight: 'medium-plus' },
    helperText: { textStyle: 'sm', color: 'fg.subtle' },
    errorText: { textStyle: 'sm', color: 'status.error.fg' },
  },
  variants: {
    // The voter's field: its label at 15px, medium (`ballot-label`). The input takes `size='ballot'`.
    size: {
      ballot: { label: { textStyle: 'ballot-label', fontWeight: 'medium' } },
    },
  },
})
