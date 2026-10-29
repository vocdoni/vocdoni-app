import { defineSlotRecipe } from '@chakra-ui/react'
import { emptyStateAnatomy } from '@chakra-ui/react/anatomy'

// Merged into chakra's emptyState recipe. ui/EmptyState uses no Content slot: the root is the stack.
// Each size restates what chakra's same size sets (padding, text styles), which would win over `base`.
export const EmptyState = defineSlotRecipe({
  slots: emptyStateAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    indicator: {
      color: 'fg.muted',
    },
    description: {
      color: 'fg.muted',
    },
  },
  variants: {
    size: {
      // One muted line inside a table or list.
      sm: {
        root: { px: 0, py: 0, gap: 3 },
        title: { fontSize: 'sm', lineHeight: 1.5, fontWeight: 'normal', color: 'fg.muted' },
        description: { fontSize: 'sm', lineHeight: 1.5 },
      },
      // Inside a card or panel, which gives the padding: an icon or illustration, a title and a call to action.
      md: {
        root: { px: 0, py: 0, gap: 3 },
        indicator: { _icon: { boxSize: 12 } },
        title: { fontSize: 'lg', lineHeight: 1.5, fontWeight: 'bold' },
        description: { fontSize: 'md', lineHeight: 1.5 },
      },
    },
  },
})
