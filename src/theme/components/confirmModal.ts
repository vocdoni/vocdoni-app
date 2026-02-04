import { defineSlotRecipe } from '@chakra-ui/react'
import { confirmAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
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
}

const danger = {
  confirm: {
    bg: 'red.600',
    _dark: { bg: 'red.800' },
    color: 'white',
    _hover: { bg: 'red.700', _dark: { bg: 'red.900' } },
  },
}

const neutral = {
  confirm: {},
}

export const ConfirmModal = defineSlotRecipe({
  slots: confirmAnatomy,
  base: baseStyle,
  variants: {
    variant: { danger, neutral },
  },
  defaultVariants: { variant: 'danger' },
})
