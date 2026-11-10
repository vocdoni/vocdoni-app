import { Button } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import type { ProcessCheckoutFlow } from '~components/Pricing/ProcessCheckout'
import { useStripePromise } from '~components/Pricing/stripe'
import { Routes } from '~routes'
import { CardLayout, CardStep } from './CardStep'
import { ExitButton, Outcome, OutcomeStep } from './OutcomeStep'
import { StatusStep } from './StatusStep'
import { failedLead, outcomeText, waitText } from './step-copy'

type ProcessCheckoutContentProps = {
  flow: ProcessCheckoutFlow
  processId: string
  /** Id of the element that names the dialog. */
  titleId: string
  /** Id for the message of a wait or an outcome, which describes the dialog. */
  descriptionId?: string
  /** The price's currency, until the session says its own. */
  currencyCode?: string
  /** The draft's price, VAT excluded, and the wallet balance, when known. */
  totalCents?: number
  balanceCents?: number
  /** Back to the summary; left out when the dialog has none (the return from a payment). */
  onBack?: () => void
  onClose: () => void
}

/** The dialog body for every checkout state: the card payment, the waits and the outcomes. */
export const ProcessCheckoutContent = ({
  flow,
  processId,
  titleId,
  descriptionId,
  currencyCode,
  totalCents,
  balanceCents,
  onBack,
  onClose,
}: ProcessCheckoutContentProps) => {
  const { t } = useTranslation()
  const stripePromise = useStripePromise()
  const { step } = flow
  const title = flow.topUp
    ? t('process.checkout.title', { defaultValue: 'Top up and publish' })
    : t('process.checkout.publish_title', { defaultValue: 'Publish voting process' })

  const outcome = (body: ReactNode, actions?: ReactNode) => (
    <OutcomeStep title={title} titleId={titleId} descriptionId={descriptionId} onClose={onClose} actions={actions}>
      {body}
    </OutcomeStep>
  )
  // Every outcome without its own way forward gets a way out besides the small close button
  const exit = <ExitButton onBack={onBack} onClose={onClose} />

  switch (step.name) {
    case 'summary':
    case 'wallet':
      // The dialog's own steps
      return null
    case 'conflict':
      return outcome(
        <Outcome status='warning'>{outcomeText(t, step)}</Outcome>,
        <>
          <Button variant='outline' onClick={flow.cancelOpenPayment}>
            {t('process.checkout.cancel_open', { defaultValue: 'Cancel the open payment' })}
          </Button>
          <Button onClick={flow.resumePayment}>
            {t('process.checkout.resume', { defaultValue: 'Resume payment' })}
          </Button>
        </>
      )
    case 'opening':
      // The card step's own frame, so the dialog keeps its size and place while the session opens
      return (
        <CardLayout
          title={title}
          titleId={titleId}
          processId={processId}
          shortfall={flow.shortfall}
          currencyCode={currencyCode}
          totalCents={totalCents}
          balanceCents={balanceCents}
          onBack={onBack}
          onClose={onClose}
        />
      )
    case 'checkout':
      if (!stripePromise) {
        return outcome(
          <Outcome status='error'>
            {t('payment.stripe_unavailable', {
              defaultValue: 'Payments are temporarily unavailable. Please try again later.',
            })}
          </Outcome>,
          exit
        )
      }
      return (
        <CardStep
          title={title}
          titleId={titleId}
          processId={processId}
          session={step.session}
          shortfall={flow.shortfall}
          currencyCode={currencyCode}
          stripePromise={stripePromise}
          totalCents={totalCents}
          balanceCents={balanceCents}
          onPaid={flow.paid}
          onBack={onBack}
          onClose={onClose}
        />
      )
    case 'publishing':
    case 'waiting':
      return (
        <StatusStep title={title} titleId={titleId} descriptionId={descriptionId}>
          {waitText(t, step, flow.paymentSeen)}
        </StatusStep>
      )
    case 'unconfirmed':
      return outcome(
        <Outcome status='info'>{outcomeText(t, step)}</Outcome>,
        <Button variant='outline' onClick={flow.checkAgain}>
          {t('process.checkout.check_again', { defaultValue: 'Check again' })}
        </Button>
      )
    case 'unpaid':
      return outcome(
        <Outcome status='error'>{outcomeText(t, step)}</Outcome>,
        <Button onClick={flow.resumePayment}>{t('common.retry', { defaultValue: 'Try again' })}</Button>
      )
    case 'timeout':
      return outcome(
        <Outcome status='warning'>{outcomeText(t, step)}</Outcome>,
        <Button onClick={flow.publish}>{t('process.checkout.publish_again', { defaultValue: 'Publish again' })}</Button>
      )
    case 'error':
      return outcome(
        <Outcome status='error' lead={failedLead(t)}>
          {step.message}
        </Outcome>,
        <>
          {exit}
          {step.openWallet && (
            <Button asChild>
              <RouterLink to={Routes.dashboard.settings.billing}>
                {t('process.payment.error.open_wallet', { defaultValue: 'Open wallet' })}
              </RouterLink>
            </Button>
          )}
        </>
      )
  }
}
