import { defineRecipe } from '@chakra-ui/react'

// A choice set apart under a ballot's answers (board V4VoterWideLive 2, "No votar aquesta pregunta"): 22px below the
// answers, the light rule, 16px under it, in the hint's 15px.
export const BallotAside = defineRecipe({
  className: 'ballot-aside',
  base: {
    mt: 'ballot.aside',
    pt: '4',
    borderTopWidth: 'hairline',
    borderColor: 'border.muted',
    textStyle: 'ballot-hint',
  },
})
