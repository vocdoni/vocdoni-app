import { dialogAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  backdrop: {
    bgColor: 'rgba(0 ,0 ,0, 0.8)',
  },
  positioner: {
    alignItems: 'center',
  },
  content: {
    overflow: 'hidden',
    bgColor: 'chakra.body.bg',
    border: '1px solid',
    borderColor: 'table.border',
  },
  footer: {
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    fontWeight: 'normal',
    fontSize: 'sm',
    color: 'texts.subtle',
    '& > *': {
      fontSize: 'lg',
      color: 'texts.primary',
      m: 0,
    },
  },
}

export const Dialog = defineSlotRecipe({
  slots: dialogAnatomy.keys(),
  base: baseStyle,
  variants: {
    variant: {
      'pricing-modal': {
        header: {
          mt: 8,
          textAlign: 'center',
          color: 'white',
          fontSize: '2xl',
        },
        closeTrigger: {
          top: { base: 2.5, md: 12 },
          right: { base: 2.5, md: 12 },
          color: 'white',
          '& svg': {
            width: 6,
            height: 6,
          },
        },
      },
    },
  },
})
