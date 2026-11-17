import { Card, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { quantity } from '~utils/numbers'

export type QuestionsHeaderProps = {
  headingId: string
  total: number
  /** "2 closed, 1 open and 1 to open", or the word for none. */
  counts: string
  /** "Next step: close question 3", or nothing. */
  next?: string | null
}

// One line from `lg`, cut with an ellipsis when it runs out of room.
const truncateFromLg = {
  whiteSpace: { lg: 'nowrap' },
  overflow: { lg: 'hidden' },
  textOverflow: { lg: 'ellipsis' },
} as const

/**
 * The questions card's title line: the title, how many, the counts and the next step. From `lg` one 44px line with
 * the next step at its end; below `lg` the counts at the end of the line and the next step on a line of its own.
 */
export const QuestionsHeader = ({ headingId, total, counts, next }: QuestionsHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Card.Header
      flexDirection='row'
      flexWrap={{ base: 'wrap', lg: 'nowrap' }}
      alignItems={{ base: 'baseline', lg: 'center' }}
      columnGap={{ base: '3', lg: '2' }}
      rowGap={{ base: '1', lg: '2' }}
      h={{ lg: '11' }}
      pt={{ base: '3.5', lg: '0' }}
      pb={{ base: '3', lg: '0' }}
    >
      <Heading as='h2' id={headingId} textStyle='section-title' flexShrink={0}>
        {t('process.questions', { defaultValue: 'Questions' })}
      </Heading>
      <Text textStyle={{ base: 'body', lg: 'figure' }} color='fg.subtle'>
        {quantity(total)}
      </Text>
      {counts && (
        <Text
          textStyle={{ base: 'body', lg: 'body-sm' }}
          color='fg.subtle'
          ms={{ base: 'auto', lg: '1.5' }}
          textAlign={{ base: 'end', lg: 'start' }}
          minW='0'
          {...truncateFromLg}
        >
          {counts}
        </Text>
      )}
      {/* From `lg`, when the line is short, the next step gives way first (it truncates long before the counts do). */}
      {next && (
        <Text
          textStyle={{ base: 'body', lg: 'body-sm' }}
          color='fg.subtle'
          ms={{ lg: 'auto' }}
          minW='0'
          flexBasis={{ base: 'full', lg: 'auto' }}
          flexShrink={100}
          title={next}
          {...truncateFromLg}
        >
          {next}
        </Text>
      )}
    </Card.Header>
  )
}
