import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { InlineAction } from './ScreenParts'

/**
 * The closed screen's and the final results' way to check a vote. A plain census identifies the voter again
 * ("Comprova el teu vot"); an anonymous one has nothing to identify with, so it opens the page where a receipt code
 * is checked on the Explorer ("Verifica el teu comprovant", ruling R8).
 */
export const CheckVoteAction = () => {
  const { t } = useTranslation()
  const { anonymous, checkReceipt, verifyReceipt } = useVoterFlow()
  // testId: the e2e spec that checks a vote after the end clicks it.
  return anonymous ? (
    <InlineAction onClick={() => verifyReceipt(true)} testId='voter-verify-receipt'>
      {t('voter.verify.title')}
    </InlineAction>
  ) : (
    <InlineAction onClick={checkReceipt} testId='voter-check-vote'>
      {t('voter.results.check_vote')}
    </InlineAction>
  )
}
