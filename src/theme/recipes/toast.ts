import { defineSlotRecipe } from '@chakra-ui/react'
import { toastAnatomy } from '@chakra-ui/react/anatomy'

// A toast is a raised neutral card; only its leading icon carries the status colour. Chakra paints success, warning
// and error as solid fills, so each type is restated here. The full slot list stays: arrays are replaced on merge,
// and a shorter one drops the other slots' styles.
const plain = (indicator: string) => ({
  bg: 'surface.raised',
  color: 'fg',
  '--toast-trigger-bg': 'colors.bg.muted',
  '--toast-border-color': 'colors.border',
  '--toast-indicator': indicator,
})

export const Toast = defineSlotRecipe({
  slots: toastAnatomy.keys(),
  base: {
    description: { opacity: '[1]' },
    // Chakra's 60% leaves the X faint; 80% reads on the raised surface.
    closeTrigger: { color: '[{currentColor/80}]' },
    indicator: { color: 'var(--toast-indicator, currentColor)' },
    root: {
      ...plain('colors.fg.muted'),
      borderRadius: 'l2',
      boxShadow: 'shadow.raised',
      '&[data-type=success]': plain('colors.status.success.fg'),
      '&[data-type=warning]': plain('colors.status.warning.fg'),
      '&[data-type=error]': plain('colors.status.error.fg'),
      '&[data-type=info]': plain('colors.status.info.fg'),
    },
  },
})
