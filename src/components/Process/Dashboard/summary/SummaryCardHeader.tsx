import { Card, Flex, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { quantity } from '~utils/numbers'

type SummaryCardHeaderProps = {
  /** The h2's id, so the card can be named by it. */
  id: string
  title: ReactNode
  /** How many rows follow: next to the title on the desktop, at the end of the line on a phone or tablet. */
  count?: number
  /** A quiet note, desktop only: after the count, or at the end of the line with `noteAtEnd`. */
  note?: ReactNode
  noteAtEnd?: boolean
  /** A link at the end of the line; on a phone or tablet it takes the count's place. */
  action?: ReactNode
  desktop: boolean
}

/**
 * The title line of a Resum card, as the boards draw it: one 44px line on the desktop (title, count in figures, note,
 * link), a roomier line with the count or the link at its end on a phone or tablet.
 */
export const SummaryCardHeader = ({ id, title, count, note, noteAtEnd, action, desktop }: SummaryCardHeaderProps) => {
  const heading = (
    <Heading as='h2' id={id} textStyle='section-title'>
      {title}
    </Heading>
  )

  if (!desktop) {
    return (
      <Card.Header pt='3.5' pb='3'>
        <Flex align='baseline' justify='space-between' gap='3'>
          {heading}
          {action ??
            (count !== undefined && (
              <Text textStyle='body' color='fg.subtle'>
                {quantity(count)}
              </Text>
            ))}
        </Flex>
      </Card.Header>
    )
  }

  return (
    <Card.Header py='0'>
      <Flex align='center' gap='2' minH='11'>
        {heading}
        {count !== undefined && (
          <Text textStyle='figure' color='fg.subtle'>
            {quantity(count)}
          </Text>
        )}
        {note && (
          <Text textStyle='body-sm' color='fg.subtle' whiteSpace='nowrap' ms={noteAtEnd ? 'auto' : '1.5'}>
            {note}
          </Text>
        )}
        {action && (
          <Flex ms='auto' whiteSpace='nowrap'>
            {action}
          </Flex>
        )}
      </Flex>
    </Card.Header>
  )
}
