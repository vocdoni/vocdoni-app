import { defineRecipe } from '@chakra-ui/react'

// The line under a card's rows (a hint, a note on what the card shows): a hairline over it and small muted text.
// Its layout (padding, height, alignment) stays with the caller.
export const Footnote = defineRecipe({
  base: {
    borderTopWidth: 'hairline',
    borderColor: 'border',
    textStyle: 'body-sm',
    color: 'fg.subtle',
  },
  variants: {
    variant: {
      // A solid grey rule, quieter than the card's own hairline (a line under a card's sections, not its rows).
      muted: {
        borderColor: 'border.muted',
      },
    },
  },
})
