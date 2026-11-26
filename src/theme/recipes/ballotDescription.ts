import { defineRecipe } from '@chakra-ui/react'

// What an organiser wrote about a vote or a question, under its title on the voter page (conformance pass 2, N-2,
// N-3): the body size in the muted ink, every paragraph at the regular weight (Markdown sets its own), and no margin
// after the last one, which would add to the next block's own.
export const BallotDescription = defineRecipe({
  className: 'ballot-description',
  base: {
    textStyle: 'ballot-body',
    color: 'fg.muted',
    '& p': { fontWeight: 'normal' },
    '& p:last-of-type': { mb: '0' },
  },
})
