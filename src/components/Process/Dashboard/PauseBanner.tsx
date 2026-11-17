import { Alert, Span } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PauseIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'

/**
 * Says a paused vote is paused and what that means, in words that fit whoever reads it, manager or not. The votes
 * kept are told only once the results are read and someone has voted (`votes` unknown or 0 leaves that out). The
 * board adds the time it was paused, which the backend does not keep.
 */
export const PauseBanner = ({ byQuestion, votes }: { byQuestion: boolean; votes?: number }) => {
  const { t } = useTranslation()
  const hasVotes = !!votes
  const meaning = byQuestion
    ? hasVotes
      ? t('votes.summary.paused.by_question', {
          defaultValue:
            'Nobody can vote, and no question can be opened or closed until it is resumed. The votes cast are kept.',
        })
      : t('votes.summary.paused.by_question_no_votes', {
          defaultValue: 'Nobody can vote, and no question can be opened or closed until it is resumed.',
        })
    : hasVotes
      ? t('votes.summary.paused.all_at_once', {
          defaultValue_one:
            'Nobody can vote until it is resumed. The {{votes}} vote cast is kept and the deadline does not change.',
          defaultValue_other:
            'Nobody can vote until it is resumed. The {{votes}} votes cast are kept and the deadline does not change.',
          count: votes,
          votes: quantity(votes),
        })
      : t('votes.summary.paused.all_at_once_no_votes', {
          defaultValue: 'Nobody can vote until it is resumed. The deadline does not change.',
        })
  return (
    <Alert.Root status='warning' layout='notice' role='status'>
      <Alert.Indicator>
        <PauseIcon />
      </Alert.Indicator>
      <Alert.Description>
        <Span color='fg' fontWeight={{ base: 'semibold', lg: 'medium-plus' }}>
          {t('votes.summary.paused.title', { defaultValue: 'The vote is paused.' })}
        </Span>{' '}
        {meaning}
      </Alert.Description>
    </Alert.Root>
  )
}
