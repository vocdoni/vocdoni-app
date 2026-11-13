import type { TFunction } from 'i18next'
import { isPublishing, type ProcessCheckoutFlow, type ProcessCheckoutStep } from '~components/Pricing/ProcessCheckout'

// The words of the checkout steps, shared by what they show and what the dialog's live region says

type T = TFunction

// Whether the wait follows a payment known to have gone through
export const paymentReceived = (step: ProcessCheckoutStep, paymentSeen: boolean) =>
  step.name === 'waiting' && step.afterPayment && !!(step.paid || paymentSeen)

// The message of a wait, announced, and the description of the dialog
export const waitText = (t: T, step: ProcessCheckoutStep, paymentSeen: boolean) =>
  paymentReceived(step, paymentSeen)
    ? t('process.checkout.publishing_after_payment', {
        defaultValue: 'Payment received. Publishing your voting process…',
      })
    : t('process.checkout.publishing', { defaultValue: 'Publishing your voting process…' })

// The message of an outcome that is not an error, shown and announced
export const outcomeText = (t: T, step: ProcessCheckoutStep) => {
  switch (step.name) {
    case 'conflict':
      return t('process.checkout.conflict', {
        defaultValue:
          'A top-up for this voting process is still open, so it cannot be published yet. Resume the payment to finish it, or cancel it and publish from your wallet.',
      })
    case 'unconfirmed':
      return t('process.checkout.unconfirmed', {
        defaultValue:
          'Your payment is still being confirmed. Some payment methods take a few days to clear. The voting process is published automatically once the payment is confirmed, so you can leave this page.',
      })
    case 'unpaid':
      return t('process.checkout.unpaid', { defaultValue: 'The payment did not go through. You can try again.' })
    case 'timeout':
      return step.paid
        ? t('process.checkout.timeout', {
            defaultValue:
              'Your payment is confirmed and the voting process publishes shortly. If it does not, publish it again: it is paid from your wallet.',
          })
        : t('process.checkout.timeout_unpaid', {
            defaultValue:
              'The voting process is still being published. If it does not appear shortly, publish it again: it is paid from your wallet.',
          })
    default:
      return undefined
  }
}

/**
 * What the dialog's live region says for a step: the waits and the outcomes. Errors announce
 * themselves (`role='alert'`), and the pay steps move focus to their sentence.
 */
export const stepAnnouncement = (t: T, flow: Pick<ProcessCheckoutFlow, 'step' | 'paymentSeen'>) =>
  flow.step.name === 'published'
    ? publishedText(t)
    : isPublishing(flow.step)
      ? waitText(t, flow.step, flow.paymentSeen)
      : outcomeText(t, flow.step)

/** The success moment, shown and announced. */
export const publishedText = (t: T) =>
  t('process.publish_review.progress.published', { defaultValue: 'Vote published' })

/** The lead of an error, above its message, which may be raw (a backend or network error). */
export const failedLead = (t: T) =>
  t('process.publish_review.failed', { defaultValue: 'The vote could not be published.' })
