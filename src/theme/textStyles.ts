import { defineTextStyles } from '@chakra-ui/react'

/**
 * Shared text styles. Apply with `textStyle="..."`.
 *
 * - `tabular`: tabular (monospaced) figures for any dynamically updating numbers —
 *   vote counts, timers, list indices — so digits don't cause horizontal jitter.
 */
export const textStyles = defineTextStyles({
  tabular: {
    value: {
      fontVariantNumeric: 'tabular-nums',
    },
  },
})

export default textStyles
