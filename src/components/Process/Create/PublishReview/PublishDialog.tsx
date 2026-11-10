import { Dialog, Portal, useSlotRecipe, VisuallyHidden } from '@chakra-ui/react'
import { type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isPublishing, type PublishFlowStart, useProcessCheckout } from '~components/Pricing/ProcessCheckout'
import { useAppEnv } from '~src/app-env'
import { useGroup } from '~queries/groups'
import { useProcessPrice } from '~queries/process-price'
import { useWallet } from '~queries/wallet'
import type { Process } from '../common'
import { stepFocusTarget } from './anatomy'
import { ProcessCheckoutContent } from './CheckoutContent'
import { PublishSummary } from './PublishSummary'
import { stepAnnouncement } from './step-copy'
import { resolvePublishPrimary } from './summary-facts'
import { useAnimatedHeight } from './useAnimatedHeight'
import { WalletStep } from './WalletStep'

export type PublishDialogProps = {
  processId: string
  /** The form as saved before opening; null on the return from a payment, which has no summary. */
  form: Process | null
  start: PublishFlowStart
  canTopUp: boolean
  onPublished: (processId: string) => void
  /** Closes the dialog; never called while a publish is under way. */
  onClose: () => void
  /** Gets focus back when the dialog closes and focus would otherwise be lost (the wizard's Publish). */
  returnFocusRef?: RefObject<HTMLElement | null>
}

/** Review, pay and publish a saved draft, in one dialog over the wizard. */
export const PublishDialog = ({
  processId,
  form,
  start,
  canTopUp,
  onPublished,
  onClose,
  returnFocusRef,
}: PublishDialogProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const frame = useSlotRecipe({ key: 'publishReview' })({}).frame
  const contentRef = useRef<HTMLDivElement | null>(null)
  // The frame as state too, for the height easing to follow it across the card step's remount
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null)
  const frameRef = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
    setFrameEl(node)
  }, [])
  const { DISABLE_ANONYMOUS_VOTING: disableAnonymous } = useAppEnv()
  const { price, query: priceQuery } = useProcessPrice(processId)
  const walletQuery = useWallet()
  const { data: group } = useGroup(form?.groupId ?? '', !!form?.groupId)
  const flow = useProcessCheckout({ processId, start, canTopUp, onPublished })
  const { step } = flow
  useAnimatedHeight(frameEl, step.name)
  // An unreadable wallet (a managed organization) is no wallet; one being re-read is not known yet
  const wallet = walletQuery.isError ? undefined : walletQuery.data
  const locked = isPublishing(step)
  const stripeMounted = step.name === 'checkout'
  const close = () => {
    if (locked) return
    onClose()
    // Without a focus trap (the card step) nothing restores focus, and the trap's own restore may land
    // on the wizard while it is still inert: once the dialog is gone, focus whatever lost it
    requestAnimationFrame(() => {
      const active = document.activeElement
      if (!active || active === document.body) returnFocusRef?.current?.focus()
    })
  }

  // Zag reads `modal` only when the dialog opens, so switching it remounts the root; the remount
  // skips the open animation, or every switch would flash the dialog in again
  const mode = stripeMounted ? 'stripe' : 'modal'
  const opened = useRef(mode)
  const everSwitched = useRef(false)
  const remounted = opened.current !== mode || everSwitched.current
  useEffect(() => {
    if (mode !== opened.current) everSwitched.current = true
  }, [mode])
  // Each step opens on its sentence (or its eyebrow), so a screen reader reads what changed. The remount
  // on a mode switch counts as a new step
  useEffect(() => {
    const frame = requestAnimationFrame(() => stepFocusTarget(contentRef.current)?.focus())
    return () => cancelAnimationFrame(frame)
  }, [step.name, mode])

  // Without a modal, Tab would reach the app under the backdrop and leave mid-payment. The dialog
  // (portalled to body) and Stripe's 3D Secure frame (appended to body) are outside the app root
  useEffect(() => {
    if (!stripeMounted) return
    const root = document.getElementById('root')
    if (!root || root.hasAttribute('inert')) return
    if (contentRef.current && root.contains(contentRef.current)) return
    root.setAttribute('inert', '')
    return () => root.removeAttribute('inert')
  }, [stripeMounted])

  const announcement = stepAnnouncement(t, flow)
  const currencyCode = price?.currency?.toUpperCase()

  const content =
    step.name === 'summary' && form ? (
      <PublishSummary
        form={form}
        voters={group?.membersCount}
        price={price}
        priceLoading={priceQuery.isLoading || walletQuery.isLoading}
        // Re-read after the save that opened the dialog (the census may have changed) and on focus
        priceRefreshing={priceQuery.isFetching || walletQuery.isFetching}
        priceError={priceQuery.isError}
        priceRetrying={priceQuery.isError && priceQuery.isFetching}
        onRetryPrice={() => void priceQuery.refetch()}
        wallet={wallet}
        canTopUp={canTopUp}
        disableAnonymous={disableAnonymous}
        titleId={titleId}
        onKeepEditing={close}
        onClose={close}
        onPrimary={(action) => {
          const primary = resolvePublishPrimary({ price, wallet, canTopUp })
          if (action === 'wallet' && primary.kind === 'wallet') {
            flow.showWallet({ totalCents: primary.totalCents, afterCents: primary.afterCents })
          } else if (action === 'card' && primary.kind === 'card') {
            flow.payByCard({ shortfallCents: primary.shortfallCents, balanceCents: primary.balanceCents })
          } else if (action === 'publish') flow.publish()
        }}
      />
    ) : step.name === 'wallet' ? (
      <WalletStep flow={flow} titleId={titleId} currencyCode={currencyCode} onClose={close} />
    ) : (
      <ProcessCheckoutContent
        flow={flow}
        processId={processId}
        titleId={titleId}
        descriptionId={descriptionId}
        currencyCode={currencyCode}
        totalCents={price?.totalCents}
        balanceCents={wallet?.balanceCents}
        onBack={form ? flow.backToSummary : undefined}
        onClose={close}
      />
    )

  return (
    <Dialog.Root
      key={mode}
      open
      onOpenChange={(details) => {
        if (!details.open) close()
      }}
      ids={{ title: titleId, description: descriptionId }}
      initialFocusEl={() => stepFocusTarget(contentRef.current)}
      size={{ base: 'full', md: 'xl' }}
      // Pinned to the top from md up, so its header stays put while the steps change height; full screen on phones
      placement={{ base: 'center', md: 'top' }}
      scrollBehavior='inside'
      lazyMount
      unmountOnExit
      skipAnimationOnMount={remounted}
      // A modal focus trap and pointer blocking break Stripe's 3D Secure lightbox, which opens
      // outside the dialog: off while the card form is mounted, with outside clicks ignored
      modal={!stripeMounted}
      closeOnInteractOutside={!locked && !stripeMounted}
      closeOnEscape={!locked && !stripeMounted}
    >
      <Portal>
        <Dialog.Backdrop _open={remounted ? { animationName: 'none' } : undefined} />
        <Dialog.Positioner>
          <Dialog.Content ref={frameRef} css={frame}>
            {content}
            {/* Always mounted, so a change of its text is read out (one inserted already filled is not) */}
            <VisuallyHidden role='status' aria-live='polite'>
              {announcement}
            </VisuallyHidden>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
