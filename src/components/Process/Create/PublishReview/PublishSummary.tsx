import { Button } from '@chakra-ui/react'
import type { ProcessPriceResponse } from '@vocdoni/api-types'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown } from 'react-icons/lu'
import { currencyExact } from '~utils/numbers'
import type { Process } from '../common'
import { usePrimaryShortcut } from './usePrimaryShortcut'
import {
  PublishReviewAmountRow,
  PublishReviewAmounts,
  PublishReviewColumn,
  PublishReviewColumns,
  PublishReviewCost,
  PublishReviewCostAction,
  PublishReviewCostPanel,
  PublishReviewCostSkeleton,
  PublishReviewCostSummary,
  PublishReviewCostTitle,
  PublishReviewCostToggle,
  PublishReviewFactRow,
  PublishReviewFacts,
  PublishReviewFooter,
  PublishReviewHeader,
  PublishReviewIntro,
  PublishReviewIntroGeneric,
  PublishReviewLead,
  PublishReviewNote,
  PublishReviewQuestionItem,
  PublishReviewQuestionList,
  PublishReviewQuestionNumber,
  PublishReviewQuestionTitle,
  PublishReviewQuestionType,
  PublishReviewSectionTitle,
  PublishReviewStep,
} from './anatomy'
import {
  costLines,
  costNote,
  FREE_TIER_VOTERS,
  leadSentence,
  primaryAction,
  type PublishAction,
  type PublishEditTarget,
  type PublishPrimary,
  type PublishWallet,
  questionTypeLabel,
  resolvePublishPrimary,
  showsFreeTrialHint,
  summaryFacts,
} from './summary-facts'

export type PublishSummaryProps = {
  /** The form as it was saved before opening the dialog. */
  form: Process
  /** Members of the selected group; undefined while unknown. */
  voters?: number
  price?: ProcessPriceResponse
  /** No price to show yet: skeletons, primary disabled. */
  priceLoading?: boolean
  /** A price (or the wallet) being re-read: the last one stays on screen, the primary waits. */
  priceRefreshing?: boolean
  priceError?: boolean
  priceRetrying?: boolean
  onRetryPrice?: () => void
  /** Undefined when it cannot be read (a managed organization) or is still loading. */
  wallet?: PublishWallet
  canTopUp: boolean
  disableAnonymous?: boolean
  /** Id for the eyebrow, to label the dialog with it. */
  titleId?: string
  onKeepEditing: () => void
  /** Closes the dialog from the header; left out, no close button shows. */
  onClose?: () => void
  onPrimary: (action: PublishAction) => void
  /** Takes the user to the setting a row summarises (the dialog closes first); without it rows have no "Change". */
  onEdit?: (target: PublishEditTarget) => void
}

/** The summary step of the publish dialog: what is voted, how, and what publishing it costs. */
export const PublishSummary = ({
  form,
  voters,
  price,
  priceLoading,
  priceRefreshing,
  priceError,
  priceRetrying,
  onRetryPrice,
  wallet,
  canTopUp,
  disableAnonymous,
  titleId,
  onKeepEditing,
  onClose,
  onPrimary,
  onEdit,
}: PublishSummaryProps) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const shownPrice = priceLoading ? undefined : price
  // A price being re-read stays in view, but is not one to act on: the census may have changed since
  const refreshing = !!priceRefreshing && !!shownPrice
  const primary = resolvePublishPrimary({ price: shownPrice, priceError, wallet, canTopUp })
  const action = primaryAction(primary)
  const code = shownPrice?.currency?.toUpperCase()
  const submit = () => {
    if (action && !refreshing) onPrimary(action)
  }
  usePrimaryShortcut(!!action && !refreshing, submit)

  return (
    <PublishReviewStep>
      <PublishReviewHeader
        titleId={titleId}
        eyebrow={t('process.publish_review.eyebrow', { defaultValue: 'Review before publishing' })}
        onClose={onClose}
      >
        <PublishReviewLead>{leadSentence(t, form, voters, locale)}</PublishReviewLead>
        <PublishReviewIntro>
          {/* Phones skip the generic sentence: the header would take half the screen */}
          <PublishReviewIntroGeneric>
            {t('process.publish_review.intro', {
              defaultValue:
                'This is the summary of the vote and what it will cost. If everything is right, you can pay for it and publish it from here.',
            })}
          </PublishReviewIntroGeneric>
          {showsFreeTrialHint(voters, shownPrice) &&
            ` ${t('process.publish_review.free_trial', {
              defaultValue: "If you only want to try it out, pick a census of {{limit}} people or fewer: it's free.",
              limit: FREE_TIER_VOTERS,
            })}`}
        </PublishReviewIntro>
      </PublishReviewHeader>

      <PublishReviewColumns>
        <PublishReviewColumn>
          <PublishReviewSectionTitle>
            {t('process.publish_review.what_is_voted', { defaultValue: 'What is voted' })}
          </PublishReviewSectionTitle>
          <PublishReviewQuestionList>
            {form.questions.map((question, index) => (
              <PublishReviewQuestionItem key={index}>
                <PublishReviewQuestionNumber aria-hidden>{index + 1}</PublishReviewQuestionNumber>
                <span>
                  <PublishReviewQuestionTitle>{question.title}</PublishReviewQuestionTitle>
                  <PublishReviewQuestionType>{questionTypeLabel(t, question.type)}</PublishReviewQuestionType>
                </span>
              </PublishReviewQuestionItem>
            ))}
          </PublishReviewQuestionList>
        </PublishReviewColumn>

        <PublishReviewColumn>
          <PublishReviewSectionTitle>
            {t('process.publish_review.vote_summary', { defaultValue: 'Vote summary' })}
          </PublishReviewSectionTitle>
          <PublishReviewFacts>
            {summaryFacts(t, form, { locale, disableAnonymous }).map(({ key, label, value, detail, muted, target }) => (
              <PublishReviewFactRow
                key={key}
                label={label}
                value={value}
                detail={detail}
                muted={muted}
                onChange={onEdit && (() => onEdit(target))}
                changeLabel={t('process.publish_review.change_what', {
                  defaultValue: 'Change {{what}}',
                  what: label.toLocaleLowerCase(locale),
                })}
              />
            ))}
          </PublishReviewFacts>
          <CostBox
            price={shownPrice}
            primary={primary}
            voters={voters}
            wallet={wallet}
            currencyCode={code}
            onRetry={onRetryPrice}
            retrying={priceRetrying}
          />
        </PublishReviewColumn>
      </PublishReviewColumns>

      <PublishReviewFooter note={primary.kind === 'blocked' ? blockedNote(t, primary.shortfallCents, code) : null}>
        <Button variant='outline' onClick={onKeepEditing}>
          {t('process.publish_review.keep_editing', { defaultValue: 'Keep editing' })}
        </Button>
        <Button
          disabled={!action}
          loading={refreshing && !!action}
          loadingText={primaryLabel(t, primary, code)}
          onClick={submit}
        >
          {primaryLabel(t, primary, code)}
        </Button>
      </PublishReviewFooter>
    </PublishReviewStep>
  )
}

type T = ReturnType<typeof useTranslation>['t']

const primaryLabel = (t: T, primary: PublishPrimary, code?: string) => {
  switch (primary.kind) {
    case 'wallet':
      return t('process.publish_review.primary.wallet', {
        defaultValue: 'Publish and pay {{total}}',
        total: currencyExact(primary.totalCents, code),
      })
    case 'card':
      return t('process.publish_review.primary.card', {
        defaultValue: 'Add {{shortfall}} and publish',
        shortfall: currencyExact(primary.shortfallCents, code),
      })
    default:
      return t('process.publish_review.primary.publish', { defaultValue: 'Publish' })
  }
}

const blockedNote = (t: T, shortfallCents: number, code?: string) =>
  t('process.publish_review.blocked', {
    defaultValue: '{{shortfall}} short in the balance. Only an admin can top it up.',
    shortfall: currencyExact(shortfallCents, code),
  })

type CostBoxProps = {
  price?: ProcessPriceResponse
  primary: PublishPrimary
  voters?: number
  wallet?: PublishWallet
  currencyCode?: string
  onRetry?: () => void
  retrying?: boolean
}

// The collapsible cost under the facts: a one-line total that opens into the breakdown
const CostBox = ({ price, primary, voters, wallet, currencyCode, onRetry, retrying }: CostBoxProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // Opened at the bottom of the scroll area, the breakdown would appear below the fold
  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [open])

  if (primary.kind === 'waiting' && primary.reason === 'error') {
    return (
      <PublishReviewCost data-error=''>
        <PublishReviewNote>
          {t('process.price.error', { defaultValue: 'The price could not be loaded.' })}
        </PublishReviewNote>
        {onRetry && (
          <Button size='xs' variant='outline' onClick={onRetry} loading={retrying}>
            {t('common.retry', { defaultValue: 'Try again' })}
          </Button>
        )}
      </PublishReviewCost>
    )
  }

  if (!price) return <PublishReviewCostSkeleton />

  // A quote-only price has no lines and its zero total is not a price
  if (primary.kind === 'waiting') return <PublishReviewNote>{costNote(t, price, primary)}</PublishReviewNote>

  const total = currencyExact(price.totalCents, currencyCode)
  // Only the price: what the balance lacks is the payment step's business, not something to work out here
  const summary = t('process.publish_review.cost.summary', { defaultValue: 'Cost: {{total}}', total })

  return (
    <PublishReviewCost>
      <PublishReviewCostToggle
        type='button'
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <PublishReviewCostSummary>{summary}</PublishReviewCostSummary>
        <PublishReviewCostAction>
          {t('process.publish_review.cost.details', { defaultValue: 'Review the details' })}
          <LuChevronDown aria-hidden />
        </PublishReviewCostAction>
      </PublishReviewCostToggle>
      {open && (
        <PublishReviewCostPanel id={panelId} ref={panelRef}>
          <PublishReviewCostTitle>
            {t('process.publish_review.cost.title', { defaultValue: 'What you pay for' })}
          </PublishReviewCostTitle>
          <PublishReviewAmounts>
            {costLines(t, price, { voters, wallet, primary }).map(({ key, ...line }) => (
              <PublishReviewAmountRow key={key} {...line} />
            ))}
          </PublishReviewAmounts>
          <PublishReviewNote>{costNote(t, price, primary)}</PublishReviewNote>
        </PublishReviewCostPanel>
      )}
    </PublishReviewCost>
  )
}
