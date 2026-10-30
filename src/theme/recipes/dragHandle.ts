import { defineRecipe } from '@chakra-ui/react'

// Styles of ui/DragHandle. It sets `data-dragging` while the item is held, which swaps the cursor.
export const dragHandle = defineRecipe({
  base: {
    color: 'fg.subtle',
    cursor: 'grab',
    _hover: {
      color: 'fg.muted',
    },
    _dragging: {
      cursor: 'grabbing',
    },
  },
  variants: {
    // Where it sits: beside the content, top-aligned or centred, or over the corner of a grid card.
    placement: {
      start: {
        display: 'flex',
        alignItems: 'flex-start',
        pt: 2,
      },
      center: {
        display: 'flex',
        alignItems: 'center',
      },
      corner: {
        position: 'absolute',
        top: 2,
        left: 2,
        zIndex: 'contents',
        p: 1,
        borderRadius: 'md',
        _hover: {
          bg: 'state.hover.bg',
        },
      },
    },
  },
})
