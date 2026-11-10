import {
  CloseButton,
  type CloseButtonProps,
  createSlotRecipeContext,
  type HTMLChakraProps,
  Skeleton,
} from '@chakra-ui/react'
import { forwardRef, type ReactNode, type RefObject, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuCheck, LuTriangleAlert } from 'react-icons/lu'

// Every piece reads its look from the `publishReview` slot recipe, so a re-theme edits only that file
const { withProvider, withContext } = createSlotRecipeContext({ key: 'publishReview' })

const StepRoot = withProvider<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'root')

const scrollAreas = '.publish-review__columns, .publish-review__body, .publish-review__status'

// Marks the footer (`data-covering`) while content is scrolled under it, so the recipe can soften its
// edge. The scrolling part is the step itself on a phone and the middle from md up; both are read, and
// re-read as the step scrolls, resizes or changes (the cost panel opens, Stripe's frames grow)
const useFooterHint = (rootRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const update = () => {
      const footer = root.querySelector('.publish-review__footer')
      if (!footer) return
      const covered = [root, ...Array.from(root.querySelectorAll<HTMLElement>(scrollAreas))].some((area) => {
        const overflow = getComputedStyle(area).overflowY
        return (
          (overflow === 'auto' || overflow === 'scroll') &&
          area.scrollHeight - area.scrollTop - area.clientHeight > 1
        )
      })
      footer.toggleAttribute('data-covering', covered)
    }
    update()
    // Scroll events do not bubble: caught on the way down
    root.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    resize?.observe(root)
    const mutations = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(update)
    mutations?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'height'] })
    return () => {
      root.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      resize?.disconnect()
      mutations?.disconnect()
    }
  }, [rootRef])
}

/** One step of the dialog. Render it directly inside `Dialog.Content`; it provides the recipe. */
export const PublishReviewStep = (props: HTMLChakraProps<'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  useFooterHint(ref)
  return <StepRoot ref={ref} {...props} />
}

const HeaderBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'header')
const TopBar = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'topBar')
const Eyebrow = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'eyebrow')
const BackButton = withContext<HTMLButtonElement, HTMLChakraProps<'button'>>('button', 'back')
const CloseSlot = withContext<HTMLButtonElement, CloseButtonProps>(CloseButton, 'close')

const LeadBox = withContext<HTMLHeadingElement, HTMLChakraProps<'h2'>>('h2', 'lead')

/**
 * The step's sentence, its top heading. Focus lands on it when a step opens, so a screen reader
 * reads what changed (see `stepFocusTarget`).
 */
export const PublishReviewLead = forwardRef<HTMLHeadingElement, HTMLChakraProps<'h2'>>(
  function PublishReviewLead(props, ref) {
    return <LeadBox ref={ref} tabIndex={-1} data-step-focus='lead' {...props} />
  }
)

/** Where focus goes when a step opens: its lead, or the eyebrow of a step without one (a wait, an outcome). */
export const stepFocusTarget = (root?: HTMLElement | null) =>
  root?.querySelector<HTMLElement>('[data-step-focus=lead]') ??
  root?.querySelector<HTMLElement>('[data-step-focus=eyebrow]') ??
  null
export const PublishReviewIntro = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'intro')
export const PublishReviewColumns = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'columns')
export const PublishReviewColumn = withContext<HTMLElement, HTMLChakraProps<'section'>>('section', 'column')
export const PublishReviewSectionTitle = withContext<HTMLHeadingElement, HTMLChakraProps<'h3'>>('h3', 'sectionTitle')
export const PublishReviewQuestionList = withContext<HTMLOListElement, HTMLChakraProps<'ol'>>('ol', 'questionList')
export const PublishReviewQuestionItem = withContext<HTMLLIElement, HTMLChakraProps<'li'>>('li', 'questionItem')
export const PublishReviewQuestionNumber = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>(
  'span',
  'questionNumber'
)
export const PublishReviewQuestionTitle = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'questionTitle')
export const PublishReviewQuestionType = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'questionType')
export const PublishReviewFacts = withContext<HTMLDListElement, HTMLChakraProps<'dl'>>('dl', 'facts')
export const PublishReviewCost = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'cost')
export const PublishReviewCostSkeleton = withContext<HTMLDivElement, HTMLChakraProps<'div'>>(Skeleton, 'costSkeleton')
export const PublishReviewCostToggle = withContext<HTMLButtonElement, HTMLChakraProps<'button'>>('button', 'costToggle')
export const PublishReviewCostSummary = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'costSummary')
export const PublishReviewCostAction = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'costAction')
export const PublishReviewCostPanel = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'costPanel')
export const PublishReviewCostTitle = withContext<HTMLHeadingElement, HTMLChakraProps<'h4'>>('h4', 'costTitle')
/** The sunken box of amounts ("What you pay now"); flat when placed inside the cost panel. */
export const PublishReviewAmounts = withContext<HTMLDListElement, HTMLChakraProps<'dl'>>('dl', 'amounts')
export const PublishReviewNote = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'note')
/** Padded body of a one-message step (a checkout outcome). */
export const PublishReviewBody = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'body')
/** Centred spinner and message of a wait. */
export const PublishReviewStatus = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'status')
/** The stages of a wait; each item has `data-state` `done` or `active`. */
export const PublishReviewProgress = withContext<HTMLUListElement, HTMLChakraProps<'ul'>>('ul', 'progress')
export const PublishReviewProgressItem = withContext<HTMLLIElement, HTMLChakraProps<'li'>>('li', 'progressItem')
export const PublishReviewStatusHint = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'statusHint')
/** The round check of the success moment. */
export const PublishReviewPublishedMark = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'publishedMark')
/** Placeholder while Stripe loads; `data-kind` is `lead`, `amounts` or `field`. */
export const PublishReviewSkeleton = withContext<HTMLDivElement, HTMLChakraProps<'div'>>(Skeleton, 'skeleton')
/** The lock line under the card form; the icon goes first. */
export const PublishReviewSecureNote = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'secureNote')

const StripeFieldBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'stripeField')
const StripeMount = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'stripeMount')

const FactRowBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'factRow')
const FactLabel = withContext<HTMLElement, HTMLChakraProps<'dt'>>('dt', 'factLabel')
const FactValue = withContext<HTMLElement, HTMLChakraProps<'dd'>>('dd', 'factValue')
const AmountRowBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'amountRow')
const CalloutBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'callout')
const CalloutIcon = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'calloutIcon')
const FooterBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'footer')
const FooterNote = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'footerNote')
const Actions = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'actions')

// Data attributes take no value: present means on
const flag = (on?: boolean) => (on ? '' : undefined)

export type PublishReviewHeaderProps = {
  /** Small label on top of the summary step ("Review before publishing"). */
  eyebrow?: ReactNode
  /** Id for the eyebrow, to label the dialog with it (`Dialog.Root ids={{ title }}`). */
  titleId?: string
  /** Shows a "Back to the summary" link in place of the eyebrow. */
  onBack?: () => void
  backLabel?: ReactNode
  /** Shows the close button; leave it out while the dialog must not be dismissed. */
  onClose?: () => void
  /** The lead sentence and intro under the top bar. */
  children?: ReactNode
}

export const PublishReviewHeader = ({
  eyebrow,
  titleId,
  onBack,
  backLabel,
  onClose,
  children,
}: PublishReviewHeaderProps) => {
  const { t } = useTranslation()

  return (
    <HeaderBox>
      <TopBar>
        {onBack ? (
          <BackButton type='button' onClick={onBack}>
            <LuArrowLeft aria-hidden />
            {backLabel ?? t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
          </BackButton>
        ) : (
          <Eyebrow id={titleId} tabIndex={-1} data-step-focus='eyebrow'>
            {eyebrow}
          </Eyebrow>
        )}
        {onClose && (
          <CloseSlot
            size='sm'
            variant='ghost'
            onClick={onClose}
            aria-label={t('process.publish_review.close', { defaultValue: 'Close' })}
          />
        )}
      </TopBar>
      {children}
    </HeaderBox>
  )
}

export type PublishReviewFactRowProps = { label: ReactNode; value: ReactNode; muted?: boolean }

/** A label / value row of `PublishReviewFacts`. */
export const PublishReviewFactRow = ({ label, value, muted }: PublishReviewFactRowProps) => (
  <FactRowBox>
    <FactLabel>{label}</FactLabel>
    <FactValue data-muted={flag(muted)}>{value}</FactValue>
  </FactRowBox>
)

export type PublishReviewAmountRowProps = {
  label: ReactNode
  value: ReactNode
  /** Bold, for totals and what is short. */
  strong?: boolean
  /** A hairline above, to start a new block (total, balance). */
  ruled?: boolean
  muted?: boolean
}

/** One line of `PublishReviewAmounts` or of the cost panel. */
export const PublishReviewAmountRow = ({ label, value, strong, ruled, muted }: PublishReviewAmountRowProps) => (
  <AmountRowBox data-strong={flag(strong)} data-ruled={flag(ruled)} data-muted={flag(muted)}>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </AmountRowBox>
)

export type PublishReviewCalloutProps = { tone: 'positive' | 'warning'; children: ReactNode }

export const PublishReviewCallout = ({ tone, children }: PublishReviewCalloutProps) => (
  <CalloutBox data-tone={tone} role={tone === 'warning' ? 'alert' : undefined}>
    <CalloutIcon aria-hidden asChild>
      {tone === 'positive' ? <LuCheck /> : <LuTriangleAlert />}
    </CalloutIcon>
    <span>{children}</span>
  </CalloutBox>
)

export type PublishReviewStripeFieldProps = {
  /** Set once Stripe's element has painted: until then a skeleton holds its place. */
  ready: boolean
  /** The Stripe elements; none while the session opens. */
  children?: ReactNode
}

/**
 * Where a Stripe element goes. The element mounts hidden under its skeleton, since it paints a moment
 * after it is rendered, and takes the skeleton's place once ready, so nothing jumps in between.
 */
export const PublishReviewStripeField = ({ ready, children }: PublishReviewStripeFieldProps) => (
  <StripeFieldBox data-ready={flag(ready)}>
    {!ready && <PublishReviewSkeleton data-kind='field' />}
    {children && <StripeMount>{children}</StripeMount>}
  </StripeFieldBox>
)

export type PublishReviewFooterProps = {
  /** Text on the left (above the buttons on phones). */
  note?: ReactNode
  /** The buttons, secondary first: on phones they stack with the last one on top. */
  children: ReactNode
}

export const PublishReviewFooter = ({ note, children }: PublishReviewFooterProps) => (
  <FooterBox>
    <FooterNote>{note}</FooterNote>
    <Actions>{children}</Actions>
  </FooterBox>
)
