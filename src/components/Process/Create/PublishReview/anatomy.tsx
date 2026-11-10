import {
  CloseButton,
  type CloseButtonProps,
  createSlotRecipeContext,
  type HTMLChakraProps,
  Skeleton,
} from '@chakra-ui/react'
import { forwardRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuCheck, LuTriangleAlert } from 'react-icons/lu'

// Every piece reads its look from the `publishReview` slot recipe, so a re-theme edits only that file
const { withProvider, withContext } = createSlotRecipeContext({ key: 'publishReview' })

/** One step of the dialog. Render it directly inside `Dialog.Content`; it provides the recipe. */
export const PublishReviewStep = withProvider<HTMLDivElement, HTMLChakraProps<'div'>>('div', 'root')

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
/** Placeholder while Stripe loads; `data-kind` is `lead`, `amounts` or `field`. */
export const PublishReviewSkeleton = withContext<HTMLDivElement, HTMLChakraProps<'div'>>(Skeleton, 'skeleton')
/** The lock line under the card form; the icon goes first. */
export const PublishReviewSecureNote = withContext<HTMLParagraphElement, HTMLChakraProps<'p'>>('p', 'secureNote')

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
