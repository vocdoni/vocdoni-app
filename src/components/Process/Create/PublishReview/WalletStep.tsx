import { Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ProcessCheckoutFlow } from '~components/Pricing/ProcessCheckout'
import { usePrimaryShortcut } from './usePrimaryShortcut'
import { amountFigure, currencyExact } from '~utils/numbers'
import {
  PublishReviewAmountRow,
  PublishReviewAmounts,
  PublishReviewCallout,
  PublishReviewColumn,
  PublishReviewColumns,
  PublishReviewFooter,
  PublishReviewHeader,
  PublishReviewIntro,
  PublishReviewLead,
  PublishReviewNote,
  PublishReviewSectionTitle,
  PublishReviewStep,
} from './anatomy'

export type WalletStepProps = { flow: ProcessCheckoutFlow; titleId: string; currencyCode?: string; onClose: () => void }

// The wallet covers the whole price: nothing to pay by card
export const WalletStep = ({ flow, titleId, currencyCode, onClose }: WalletStepProps) => {
  const { t } = useTranslation()
  const onWallet = flow.step.name === 'wallet'
  usePrimaryShortcut(onWallet, flow.publish)
  if (flow.step.name !== 'wallet') return null
  const { totalCents, afterCents } = flow.step
  const total = currencyExact(totalCents, currencyCode)

  return (
    <PublishReviewStep>
      <PublishReviewHeader onBack={flow.backToSummary} onClose={onClose}>
        <PublishReviewLead id={titleId}>
          {t('process.publish_review.wallet.title', {
            defaultValue: 'Pay {{total}} from the balance and the vote is published.',
            total,
          })}
        </PublishReviewLead>
        <PublishReviewIntro>
          {t('process.publish_review.wallet.lead', {
            defaultValue: 'There is nothing more to pay: it is taken from the prepaid balance.',
          })}
        </PublishReviewIntro>
      </PublishReviewHeader>

      <PublishReviewColumns>
        <PublishReviewColumn>
          <PublishReviewSectionTitle>
            {t('process.publish_review.pay_now', { defaultValue: 'What you pay now' })}
          </PublishReviewSectionTitle>
          <PublishReviewAmounts>
            <PublishReviewAmountRow
              label={t('process.publish_review.this_vote', { defaultValue: 'This vote' })}
              value={amountFigure(totalCents, currencyCode)}
            />
            <PublishReviewAmountRow
              label={t('process.publish_review.org_balance', { defaultValue: 'Organization balance' })}
              value={amountFigure(-totalCents, currencyCode)}
            />
            <PublishReviewAmountRow
              label={t('process.publish_review.total_now', { defaultValue: 'Total to pay now' })}
              value={amountFigure(0, currencyCode)}
              strong
              ruled
            />
          </PublishReviewAmounts>
          <PublishReviewNote>
            {t('process.publish_review.wallet.note', {
              defaultValue: 'After publishing, the balance will have {{after}} left.',
              after: currencyExact(afterCents, currencyCode),
            })}
          </PublishReviewNote>
        </PublishReviewColumn>
        <PublishReviewColumn>
          <PublishReviewSectionTitle>
            {t('process.publish_review.how_you_pay', { defaultValue: 'How you pay' })}
          </PublishReviewSectionTitle>
          <PublishReviewCallout tone='positive'>
            {t('process.publish_review.wallet.covers', {
              defaultValue: "The organization's balance covers the whole cost. No card is needed.",
            })}
          </PublishReviewCallout>
        </PublishReviewColumn>
      </PublishReviewColumns>

      <PublishReviewFooter>
        <Button variant='outline' onClick={flow.backToSummary}>
          {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
        </Button>
        <Button onClick={flow.publish}>
          {t('process.publish_review.wallet.cta', { defaultValue: 'Pay from the balance and publish' })}
        </Button>
      </PublishReviewFooter>
    </PublishReviewStep>
  )
}
