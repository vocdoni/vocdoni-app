import { Button } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  PaymentElement,
  TaxIdElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import type { ProcessCheckoutResponse } from '@vocdoni/api-types'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock } from 'react-icons/lu'
import { errorMessage, type WalletShortfall } from '~components/Pricing/ProcessCheckout'
import { useCheckoutAppearance, type useStripePromise } from '~components/Pricing/stripe'
import { clearPendingCheckout, storePendingCheckout } from '~queries/process-checkout'
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
  PublishReviewNote,
  PublishReviewSecureNote,
  PublishReviewSectionTitle,
  PublishReviewSkeleton,
  PublishReviewStep,
  PublishReviewStripeField,
} from './anatomy'
import { ExitButton, Outcome, OutcomeStep } from './OutcomeStep'
import { failedLead } from './step-copy'

type CardStepProps = {
  title: string
  titleId: string
  processId: string
  session: ProcessCheckoutResponse
  shortfall?: WalletShortfall
  currencyCode?: string
  stripePromise: NonNullable<ReturnType<typeof useStripePromise>>
  totalCents?: number
  balanceCents?: number
  onPaid: () => void
  onBack?: () => void
  onClose: () => void
}

export const CardStep = ({ stripePromise, session, ...props }: CardStepProps) => {
  const appearance = useCheckoutAppearance()

  return (
    // The session is already open, so Stripe only needs its client secret
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret: session.clientSecret, elementsOptions: { appearance } }}
    >
      <CardForm session={session} {...props} />
    </CheckoutElementsProvider>
  )
}

const CardForm = (props: Omit<CardStepProps, 'stripePromise'>) => {
  const { t } = useTranslation()
  const checkoutState = useCheckoutElements()
  const { title, titleId, onBack, onClose } = props

  if (checkoutState.type === 'error') {
    return (
      <OutcomeStep
        title={title}
        titleId={titleId}
        onClose={onClose}
        actions={<ExitButton onBack={onBack} onClose={onClose} />}
      >
        <Outcome status='error' lead={failedLead(t)}>
          {checkoutState.error.message}
        </Outcome>
      </OutcomeStep>
    )
  }

  return <CardLayout {...props} checkout={checkoutState.type === 'success' ? checkoutState.checkout : undefined} />
}

type CardLayoutProps = Omit<CardStepProps, 'stripePromise' | 'session' | 'onPaid'> & {
  /** Undefined while the session opens: the step shows its frame, with skeletons where Stripe goes. */
  session?: ProcessCheckoutResponse
  /** Stripe's checkout, once loaded; the Stripe elements are only rendered with it. */
  checkout?: StripeCheckout
  onPaid?: () => void
}

type StripeCheckout = Extract<ReturnType<typeof useCheckoutElements>, { type: 'success' }>['checkout']

// The card step, from the moment its session opens: the frame does not change once Stripe is in
export const CardLayout = ({
  title,
  titleId,
  processId,
  session,
  checkout,
  shortfall,
  currencyCode,
  totalCents,
  balanceCents,
  onPaid,
  onBack,
  onClose,
}: CardLayoutProps) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Each Stripe element keeps its skeleton until it has painted
  const [billingReady, setBillingReady] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)

  const loading = !checkout
  // The session charges in its own currency; the price's until it is open
  const code = session?.currency?.toUpperCase() ?? currencyCode
  const walletBalanceCents = shortfall?.balanceCents ?? balanceCents
  // The refusal's shortfall when there was one; otherwise what the price and the balance leave
  const shortCents =
    shortfall?.shortfallCents ??
    (totalCents !== undefined && walletBalanceCents !== undefined
      ? Math.max(totalCents - walletBalanceCents, 0)
      : undefined)
  // Above the shortfall when the €1 minimum top-up is more than what is short
  const restStaysInWallet = !!session && shortCents !== undefined && session.amountCents > shortCents
  // The amount Stripe charges, VAT included, when it says so
  const payAmount =
    checkout && session ? (checkout.total?.total.amount ?? currencyExact(session.amountCents, code)) : undefined
  const failToLoad = (message?: string) => setError(message ?? null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !checkout) return

    setIsSubmitting(true)
    setError(null)
    try {
      // Stripe's redirect drops the page: the return route reads the draft from here
      storePendingCheckout(processId)
      const result = await checkout.confirm({ redirect: 'if_required' })
      // No redirect happened, so the return route will not need the draft
      if (result.type === 'error') {
        clearPendingCheckout()
        setError(result.error.message)
        setIsSubmitting(false)
        return
      }
      clearPendingCheckout()
      // Stripe accepted the payment; whether the wallet was credited is the backend's to say
      onPaid?.()
    } catch (err) {
      clearPendingCheckout()
      setError(errorMessage(err))
      setIsSubmitting(false)
    }
  }

  const lead =
    walletBalanceCents === undefined
      ? null
      : walletBalanceCents > 0
        ? t('process.publish_review.card.lead_balance', {
            defaultValue: "The organization's balance covers {{balance}}. The rest is paid now, with VAT.",
            balance: currencyExact(walletBalanceCents, code),
          })
        : t('process.publish_review.card.lead_whole', { defaultValue: 'You pay the whole vote now, with VAT.' })

  const note = restStaysInWallet
    ? t('process.checkout.rest_stays', { defaultValue: 'The rest stays in your wallet.' })
    : shortCents !== undefined
      ? t('process.publish_review.card.note_zero', { defaultValue: 'After publishing, the balance is left at zero.' })
      : null

  return (
    <PublishReviewStep asChild>
      <form
        onSubmit={handleSubmit}
        // The dialog's own Escape is off on this step (it would also fire under Stripe's 3D Secure
        // frame); keys from inside Stripe's frames never reach here
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isSubmitting) {
            event.preventDefault()
            onClose()
          }
        }}
      >
        <PublishReviewHeader
          eyebrow={onBack ? undefined : title}
          titleId={onBack ? undefined : titleId}
          onBack={onBack && !isSubmitting ? onBack : undefined}
          onClose={isSubmitting ? undefined : onClose}
        >
          <PublishReviewLead
            id={onBack ? titleId : undefined}
            // Names the dialog while the amount is a skeleton
            aria-label={
              payAmount ? undefined : t('process.publish_review.card.cta_loading', { defaultValue: 'Pay and publish' })
            }
          >
            {payAmount ? (
              t('process.publish_review.card.title', {
                defaultValue: 'Pay {{amount}} and the vote is published.',
                amount: payAmount,
              })
            ) : (
              // A span: the lead is a heading
              <PublishReviewSkeleton data-kind='lead' asChild>
                <span />
              </PublishReviewSkeleton>
            )}
          </PublishReviewLead>
          {lead && <PublishReviewIntro>{lead}</PublishReviewIntro>}
        </PublishReviewHeader>

        <PublishReviewColumns>
          <PublishReviewColumn>
            <PublishReviewSectionTitle>
              {t('process.publish_review.pay_now', { defaultValue: 'What you pay now' })}
            </PublishReviewSectionTitle>
            <PublishReviewAmounts>
              {totalCents !== undefined && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.this_vote', { defaultValue: 'This vote' })}
                  value={amountFigure(totalCents, code)}
                />
              )}
              {walletBalanceCents !== undefined && walletBalanceCents > 0 && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.org_balance', { defaultValue: 'Organization balance' })}
                  value={amountFigure(-walletBalanceCents, code)}
                />
              )}
              {shortCents !== undefined && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.card.short', { defaultValue: 'Short' })}
                  value={amountFigure(shortCents, code)}
                  ruled
                />
              )}
              {session && (session.amountCents !== shortCents || (checkout && !checkout.total)) && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.card.top_up', { defaultValue: 'Top-up, VAT excluded' })}
                  value={amountFigure(session.amountCents, code)}
                />
              )}
              {loading ? (
                <PublishReviewSkeleton data-kind='amounts' />
              ) : (
                checkout?.total && (
                  <>
                    <PublishReviewAmountRow
                      label={t('wallet.topup.vat', { defaultValue: 'VAT' })}
                      value={amountFigure(checkout.total.taxExclusive.minorUnitsAmount, code)}
                    />
                    <PublishReviewAmountRow
                      label={t('process.publish_review.total_now', { defaultValue: 'Total to pay now' })}
                      value={amountFigure(checkout.total.total.minorUnitsAmount, code)}
                      strong
                      ruled
                    />
                  </>
                )
              )}
            </PublishReviewAmounts>
            {note && <PublishReviewNote>{note}</PublishReviewNote>}
            <PublishReviewSectionTitle>
              {t('process.publish_review.card.billing', { defaultValue: 'Billing details' })}
            </PublishReviewSectionTitle>
            <PublishReviewStripeField ready={billingReady}>
              {checkout && (
                <>
                  <BillingAddressElement
                    options={{ display: { name: 'split' } }}
                    onReady={() => setBillingReady(true)}
                    onLoadError={(event) => {
                      setBillingReady(true)
                      failToLoad(event.error.message)
                    }}
                  />
                  <TaxIdElement options={{ visibility: 'auto' }} />
                </>
              )}
            </PublishReviewStripeField>
          </PublishReviewColumn>

          <PublishReviewColumn>
            <PublishReviewSectionTitle>
              {t('process.publish_review.how_you_pay', { defaultValue: 'How you pay' })}
            </PublishReviewSectionTitle>
            <PublishReviewStripeField ready={paymentReady}>
              {checkout && (
                <PaymentElement
                  onReady={() => setPaymentReady(true)}
                  onLoadError={(event) => {
                    setPaymentReady(true)
                    failToLoad(event.error.message)
                  }}
                />
              )}
            </PublishReviewStripeField>
            <PublishReviewSecureNote>
              <LuLock aria-hidden />
              <span>
                {t('process.publish_review.card.secure', {
                  defaultValue: 'Secure payment processed by Stripe. Vocdoni neither sees nor stores the card details.',
                })}
              </span>
            </PublishReviewSecureNote>
          </PublishReviewColumn>
        </PublishReviewColumns>

        {/* Next to the button that was clicked, so a refused card never shows out of view */}
        <PublishReviewFooter
          note={
            error && (
              <span role='alert' data-tone='error'>
                {error}
              </span>
            )
          }
        >
          {onBack && (
            <Button variant='outline' onClick={onBack} disabled={isSubmitting}>
              {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
            </Button>
          )}
          {/* Only a payment under way spins, with words: a form still loading just waits */}
          <Button
            type='submit'
            loading={isSubmitting}
            loadingText={t('process.publish_review.card.processing', { defaultValue: 'Processing the payment…' })}
            disabled={loading}
          >
            {payAmount
              ? t('process.checkout.pay', { defaultValue: 'Pay {{amount}} and publish', amount: payAmount })
              : t('process.publish_review.card.cta_loading', { defaultValue: 'Pay and publish' })}
          </Button>
        </PublishReviewFooter>
      </form>
    </PublishReviewStep>
  )
}
