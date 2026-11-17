import { Alert, Span } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PauseIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'

/**
 * Says a paused vote is paused and what that means. The board adds the time it was paused, which the backend does
 * not keep.
 */
export const PauseBanner = ({ byQuestion, votes }: { byQuestion: boolean; votes: number }) => {
  const { t } = useTranslation()
  return (
    <Alert.Root status='warning' layout='compact' role='status'>
      <Alert.Indicator>
        <PauseIcon />
      </Alert.Indicator>
      <Alert.Description>
        <Span fontWeight='medium-plus'>{t('votes.summary.paused.title', { defaultValue: 'The vote is paused.' })}</Span>{' '}
        {byQuestion
          ? t('votes.summary.paused.by_question', {
              defaultValue:
                'Nobody can vote, and no question can be opened or closed until you resume it. The votes cast are kept.',
            })
          : t('votes.summary.paused.all_at_once', {
              defaultValue_one:
                'Nobody can vote until you resume it. The {{votes}} vote cast is kept and the deadline does not change.',
              defaultValue_other:
                'Nobody can vote until you resume it. The {{votes}} votes cast are kept and the deadline does not change.',
              count: votes,
              votes: quantity(votes),
            })}
      </Alert.Description>
    </Alert.Root>
  )
}
