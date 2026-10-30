import { defineSlotRecipe } from '@chakra-ui/react'

// Styles of ui/Loader's PageLoader, read by import: a spinner and its label, centred in the space
// the page would fill.
export const PageLoader = defineSlotRecipe({
  slots: ['root', 'spinner'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      flexGrow: 0,
      boxSize: 'full',
      minH: '[300px]',
    },
    spinner: {
      mr: '3',
    },
  },
})
