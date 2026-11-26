import { useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { hasExplorerFor } from '../receipt'
import { InlineAction } from './ScreenParts'

/**
 * A plain census, or a cast whose outcome is unknown (`chain`), identifies the voter again ("Comprova el teu vot");
 * an anonymous one opens the Explorer code check ("Verifica el teu comprovant", ruling R8).
 */
export const CheckVoteAction = ({ chain = false }: { chain?: boolean }) => {
  const { t } = useTranslation()
  const { anonymous, checkReceipt, verifyReceipt, election } = useVoterFlow()
  // An anonymous census checks its code on the Explorer: a chain with none has nothing to offer for it.
  if (anonymous && !chain && !hasExplorerFor(election.chainId)) return null
  // testId: the e2e spec that checks a vote after the end clicks it.
  return anonymous && !chain ? (
    <InlineAction onClick={() => verifyReceipt(true)} testId='voter-verify-receipt'>
      {t('voter.verify.title')}
    </InlineAction>
  ) : (
    <InlineAction onClick={checkReceipt} testId='voter-check-vote'>
      {t('voter.results.check_vote')}
    </InlineAction>
  )
}
