import { Box, Progress, useSlotRecipe } from '@chakra-ui/react'
import { StepProgress as stepProgressRecipe } from '~theme/recipes/steps'

export type StepProgressProps = {
  /** "Pregunta 2 de 4", "Revisió", "Pregunta 3 de 4, oberta ara": shown, announced when it changes, and the line's name. */
  label: string
  /** Questions reached, the one on screen included; the review counts as `total`. */
  value: number
  /** Questions in the vote. With one there is nothing to show. */
  total: number
}

/**
 * The strip's step progress below `lg` (VoterShell `progress`): the label over a 3px line in the vote's colour on the
 * strip's bottom rule, as long as the share of questions reached. Nothing for a one-question vote.
 */
export const StepProgress = ({ label, value, total }: StepProgressProps) => {
  const styles = useSlotRecipe({ recipe: stepProgressRecipe })()
  if (total <= 1) return null
  const reached = Math.min(Math.max(value, 0), total)
  return (
    <>
      <Box as='span' css={styles.label} aria-live='polite'>
        {label}
      </Box>
      <Progress.Root
        variant='line'
        value={reached}
        max={total}
        translations={{ value: () => label }}
        css={styles.bar}
        aria-hidden
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </>
  )
}
