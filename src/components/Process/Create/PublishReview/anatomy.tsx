import {
  Button,
  ButtonGroup,
  type ButtonGroupProps,
  type ButtonProps,
  Card,
  type CloseButtonProps,
  createSlotRecipeContext,
  Dialog,
  type DialogDescriptionProps,
  type DialogTitleProps,
  type HTMLChakraProps,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { type ComponentProps, type ReactNode, type RefObject, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseButton } from '~components/ui/CloseButton'
import { BackIcon } from '~theme/icons'

// Every piece reads its layout from the `publishReview` slot recipe; colours and type come from the theme
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
          (overflow === 'auto' || overflow === 'scroll') && area.scrollHeight - area.scrollTop - area.clientHeight > 1
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
// A step without a lead: its eyebrow is the dialog's title. Dialog.Title passes the slot on, so the slot's
// text role wins over the dialog title's own
const EyebrowTitle = withContext<HTMLHeadingElement, DialogTitleProps>(Dialog.Title, 'eyebrow')
const CloseSlot = withContext<HTMLButtonElement, CloseButtonProps>(CloseButton, 'close')
const LeadTitle = withContext<HTMLHeadingElement, DialogTitleProps>(Dialog.Title, 'lead')

/**
 * The step's sentence, the dialog's title: Dialog.Title names the dialog. Focus lands on it when a step
 * opens, so a screen reader reads what changed (see `stepFocusTarget`).
 */
export const PublishReviewLead = (props: DialogTitleProps) => (
  <LeadTitle tabIndex={-1} data-step-focus='lead' {...props} />
)

/** Where focus goes when a step opens: its lead, or the eyebrow of a step without one (a wait, an outcome). */
export const stepFocusTarget = (root?: HTMLElement | null) =>
  root?.querySelector<HTMLElement>('[data-step-focus=lead]') ??
  root?.querySelector<HTMLElement>('[data-step-focus=eyebrow]') ??
  null

/** The text under the lead: the dialog's description, read after its title. */
export const PublishReviewIntro = withContext<HTMLDivElement, DialogDescriptionProps>(Dialog.Description, 'intro')
/** The intro's generic sentence, which phones leave out. */
export const PublishReviewIntroGeneric = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'introGeneric')
export const PublishReviewColumns = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'columns')
export const PublishReviewColumn = withContext<HTMLElement, HTMLChakraProps<'section'>>('section', 'column')
export const PublishReviewSectionTitle = withContext<HTMLHeadingElement, HTMLChakraProps<'h3'>>('h3', 'sectionTitle')
export const PublishReviewQuestionList = withContext<HTMLOListElement, HTMLChakraProps<'ol'>>('ol', 'list')
export const PublishReviewQuestionItem = withContext<HTMLLIElement, HTMLChakraProps<'li'>>('li', 'questionItem')
export const PublishReviewQuestionNumber = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>(
  'span',
  'questionNumber'
)
export const PublishReviewQuestionTitle = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'questionTitle')
export const PublishReviewCost = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'cost')
export const PublishReviewCostSkeleton = withContext<HTMLDivElement, HTMLChakraProps<'div'>>(Skeleton, 'costSkeleton')
// The frame around the disclosure: `variant='frame'`, like the facts it sits among
export const PublishReviewCostRow = withContext<HTMLDivElement, ComponentProps<typeof Card.Root>>(Card.Root, 'costRow')
// The disclosure of the cost: a full-width button that opens the breakdown
export const PublishReviewCostToggle = withContext<HTMLButtonElement, ButtonProps>(Button, 'costToggle')
export const PublishReviewCostSummary = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'costSummary')
export const PublishReviewCostAction = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'costAction')
export const PublishReviewCostPanel = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'costPanel')
/** The title of the cost breakdown: a heading in the section-title role, like the step's section titles. */
export const PublishReviewCostTitle = withContext<HTMLHeadingElement, HTMLChakraProps<'h4'>>('h4', 'sectionTitle')
/** The sunken box of amounts ("What you pay now", the cost breakdown). */
export const PublishReviewAmounts = withContext<HTMLDListElement, HTMLChakraProps<'dl'>>('dl', 'amounts')
/** Padded body of a one-message step (a checkout outcome). */
export const PublishReviewBody = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'body')
/** Centred spinner and message of a wait. */
export const PublishReviewStatus = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'status')
/** The stages of a wait; each item has `data-state` `done` or `active`. */
export const PublishReviewProgress = withContext<HTMLUListElement, HTMLChakraProps<'ul'>>('ul', 'list')
export const PublishReviewProgressItem = withContext<HTMLLIElement, HTMLChakraProps<'li'>>('li', 'progressItem')
/** The round check of the success moment. */
export const PublishReviewPublishedMark = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'publishedMark')
/** Placeholder while Stripe loads; `data-kind` is `lead`, `amounts` or `field`. */
export const PublishReviewSkeleton = withContext<HTMLDivElement, HTMLChakraProps<'div'>>(Skeleton, 'skeleton')
/** The lock line under the card form; the icon goes first. */
export const PublishReviewSecureNote = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'secureNote')

const StripeFieldBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'stripeField')
const StripeMount = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'stripeMount')

const FactRowBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'factRow')
const FactLabel = withContext<HTMLElement, HTMLChakraProps<'dt'>>('dt', 'factLabel')
const FactValue = withContext<HTMLElement, HTMLChakraProps<'dd'>>('dd', 'factValue')
const FactText = withContext<HTMLSpanElement, HTMLChakraProps<'span'>>('span', 'factText')
const FactChange = withContext<HTMLButtonElement, ButtonProps>(Button, 'factChange')
const AmountRowBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'amountRow')
const FooterBox = withContext<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'footer')
const FooterNote = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'footerNote')
// The footer's buttons: the group gives them the phone and desktop size, so no button sets its own
const Actions = withContext<HTMLDivElement, ButtonGroupProps>(ButtonGroup, 'actions')

// Data attributes take no value: present means on
const flag = (on?: boolean) => (on ? '' : undefined)

export type PublishReviewHeaderProps = {
  /** Small label on top of the step ("Review before publishing"). Without a lead, it is the dialog's title. */
  eyebrow?: ReactNode
  /** Shows a "Back to the summary" link in place of the eyebrow. */
  onBack?: () => void
  backLabel?: ReactNode
  /** Shows the close button; leave it out while the dialog must not be dismissed. */
  onClose?: () => void
  /** The lead (`PublishReviewLead`) and intro under the top bar; the lead names the dialog. */
  children?: ReactNode
}

export const PublishReviewHeader = ({ eyebrow, onBack, backLabel, onClose, children }: PublishReviewHeaderProps) => {
  const { t } = useTranslation()
  // A step without a lead has nothing else to name it, so its eyebrow is the dialog's title
  const leading = onBack ? (
    <Button type='button' variant='quiet' onClick={onBack}>
      <BackIcon aria-hidden />
      {backLabel ?? t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
    </Button>
  ) : children == null || children === false ? (
    <EyebrowTitle as='span' tabIndex={-1} data-step-focus='eyebrow'>
      {eyebrow}
    </EyebrowTitle>
  ) : (
    <Eyebrow tabIndex={-1} data-step-focus='eyebrow'>
      {eyebrow}
    </Eyebrow>
  )

  return (
    <HeaderBox>
      <TopBar>
        {leading}
        {onClose && (
          <CloseSlot
            size={{ base: 'lg', md: 'sm' }}
            onClick={onClose}
            aria-label={t('process.publish_review.close', { defaultValue: 'Close' })}
          />
        )}
      </TopBar>
      {children}
    </HeaderBox>
  )
}

export type PublishReviewFactRowProps = {
  label: ReactNode
  value: ReactNode
  /** Muted text after the value. */
  detail?: ReactNode
  muted?: boolean
  /** Shows a quiet "Change" action; `changeLabel` is its accessible name ("Change Dates"). */
  onChange?: () => void
  changeLabel?: string
}

/** A label / value row of the summary's facts (a `Card.Root` as `dl`). */
export const PublishReviewFactRow = ({
  label,
  value,
  detail,
  muted,
  onChange,
  changeLabel,
}: PublishReviewFactRowProps) => {
  const { t } = useTranslation()
  return (
    <FactRowBox>
      <FactLabel>{label}</FactLabel>
      <FactValue data-muted={flag(muted)}>
        <FactText>
          {value}
          {detail && (
            <Text as='span' ms='1.5' color='fg.muted' whiteSpace='nowrap'>
              {detail}
            </Text>
          )}
        </FactText>
        {onChange && (
          <FactChange type='button' variant='quiet' onClick={onChange} aria-label={changeLabel}>
            {t('process.publish_review.change', { defaultValue: 'Change' })}
          </FactChange>
        )}
      </FactValue>
    </FactRowBox>
  )
}

export type PublishReviewAmountRowProps = {
  label: ReactNode
  value: ReactNode
  /** Bold, for totals and what is short. */
  strong?: boolean
  /** A hairline above, to start a new block (total, balance). */
  ruled?: boolean
  muted?: boolean
}

/** One line of `PublishReviewAmounts`. */
export const PublishReviewAmountRow = ({ label, value, strong, ruled, muted }: PublishReviewAmountRowProps) => (
  <AmountRowBox data-strong={flag(strong)} data-ruled={flag(ruled)} data-muted={flag(muted)}>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </AmountRowBox>
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
    <Actions
      size={{ base: 'lg', md: 'md' }}
      // Primary on top and full width on phones, a row on the right from md up. Props, since Group's
      // own row and centring would win over the slot
      flexDirection={{ base: 'column-reverse', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
    >
      {children}
    </Actions>
  </FooterBox>
)
