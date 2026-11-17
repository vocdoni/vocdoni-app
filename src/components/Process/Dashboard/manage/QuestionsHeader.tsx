import { Card, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { quantity } from '~utils/numbers'

export type QuestionsHeaderProps = {
  headingId: string
  total: number
  /** "2 closed · 1 open · 1 to open", empty before the start and once voided. */
  counts: string
  /** "Next step: close question 3", or nothing. */
  next?: string | null
}

/**
 * The questions card's one 44px line from `lg`: the title, how many, the counts and the next step at the end. The
 * phone and tablet boards draw the card without it (the band over it carries the counts); the heading stays the
 * card's accessible name.
 */
export const QuestionsHeader = ({ headingId, total, counts, next }: QuestionsHeaderProps) => {
  const { t } = useTranslation()
  return (
    <Card.Header display={{ base: 'none', lg: 'flex' }} flexDirection='row' alignItems='center' gap='2' h='11' py='0'>
      <Heading as='h2' id={headingId} textStyle='section-title' flexShrink={0}>
        {t('process.questions', { defaultValue: 'Questions' })}
      </Heading>
      <Text textStyle='figure' color='fg.subtle'>
        {quantity(total)}
      </Text>
      {counts && (
        <Text textStyle='meta' color='fg.subtle' ms='1.5' truncate>
          {counts}
        </Text>
      )}
      {next && (
        <Text textStyle='meta' color='fg.subtle' ms='auto' whiteSpace='nowrap'>
          {next}
        </Text>
      )}
    </Card.Header>
  )
}
