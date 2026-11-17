import { defineSlotRecipe } from '@chakra-ui/react'
import { pinInputAnatomy } from '@chakra-ui/react/anatomy'

// Merged into Chakra's pin input recipe, whose sizes, variants and defaults stay as they are: every pin input the app
// already draws (CSP/Step1 at `lg`, Auth/Verify at the default) keeps its look. The voter's one-time code takes
// `variant='field'` and `size='ballot'`.
export const PinInput = defineSlotRecipe({
  slots: pinInputAnatomy.keys(),
  variants: {
    size: {
      // 56 by 64 boxes 10px apart (48 by 58, 8px apart, below `md`), 12px corners, the digit in mono at 26px.
      ballot: {
        control: { gap: { base: '2', md: '2.5' } },
        input: {
          '--input-height': { base: 'sizes.ballot.code.height.touch', md: 'sizes.ballot.code.height' },
          w: { base: 'ballot.code.width.touch', md: 'ballot.code.width' },
          minW: { base: 'ballot.code.width.touch', md: 'ballot.code.width' },
          px: '0',
          borderRadius: 'xl',
          textStyle: 'ballot-code-digit',
        },
      },
    },
    variant: {
      // The app's field look: a panel with the field ring. The box being typed in draws a 2px ring of the palette's
      // focus colour inside its edge (3:1 on the page for any brand); a failed code the error ring.
      field: {
        input: {
          bg: 'bg.panel',
          color: 'fg',
          borderWidth: '[0]',
          boxShadow: 'shadow.field',
          _focus: { boxShadow: '[inset 0 0 0 {borderWidths.thick} {colors.colorPalette.focusRing}]' },
          _invalid: { boxShadow: 'shadow.invalid' },
        },
      },
    },
  },
})
