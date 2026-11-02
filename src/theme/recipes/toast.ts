import { defineSlotRecipe } from '@chakra-ui/react'
import { toastAnatomy } from '@chakra-ui/react/anatomy'

// Merged over Chakra's toast. Its 0.8 description opacity leaves white on red.solid at 3.53:1 (needs 4.5:1), and its
// success and warning fills leave white at 3.30 and 3.56, so those two use darker toast.* tokens.
// The full slot list stays: arrays are replaced on merge, and a shorter one drops the other slots' styles.
export const Toast = defineSlotRecipe({
  slots: toastAnatomy.keys(),
  base: {
    description: { opacity: '[1]' },
    // Chakra's 60% leaves the X at 2.51:1 on the error toast; 80% is 3.5 or more on every type.
    closeTrigger: { color: '[{currentColor/80}]' },
    root: {
      '&[data-type=success]': { bg: 'toast.success.bg' },
      '&[data-type=warning]': { bg: 'toast.warning.bg' },
    },
  },
})
