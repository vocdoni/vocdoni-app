import { Alert, Button, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ProcessCheckoutFlow } from '~components/Pricing/ProcessCheckout'
import { usePrimaryShortcut } from './usePrimaryShortcut'
import { amountFigure, currencyExact } from '~utils/numbers'
import {
  PublishReviewAmountRow,
  PublishReviewAmounts,
  PublishReviewColumn,
  PublishReviewColumns,
  PublishReviewFooter,
  PublishReviewHeader,
  PublishReviewIntro,
  PublishReviewLead,
  PublishReviewSectionTitle,
  PublishReviewStep,
} from './anatomy'

export type WalletStepProps = {
  flow: ProcessCheckoutFlow
  currencyCode?: string
  /** The live price and what the wallet has left after it, as the summary reads them. */
  totalCents: number
  afterCents: number
  onClose: () => void
}

// The wallet covers the whole price: nothing to pay by card
export const WalletStep = ({ flow, currencyCode, totalCents, afterCents, onClose }: WalletStepProps) => {
  const { t } = useTranslation()
  usePrimaryShortcut(true, flow.publish)
  const total = currencyExact(totalCents, currencyCode)

  return (
    <PublishReviewStep>
      <PublishReviewHeader onBack={flow.backToSummary} onClose={onClose}>
        <PublishReviewLead>
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
          <Text textStyle='caption' color='fg.muted' textWrap='pretty'>
            {t('process.publish_review.wallet.note', {
              defaultValue: 'After publishing, the balance will have {{after}} left.',
              after: currencyExact(afterCents, currencyCode),
            })}
          </Text>
        </PublishReviewColumn>
        <PublishReviewColumn>
          <PublishReviewSectionTitle>
            {t('process.publish_review.how_you_pay', { defaultValue: 'How you pay' })}
          </PublishReviewSectionTitle>
          <Alert.Root status='success' layout='compact'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {t('process.publish_review.wallet.covers', {
                  defaultValue: "The organization's balance covers the whole cost. No card is needed.",
                })}
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </PublishReviewColumn>
      </PublishReviewColumns>

      <PublishReviewFooter>
        <Button variant='outline' onClick={flow.backToSummary}>
          {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
        </Button>
        {/* Its label is translated, so the e2e suite finds it by this attribute, not by its copy */}
        <Button data-primary='pay-from-balance' onClick={flow.publish}>
          {t('process.publish_review.wallet.cta', { defaultValue: 'Pay from the balance and publish' })}
        </Button>
      </PublishReviewFooter>
    </PublishReviewStep>
  )
}
