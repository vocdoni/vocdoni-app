import {
  Button,
  type ButtonProps,
  Dialog,
  type DialogContentProps,
  type DialogRootProps,
  Icon,
  Spacer,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { DialogHeader } from '~components/ui/DialogHeader'
import { WarningIcon } from '~theme/icons'
import { ConfirmModal } from '~theme/recipes/confirmModal'

/** `decision` is the guide's confirm dialog; the others are older layouts kept for screens not yet redesigned. */
export type ConfirmDialogLayout = 'decision' | 'panel' | 'inline' | 'compact' | 'summary'

/** `primary` is the filled accent button; `danger` an outline with danger text (never a filled red). */
export type ConfirmDialogTone = 'primary' | 'danger'

export interface ConfirmDialogContentProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** An amber line with the warning icon, under the description: a consequence the reader must not miss. */
  warning?: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  onConfirm?: () => void
  /** Without it, Cancel closes the dialog through `onOpenChange`. */
  onCancel?: () => void
  /** Shows a spinner on the confirm button. Does not auto-close — the caller controls `open`. */
  loading?: boolean
  /** The confirm button's look. Defaults to `danger`: a confirm usually guards something that cannot be undone. */
  tone?: ConfirmDialogTone
  layout?: ConfirmDialogLayout
  cancelDisabled?: boolean
  /** e.g. `disabled`, or `asChild` with a link as `confirmText`. */
  confirmProps?: ButtonProps
  /** Rendered after the confirm button. */
  extraActions?: React.ReactNode
  /** Pushes Cancel to the start of the footer, away from the actions. */
  separateCancel?: boolean
  /** Extra body content rendered below the description. */
  children?: React.ReactNode
}

export type ConfirmDialogProps = ConfirmDialogContentProps & Omit<DialogRootProps, 'children'>

const TONE_VARIANT: Record<ConfirmDialogTone, ButtonProps['variant']> = { primary: 'solid', danger: 'danger' }

/**
 * Header, body and footer of a confirm dialog, for a dialog someone else opens: useConfirm renders it
 * inside react-components' ConfirmShell (a ConfirmDialogShell). Everything else uses ConfirmDialog.
 */
export const ConfirmDialogContent = ({
  title,
  description,
  warning,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  tone = 'danger',
  layout = 'decision',
  cancelDisabled,
  confirmProps,
  extraActions,
  separateCancel,
  children,
}: ConfirmDialogContentProps) => {
  const { t } = useTranslation()
  const styles = useSlotRecipe({ recipe: ConfirmModal })({ layout })
  const inHeader = layout === 'summary'

  const cancel = (
    <Button variant='outline' disabled={cancelDisabled} onClick={onCancel}>
      {cancelText || t('actions.cancel', { defaultValue: 'Cancel' })}
    </Button>
  )

  return (
    <>
      <DialogHeader
        css={styles.header}
        title={title}
        titleProps={{ css: styles.title }}
        description={inHeader ? description : undefined}
        descriptionProps={{ css: styles.description }}
      />
      <Dialog.Body css={styles.body}>
        {!inHeader &&
          description &&
          (layout === 'decision' ? (
            <Dialog.Description css={styles.description}>{description}</Dialog.Description>
          ) : (
            <Text css={styles.description}>{description}</Text>
          ))}
        {warning && (
          <Text css={styles.warning} data-part='warning'>
            <Icon as={WarningIcon} css={styles.warningIcon} aria-hidden />
            <span>{warning}</span>
          </Text>
        )}
        {children}
      </Dialog.Body>
      <Dialog.Footer css={styles.footer}>
        {/* ActionTrigger, not CloseTrigger: that one carries the close button's absolute position. */}
        {onCancel ? cancel : <Dialog.ActionTrigger asChild>{cancel}</Dialog.ActionTrigger>}
        {separateCancel && <Spacer />}
        <Button variant={TONE_VARIANT[tone]} data-tone={tone} loading={loading} onClick={onConfirm} {...confirmProps}>
          {confirmText || t('actions.confirm', { defaultValue: 'Confirm' })}
        </Button>
        {extraActions}
      </Dialog.Footer>
    </>
  )
}

export type ConfirmDialogShellProps = Omit<DialogRootProps, 'children'> & {
  layout?: ConfirmDialogLayout
  contentProps?: DialogContentProps
  children: React.ReactNode
}

/**
 * The dialog around a ConfirmDialogContent: backdrop, position and box of the layout (the guide's dialog, tablet
 * dialog and bottom sheet for `decision`; Chakra's centred dialog for the others).
 */
export const ConfirmDialogShell = ({
  layout = 'decision',
  contentProps,
  children,
  ...rootProps
}: ConfirmDialogShellProps) => {
  const styles = useSlotRecipe({ recipe: ConfirmModal })({ layout })
  return (
    <Dialog.Root {...rootProps}>
      <Dialog.Backdrop css={styles.backdrop} />
      <Dialog.Positioner css={styles.positioner}>
        <Dialog.Content css={styles.content} {...contentProps}>
          {children}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

/**
 * The app's one confirm dialog. Prefer it over `useConfirm` for async actions: the caller owns `open`,
 * so the dialog stays open with a loading confirm until the mutation succeeds.
 */
export const ConfirmDialog = ({
  title,
  description,
  warning,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading,
  tone,
  layout,
  cancelDisabled,
  confirmProps,
  extraActions,
  separateCancel,
  children,
  ...dialogProps
}: ConfirmDialogProps) => (
  <ConfirmDialogShell layout={layout} {...dialogProps}>
    <ConfirmDialogContent
      {...{ title, description, warning, confirmText, cancelText, onConfirm, onCancel, loading, tone, layout }}
      {...{ cancelDisabled, confirmProps, extraActions, separateCancel }}
    >
      {children}
    </ConfirmDialogContent>
  </ConfirmDialogShell>
)
