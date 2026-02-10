import { createMultiStyleConfigHelpers, StyleFunctionProps } from '@chakra-ui/react'
import { spreadsheetAccessAnatomy } from '@vocdoni/chakra-components'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(spreadsheetAccessAnatomy)

const baseStyle = definePartsStyle((props: StyleFunctionProps) => {
  const { theme } = props
  const btn = theme.components?.Button

  const buttonVariant = 'solid'
  const colorScheme =
    props.colorScheme ?? btn?.defaultProps?.colorScheme ?? import.meta.env.BUTTON_COLOR_SCHEME ?? 'black'

  const variantDef = btn.variants[buttonVariant]({ ...props, colorScheme })

  return {
    button: {
      ...variantDef,
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

    input: { mb: 5 },
  }
})

export const SpreadsheetAccess = defineMultiStyleConfig({
  baseStyle,
})
