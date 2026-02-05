import { checkboxAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

export const DetailedCheckbox = defineSlotRecipe({
  slots: ['icon', 'title', 'badge', 'description', 'checkbox'],
  base: {
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      fontWeight: 'bold',
      fontSize: 'sm',
    },
    badge: {
      position: 'absolute',
      top: '.9rem',
      right: '.9rem',
    },
    description: {
      textAlign: 'start',
      fontSize: 'sm',
    },
  },
})

export const Checkbox = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    control: {
      minW: '18px',
      height: '18px',
      borderRadius: '4px',
    },
  },
  variants: {
    variant: {
      detailed: {
        root: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          border: '1px solid',
          borderColor: 'checkbox.detailed.border',
          borderRadius: 'lg',
        },
        control: {
          position: 'absolute',
          right: '1rem',
          top: '1rem',
        },
        label: {
          fontSize: 'sm',
          alignSelf: 'start',
        },
      },
    },
  },
  defaultVariants: {
    colorPalette: 'brand',
  },
})
