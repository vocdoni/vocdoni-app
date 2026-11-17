import { Card, Flex, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { quantity } from '~utils/numbers'

type SummaryCardHeaderProps = {
  /** The h2's id, so the card can be named by it. */
  id: string
  title: ReactNode
  /** How many rows follow: next to the title, or at the end of the line below `lg` when there is no note there. */
  count?: number
  /** A quiet note: after the count, or at the end of the line with `noteAtEnd`. */
  note?: ReactNode
  noteAtEnd?: boolean
}

/**
 * The title line of a Resum card, as the boards draw it: one 44px line from `lg` (title, count in figures, note), a
 * roomier line below it with the count at its end.
 */
export const SummaryCardHeader = ({ id, title, count, note, noteAtEnd }: SummaryCardHeaderProps) => (
  <Card.Header pt={{ base: '3.5', lg: '0' }} pb={{ base: '3', lg: '0' }}>
    <Flex align={{ base: 'baseline', lg: 'center' }} gap={{ base: '3', lg: '2' }} minH={{ lg: '11' }}>
      <Heading as='h2' id={id} textStyle='section-title'>
        {title}
      </Heading>
      {count !== undefined && (
        <Text
          textStyle={{ base: 'body', lg: 'figure' }}
          color='fg.subtle'
          // At the end of the line below `lg`, unless a note takes the end.
          ms={note && noteAtEnd ? undefined : { base: 'auto', lg: '0' }}
        >
          {quantity(count)}
        </Text>
      )}
      {note && (
        <Text
          textStyle={{ base: 'body', lg: 'body-sm' }}
          color='fg.subtle'
          whiteSpace='nowrap'
          ms={noteAtEnd ? 'auto' : '1.5'}
        >
          {note}
        </Text>
      )}
    </Flex>
  </Card.Header>
)
