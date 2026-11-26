import { Box, useRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { BallotAside as ballotAsideRecipe } from '~theme/recipes/ballotAside'

/** A choice set apart under a ballot's answers by the light rule (board V4VoterWideLive 2). */
export const BallotAside = ({ children }: { children: ReactNode }) => {
  const styles = useRecipe({ recipe: ballotAsideRecipe })()
  return <Box css={styles}>{children}</Box>
}
