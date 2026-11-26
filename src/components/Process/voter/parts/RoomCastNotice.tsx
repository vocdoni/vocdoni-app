import { Alert } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { InlineAction, ScreenHint } from './ScreenParts'

/**
 * "Comprova el teu vot" on a question whose vote could not be confirmed: a plain census asks the membership check again
 * (the frame turns to the vote once it lists it); an anonymous one opens the page where a receipt code is checked on
 * the Explorer, as the closed screen does (ruling R8).
 */
const RoomCheckVote = () => {
  const { t } = useTranslation()
  const { anonymous, recheck, verifyReceipt } = useVoterFlow()
  return (
    <ScreenHint>
      {anonymous ? (
        <InlineAction onClick={() => verifyReceipt(true)}>{t('voter.verify.title')}</InlineAction>
      ) : (
        <InlineAction onClick={recheck}>{t('voter.results.check_vote')}</InlineAction>
      )}
    </ScreenHint>
  )
}

/**
 * A cast of a question-by-question vote that did not land, said as an error (owner ruling 2026-11-24). `lost`: signed
 * and not on the ledger, with nothing this device can re-send. `unknown`: sent, and the answer was lost, so it may have
 * landed: a warning, with the way to check. `late`: the relay refused because the question closed between the voter
 * pressing the button and the relay receiving it. Announced, as the all-at-once flow's failed cast is.
 */
export const RoomCastNotice = ({ kind }: { kind: 'lost' | 'unknown' | 'late' }) => {
  const { t } = useTranslation()
  if (kind === 'late') {
    return (
      <Alert.Root status='error' layout='ballot' mt='6' role='alert'>
        <Alert.Content>
          <Alert.Title>{t('voter.room.late_title')}</Alert.Title>
          <Alert.Description>{t('voter.room.late_help')}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }
  const lost = kind === 'lost'
  return (
    <>
      <Alert.Root status={lost ? 'error' : 'warning'} layout='ballot' mt='6' role='alert'>
        <Alert.Content>
          <Alert.Title>{lost ? t('voter.room.lost_title') : t('voter.room.unconfirmed_title')}</Alert.Title>
          <Alert.Description>{lost ? t('voter.room.lost_help') : t('voter.room.unconfirmed_help')}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      {!lost && <RoomCheckVote />}
    </>
  )
}
