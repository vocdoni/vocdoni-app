import { Box, type ConditionalValue, Progress, useSlotRecipe, type ProgressRootProps } from '@chakra-ui/react'
import { quantity } from '~utils/numbers'

export type CensusRulerLayout = 'scale' | 'compact'

/** The props CensusRuler and TurnoutBar share: the bar, its scale and its look. */
export type RulerProps = {
  /** People who voted (or the highest per-question count for a question-by-question vote). */
  value: number
  /** The census or a question's electorate. Without one there is nothing to measure: the scale hides. */
  max?: number
  /** The bar's accessible name, e.g. "184 of 312 people voted, 59%". */
  label: string
  /** The vote is over: the fill in ink instead of the accent. */
  closed?: boolean
  /** `scale` (default) prints 0 and the total; `compact` is the bar alone, for strips and rows. Responsive:
   * `{ base: 'scale', lg: 'compact' }`. */
  layout?: ConditionalValue<CensusRulerLayout>
}

export type CensusRulerProps = Omit<ProgressRootProps, 'value' | 'max' | 'variant' | 'children'> & RulerProps

const share = (part: number, max?: number) => (max && max > 0 ? Math.min(Math.max((part / max) * 100, 0), 100) : 0)

/** A turnout bar with its scale: 0 and the total. */
export const CensusRuler = ({ value, max, label, closed = false, layout, ...props }: CensusRulerProps) => {
  const styles = useSlotRecipe({ key: 'censusRuler' })({ layout, closed })
  const percent = share(value, max)
  const start = '0'
  const total = max ? quantity(max) : ''

  return (
    <Progress.Root variant='turnout' value={percent} translations={{ value: () => label }} css={styles.root} {...props}>
      <Progress.Track css={styles.track}>
        <Progress.Range css={styles.range} />
      </Progress.Track>
      {!!max && (
        <Box css={styles.scale} aria-hidden data-part='scale'>
          <Box as='span' css={styles.start}>
            {start}
          </Box>
          <Box as='span' css={styles.end}>
            {total}
          </Box>
        </Box>
      )}
    </Progress.Root>
  )
}
