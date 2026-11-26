import { Box, useRecipe, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { BallotDescription } from '~theme/recipes/ballotDescription'

/** What the organiser wrote about the vote (`VoterMedia`) or a question (`QuestionBody`), in one look. */
export const VoterDescription = ({ children, mt }: { children: ReactNode } & Pick<BoxProps, 'mt'>) => {
  const styles = useRecipe({ recipe: BallotDescription })()
  return (
    <Box css={styles} mt={mt}>
      {children}
    </Box>
  )
}
