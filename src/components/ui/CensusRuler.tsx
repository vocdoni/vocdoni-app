import { Box, Progress, useSlotRecipe, type ProgressRootProps } from '@chakra-ui/react'
import { quantity } from '~utils/numbers'

export type CensusRulerProps = Omit<ProgressRootProps, 'value' | 'max' | 'variant' | 'children'> & {
  /** People who voted (or the highest per-question count for a question-by-question vote). */
  value: number
  /** The census or a question's electorate. Without one there is nothing to measure: the scale hides. */
  max?: number
  /** The bar's accessible name, e.g. "184 of 312 people voted, 59%". */
  label: string
  /** Print the count under the end of the fill. */
  marker?: boolean
}

// Hide an end label when the count would sit on top of it.
const EDGE = 12

/** A turnout bar with its scale: 0, the count under the fill and the total (spec F). */
export const CensusRuler = ({ value, max, label, marker = false, ...props }: CensusRulerProps) => {
  const styles = useSlotRecipe({ key: 'censusRuler' })()
  const percent = max && max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <Progress.Root variant='turnout' value={percent} translations={{ value: () => label }} w='full' {...props}>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
      {!!max && (
        <Box css={styles.scale} aria-hidden>
          {(!marker || percent > EDGE) && (
            <Box as='span' css={styles.start}>
              0
            </Box>
          )}
          {marker && (
            <Box as='span' css={styles.marker} insetStart={`[${percent}%]`} transform={`[translateX(-${percent}%)]`}>
              {quantity(value)}
            </Box>
          )}
          {(!marker || percent < 100 - EDGE) && (
            <Box as='span' css={styles.end}>
              {quantity(max)}
            </Box>
          )}
        </Box>
      )}
    </Progress.Root>
  )
}
