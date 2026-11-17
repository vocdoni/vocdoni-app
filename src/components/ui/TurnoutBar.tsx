import { Flex, Stack, Text, type StackProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { CensusRuler, type RulerProps } from './CensusRuler'

export type TurnoutBarProps = RulerProps &
  Omit<StackProps, 'children'> & {
    /** The visible line over the bar, e.g. "184 of 312 voted" (a quieter note may follow inside it). */
    caption: ReactNode
    /** The share that voted, already formatted ("59%"), at the end of the caption line. */
    share?: ReactNode
  }

/**
 * "184 of 312 voted" and its share over a CensusRuler, with the same ruler props: a live vote's row, an open
 * question. The caption sits 8px over the track below `lg` and 6px over the ruler's box from `lg`.
 */
export const TurnoutBar = ({
  caption,
  share,
  value,
  max,
  label,
  closed,
  layout,
  ...props
}: TurnoutBarProps) => (
  <Stack gap={{ base: '2', lg: '1.5' }} minW='0' {...props}>
    <Flex justify='space-between' align='baseline' gap='3'>
      <Text textStyle='bar-caption' minW='0'>
        {caption}
      </Text>
      {share !== undefined && (
        <Text textStyle='figure' color='fg.subtle'>
          {share}
        </Text>
      )}
    </Flex>
    <CensusRuler {...{ value, max, label, closed, layout }} />
  </Stack>
)
