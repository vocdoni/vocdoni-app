import { Flex, Stack, Text, type StackProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { CensusRuler, type CensusRulerProps } from './CensusRuler'

export type TurnoutBarProps = Pick<CensusRulerProps, 'value' | 'max' | 'label' | 'marker'> &
  Omit<StackProps, 'children'> & {
    /** The visible line over the bar, e.g. "184 of 312 voted". */
    caption: ReactNode
    /** The share that voted, already formatted ("59%"), at the end of the caption line. */
    share?: ReactNode
  }

/** "184 of 312 voted" and its share over a turnout bar with its scale: a live vote's row, an open question. */
export const TurnoutBar = ({ caption, share, value, max, label, marker, ...props }: TurnoutBarProps) => (
  <Stack gap='2' minW='0' {...props}>
    <Flex justify='space-between' align='baseline' gap='3'>
      <Text textStyle='control' fontWeight='medium-plus' minW='0'>
        {caption}
      </Text>
      {share !== undefined && (
        <Text textStyle='figure' color='fg.subtle'>
          {share}
        </Text>
      )}
    </Flex>
    <CensusRuler value={value} max={max} label={label} marker={marker} />
  </Stack>
)
