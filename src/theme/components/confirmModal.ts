import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { confirmAnatomy } from '~components/vocdoni-ui'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(confirmAnatomy)

const baseStyle = definePartsStyle({
  header: {
    fontWeight: 'extrabold',
    fontSize: 'lg',
  },

  close: { display: 'none' },

  footer: {
    justifyContent: 'flex-end',
  },

  cancel: {
    border: '1px solid',
    borderColor: 'table.border',
  },
})

const danger = definePartsStyle({
  confirm: {
    bg: 'red.600',
    _dark: { bg: 'red.800' },
    color: 'white',
    _hover: { bg: 'red.700', _dark: { bg: 'red.900' } },
  },
})

const neutral = definePartsStyle({
  confirm: {},
})

export const ConfirmModal = defineMultiStyleConfig({
  baseStyle,
  variants: { danger, neutral },
  defaultProps: { variant: 'danger' },
})
