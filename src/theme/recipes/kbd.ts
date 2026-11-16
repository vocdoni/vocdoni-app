import { defineRecipe } from '@chakra-ui/react'

// A keyboard shortcut shown next to the control it triggers (ui/KeyHint): a small ringed key in the interface face.
export const Kbd = defineRecipe({
  variants: {
    variant: {
      hint: {
        fontFamily: 'body',
        fontWeight: 'medium',
        color: 'fg.subtle',
        bg: 'bg.panel',
        borderRadius: 'xs',
        boxShadow: 'shadow.control',
        minW: '4.5',
        justifyContent: 'center',
      },
    },
  },
  defaultVariants: { variant: 'hint' },
})
