import { defineSlotRecipe } from '@chakra-ui/react'
import { alertAnatomy } from '@chakra-ui/react/anatomy'

// Merged into chakra's alert recipe, whose `status`, `variant` and `size` stay as they are. `layout`
// is the alert's shape; chakra's `md` size already gives the inline padding (px 4, py 4).
export const Alert = defineSlotRecipe({
  slots: alertAnatomy.keys(),
  variants: {
    layout: {
      // An alert among the page's content.
      inline: {},
      // Edge-to-edge strip above the page (announcements).
      banner: { root: { borderRadius: 0 } },
      // A single line with an action beside it.
      compact: { root: { py: 3 } },
      // A status panel with a title, several lines and its own close button.
      panel: { root: { px: 6, py: 6 } },
    },
  },
  defaultVariants: {
    layout: 'inline',
  },
})
