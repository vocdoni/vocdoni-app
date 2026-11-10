import { Spinner } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { PublishReviewHeader, PublishReviewStatus, PublishReviewStep } from './anatomy'

export type StatusStepProps = {
  title: string
  titleId: string
  /** Id for the message, which describes the dialog. */
  descriptionId?: string
  onClose?: () => void
  children?: ReactNode
}

// A wait: no close button when given no onClose, since the publish is under way. The dialog's live
// region announces it; its message also describes the dialog, for when the dialog remounts with it
export const StatusStep = ({ title, titleId, descriptionId, onClose, children }: StatusStepProps) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} titleId={titleId} onClose={onClose} />
    <PublishReviewStatus>
      <Spinner size='lg' />
      {children && <p id={descriptionId}>{children}</p>}
    </PublishReviewStatus>
  </PublishReviewStep>
)
