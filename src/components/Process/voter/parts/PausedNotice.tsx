import { Alert } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

/** Above a question or the review while the vote is paused (board V4VoterWideMore 2): nothing is lost. */
export const PausedNotice = () => {
  const { t } = useTranslation()
  return (
    <Alert.Root status='warning' layout='ballot' mb='5' role='status'>
      <Alert.Content>
        <Alert.Description>
          <b>{t('voter.paused.notice_title')}</b> {t('voter.paused.notice_body')}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  )
}
