import { Box, useRecipe } from '@chakra-ui/react'
import { RankBadge as rankBadgeRecipe } from '~theme/recipes/voterMarks'

export type RankBadgeProps = {
  /** The position: given ("1", "2"), or the next free one on an option not ranked yet. */
  value: string
  /** The voter ranked this option: the badge fills with the vote's colour. */
  set?: boolean
}

/** The rank before an option of a ranked question (the voter's QuestionRankChoice slot). */
export const RankBadge = ({ value, set = false }: RankBadgeProps) => {
  const styles = useRecipe({ recipe: rankBadgeRecipe })({ set })
  return (
    <Box as='span' css={styles} data-set={set ? '' : undefined} aria-hidden>
      {value}
    </Box>
  )
}
