import { Text, VisuallyHidden } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { InlineLoader } from '~components/ui/Loader'
import { CheckIcon } from '~theme/icons'
import {
  PublishReviewHeader,
  PublishReviewProgress,
  PublishReviewProgressItem,
  PublishReviewPublishedMark,
  PublishReviewStatus,
  PublishReviewStep,
} from './anatomy'

/** One line of a wait: done (a check) or under way (a spinner). */
export type StatusProgress = { key: string; label: string; state: 'done' | 'active' }

export type StatusStepProps = {
  title: string
  /** Id for the message, which describes the dialog. */
  descriptionId?: string
  onClose?: () => void
  /** The stages of the wait, in order. */
  progress?: StatusProgress[]
  /** A muted line under them. */
  hint?: string
  /** What the dialog is told, for a screen reader: the stages above are not read out as one message. */
  children?: ReactNode
}

// A wait: no close button when given no onClose, since the publish is under way. The dialog's live
// region announces it; its message also describes the dialog, for when the dialog remounts with it
export const StatusStep = ({ title, descriptionId, onClose, progress, hint, children }: StatusStepProps) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} onClose={onClose} />
    <PublishReviewStatus>
      {progress ? (
        <PublishReviewProgress alignItems='flex-start'>
          {progress.map(({ key, label, state }) => (
            <PublishReviewProgressItem key={key} data-state={state}>
              {state === 'done' ? <CheckIcon aria-hidden /> : <InlineLoader />}
              {label}
            </PublishReviewProgressItem>
          ))}
        </PublishReviewProgress>
      ) : (
        <InlineLoader />
      )}
      {hint && (
        <Text textStyle='body-sm' color='fg.muted'>
          {hint}
        </Text>
      )}
      {children && (
        <VisuallyHidden asChild>
          <p id={descriptionId}>{children}</p>
        </VisuallyHidden>
      )}
    </PublishReviewStatus>
  </PublishReviewStep>
)

/** The success moment before the hand-off: a check and the news. */
export const PublishedStep = ({ title, label }: { title: string; label: string }) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} />
    <PublishReviewStatus>
      <PublishReviewPublishedMark aria-hidden>
        <CheckIcon />
      </PublishReviewPublishedMark>
      <p>{label}</p>
    </PublishReviewStatus>
  </PublishReviewStep>
)
