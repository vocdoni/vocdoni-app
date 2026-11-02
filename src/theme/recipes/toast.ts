import { defineSlotRecipe } from '@chakra-ui/react'
import { toastAnatomy } from '@chakra-ui/react/anatomy'

// Merged over Chakra's toast. Its 0.8 description opacity leaves white on red.solid at 3.53:1 (needs 4.5:1).
// The full slot list stays: arrays are replaced on merge, and a shorter one drops the other slots' styles.
export const Toast = defineSlotRecipe({
  slots: toastAnatomy.keys(),
  base: {
    description: { opacity: '[1]' },
  },
})
