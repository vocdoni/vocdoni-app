import { Card, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { quantity } from '~utils/numbers'

export type QuestionsHeaderProps = {
  headingId: string
  total: number
  /** "2 closed · 1 open · 1 to open" (with commas below `lg`), or the touch boards' word for none. */
  counts: string
  /** "Next step: close question 3", or nothing. Desktop only. */
  next?: string | null
  desktop: boolean
}

/**
 * The questions card's title line. From `lg` one 44px line: the title, how many, the counts and the next step at the
 * end. Below `lg` the title with the counts at the end of the line (M4VoteOne).
 */
export const QuestionsHeader = ({ headingId, total, counts, next, desktop }: QuestionsHeaderProps) => {
  const { t } = useTranslation()
  const heading = (
    <Heading as='h2' id={headingId} textStyle='section-title' flexShrink={0}>
      {t('process.questions', { defaultValue: 'Questions' })}
    </Heading>
  )

  if (!desktop) {
    return (
      <Card.Header flexDirection='row' alignItems='baseline' justifyContent='space-between' gap='3' pt='3.5' pb='3'>
        {heading}
        {counts && (
          <Text textStyle='body' color='fg.subtle' textAlign='end'>
            {counts}
          </Text>
        )}
      </Card.Header>
    )
  }

  return (
    <Card.Header flexDirection='row' alignItems='center' gap='2' h='11' py='0'>
      {heading}
      <Text textStyle='figure' color='fg.subtle'>
        {quantity(total)}
      </Text>
      {counts && (
        <Text textStyle='note' color='fg.subtle' ms='1.5' truncate>
          {counts}
        </Text>
      )}
      {/* When the line is short the next step gives way first (it truncates long before the counts do). */}
      {next && (
        <Text textStyle='note' color='fg.subtle' ms='auto' minW='0' flexShrink={100} truncate title={next}>
          {next}
        </Text>
      )}
    </Card.Header>
  )
}
