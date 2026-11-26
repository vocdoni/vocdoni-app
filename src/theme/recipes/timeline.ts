import { defineRecipe } from '@chakra-ui/react'

// A timeline's dot: filled in the accent where the vote is now, a hollow ring for the rest. Its size and position are
// the caller's.
export const TimelineMark = defineRecipe({
  base: {
    borderRadius: 'full',
    borderWidth: 'mark',
    borderColor: 'fg.faint',
  },
  variants: {
    variant: {
      current: { bg: 'accent.line', borderWidth: '[0]' },
      hollow: { bg: 'transparent' },
    },
  },
  defaultVariants: { variant: 'hollow' },
})

// The thread that runs from one timeline mark down to the next.
export const TimelineThread = defineRecipe({
  base: {
    borderInlineStartWidth: 'hairline',
    borderColor: 'border.emphasized',
  },
})
