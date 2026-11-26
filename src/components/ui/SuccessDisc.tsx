import { Box, Icon, useSlotRecipe } from '@chakra-ui/react'
import { CheckIcon } from '~theme/icons'
import { SuccessDisc as successDiscRecipe } from '~theme/recipes/voterMarks'

/** The green disc over "Vot emès": decoration only, the title beside it says what happened. */
export const SuccessDisc = () => {
  const styles = useSlotRecipe({ recipe: successDiscRecipe })()
  return (
    <Box as='span' css={styles.root} aria-hidden data-part='success-disc'>
      <Icon as={CheckIcon} css={styles.icon} />
    </Box>
  )
}
