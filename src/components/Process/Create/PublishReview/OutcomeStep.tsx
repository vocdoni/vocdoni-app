import { Alert, Button } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PublishReviewBody, PublishReviewFooter, PublishReviewHeader, PublishReviewStep } from './anatomy'

export type OutcomeStepProps = {
  title: string
  titleId: string
  /** Id for the message, which describes the dialog. */
  descriptionId?: string
  onClose?: () => void
  /** The footer's buttons, secondary first. */
  actions?: ReactNode
  children?: ReactNode
}

/** The end of a checkout state that needs the user: a message and what to do next. */
export const OutcomeStep = ({ title, titleId, descriptionId, onClose, actions, children }: OutcomeStepProps) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} titleId={titleId} onClose={onClose} />
    <PublishReviewBody id={descriptionId}>{children}</PublishReviewBody>
    {actions && <PublishReviewFooter>{actions}</PublishReviewFooter>}
  </PublishReviewStep>
)

export type OutcomeProps = {
  status: 'info' | 'warning' | 'error'
  /** A translated sentence above the message, for messages that may be raw (a backend or network error). */
  lead?: ReactNode
  children: ReactNode
}

export const Outcome = ({ status, lead, children }: OutcomeProps) => (
  // An error is announced as it appears; the other outcomes through the dialog's live region
  <Alert.Root status={status} role={status === 'error' ? 'alert' : undefined}>
    <Alert.Indicator />
    <Alert.Content>
      {lead && <Alert.Title>{lead}</Alert.Title>}
      <Alert.Description>{children}</Alert.Description>
    </Alert.Content>
  </Alert.Root>
)

// Back to the summary when there is one (not on the return from a payment), else a plain close
export const ExitButton = ({ onBack, onClose }: { onBack?: () => void; onClose: () => void }) => {
  const { t } = useTranslation()
  return onBack ? (
    <Button variant='outline' onClick={onBack}>
      {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
    </Button>
  ) : (
    <Button variant='outline' onClick={onClose}>
      {t('process.publish_review.close', { defaultValue: 'Close' })}
    </Button>
  )
}
