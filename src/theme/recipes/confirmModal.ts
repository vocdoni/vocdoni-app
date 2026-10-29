import { defineSlotRecipe } from '@chakra-ui/react'
import { confirmAnatomy } from '~theme/react-components/anatomy/election'

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
    bg: 'destructive.alt.solid',
    color: 'destructive.contrast',
    _hover: { bg: 'destructive.alt.hover' },
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
