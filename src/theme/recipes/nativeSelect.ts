import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { nativeSelectAnatomy } from '@chakra-ui/react/anatomy'
import { field, mobileSafeFontSize } from './form'

// A native select is a field: the input's panel, ring and outside focus ring, at the shared control height
// whatever the size prop. Chakra's other variants keep their own looks.
const size: Record<string, SystemStyleObject> = {
  root: {
    '--select-field-height': { base: 'sizes.control.touch', md: 'sizes.control.tablet', lg: 'sizes.control.md' },
  },
  field: { textStyle: 'control', ...mobileSafeFontSize, borderRadius: 'l2', ps: '3', pe: '8' },
}

export const NativeSelect = defineSlotRecipe({
  slots: nativeSelectAnatomy.keys(),
  variants: {
    variant: { outline: { field } },
    size: { xs: size, sm: size, md: size, lg: size, xl: size },
  },
})
