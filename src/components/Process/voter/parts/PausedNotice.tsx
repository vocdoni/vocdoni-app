import { Alert } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { formatVoteDay, formatVoteTime } from '../format'
import { LocalText } from './ScreenParts'

/**
 * Above a question or the review while the vote is paused (board V4VoterWideMore 2): nothing is lost.
 * It carries the closing date, which the head no longer shows while the vote is paused.
 */
export const PausedNotice = () => {
  const { t, i18n } = useTranslation()
  const { election } = useVoterFlow()
  const end = resolveEndDate(election)
  return (
    <Alert.Root status='warning' layout='ballot' mb='5' role='status'>
      <Alert.Content>
        <Alert.Description>
          <b>{t('voter.paused.notice_title')}</b> {t('voter.paused.notice_body')}{' '}
          {end ? (
            <LocalText>
              {t('voter.paused.notice_end', {
                date: formatVoteDay(end, i18n.language),
                time: formatVoteTime(end, i18n.language),
              })}
            </LocalText>
          ) : null}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  )
}
