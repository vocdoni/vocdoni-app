import { defineSlotRecipe } from '@chakra-ui/react'
import { spreadsheetAccessAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  button: {
    w: 'full',
  },
  disconnect: {
    bg: 'transparent',
    border: 'none',
    _hover: {
      textDecoration: 'underline',
      _disabled: {
        color: 'button.variant.common.disabled.color.light',
        _dark: {
          color: 'button.variant.common.disabled.color.dark',
        },
      },
    },
    _disabled: {
      color: 'button.variant.common.disabled.color.light',
      _dark: {
        color: 'button.variant.common.disabled.color.dark',
      },
    },
    _dark: {
      color: 'white',
    },
  },
  close: {
    display: 'none',
  },
  control: { mb: 5 },
}

export const SpreadsheetAccess = defineSlotRecipe({
  slots: spreadsheetAccessAnatomy,
  base: baseStyle,
})
