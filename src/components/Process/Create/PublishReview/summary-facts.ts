import type { ProcessPriceResponse } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'
import { getAuthFieldLabel } from '~components/Process/CSP/fields'
import { lineLabel, priceNote } from '~components/Pricing/ProcessPrice'
import { isQuoteOnly } from '~queries/process-price'
import { currency, quantity } from '~utils/numbers'
import { parseFormDateTime, type Process, SelectorTypes } from '../common'
import { type CodeMethod, fromCensus } from '../VoterAuthentication/utils'

// Mirrors the backend's free tier: GET /pricing charges nothing for the base of up to 25 voters
// (SMS codes are still charged).
export const FREE_TIER_VOTERS = 25

/** The part of the wallet the summary reads; a `WalletResponse` fits as is. */
export type PublishWallet = { balanceCents: number; currency?: string }

/** What the summary's primary button does once clicked. */
export type PublishAction = 'publish' | 'wallet' | 'card'

/**
 * The primary button's state. `wallet`: the balance covers the price; `card`: it is short and the
 * user may top it up; `blocked`: it is short and only an admin may; `waiting`: no price to act on.
 */
export type PublishPrimary =
  | { kind: 'waiting'; reason: 'loading' | 'error' | 'quote' }
  | { kind: 'publish' }
  | { kind: 'wallet'; totalCents: number; balanceCents: number; afterCents: number }
  | { kind: 'card'; totalCents: number; balanceCents: number; shortfallCents: number }
  | { kind: 'blocked'; totalCents: number; balanceCents: number; shortfallCents: number }

/** Whether publishing takes money from the wallet: not when free, paid, quote-only or a top-up is open. */
export const walletPays = (price: ProcessPriceResponse): boolean =>
  !isQuoteOnly(price) && price.totalCents > 0 && price.paymentStatus !== 'paid' && price.paymentStatus !== 'pending'

type PrimaryInput = {
  price?: ProcessPriceResponse
  priceError?: boolean
  wallet?: PublishWallet
  canTopUp: boolean
}

export const resolvePublishPrimary = ({ price, priceError, wallet, canTopUp }: PrimaryInput): PublishPrimary => {
  if (priceError) return { kind: 'waiting', reason: 'error' }
  if (!price) return { kind: 'waiting', reason: 'loading' }
  if (isQuoteOnly(price)) return { kind: 'waiting', reason: 'quote' }
  // An unreadable wallet (a managed organization's integrator pays) leaves the backend to decide;
  // a refused publish is handled by the dialog
  if (!walletPays(price) || !wallet) return { kind: 'publish' }

  const totalCents = price.totalCents
  const balanceCents = wallet.balanceCents
  if (balanceCents >= totalCents) {
    return { kind: 'wallet', totalCents, balanceCents, afterCents: balanceCents - totalCents }
  }
  const shortfallCents = totalCents - balanceCents
  return { kind: canTopUp ? 'card' : 'blocked', totalCents, balanceCents, shortfallCents }
}

/** The action the primary button means, or null while it is disabled. */
export const primaryAction = (primary: PublishPrimary): PublishAction | null => {
  switch (primary.kind) {
    case 'publish':
    case 'wallet':
    case 'card':
      return primary.kind
    default:
      return null
  }
}

/** Offer a free test run only when the census is what makes the vote paid: SMS codes cost anyway. */
export const showsFreeTrialHint = (voters: number | undefined, price?: ProcessPriceResponse): boolean =>
  voters !== undefined &&
  voters > FREE_TIER_VOTERS &&
  !!price &&
  price.paymentStatus !== 'paid' &&
  !price.lines.some((line) => line.kind === 'smsTwoFA')

/** Start (null when the vote opens on publish) and end of the vote, as the form holds them. */
export const publishDates = (form: Pick<Process, 'autoStart' | 'startDate' | 'startTime' | 'endDate' | 'endTime'>) => ({
  start: form.autoStart || !form.startDate ? null : parseFormDateTime(form.startDate, form.startTime),
  end: parseFormDateTime(form.endDate, form.endTime),
})

export const formatLongDateTime = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

export const formatShortDateTime = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

export const votersText = (t: TFunction, voters?: number) =>
  voters === undefined
    ? t('process.publish_review.voters_unknown', { defaultValue: 'The voters' })
    : t('process.publish_review.voters', {
        count: voters,
        voters: quantity(voters),
        defaultValue_one: '{{voters}} person',
        defaultValue_other: '{{voters}} people',
      })

export const questionsText = (t: TFunction, questions: number) =>
  t('process.publish_review.questions', {
    count: questions,
    defaultValue_one: '{{count}} question',
    defaultValue_other: '{{count}} questions',
  })

/** The headline: who votes on what, and for how long. The verb agrees with the voters. */
export const leadSentence = (t: TFunction, form: Process, voters: number | undefined, locale?: string) => {
  const { start, end } = publishDates(form)
  // Unknown voters read as "the voters", a plural. Passed as a literal `count` below, not
  // through the spread, so `pnpm translations` extracts these keys as plurals
  const count = voters ?? 2
  const values = {
    voters: votersText(t, voters),
    questions: questionsText(t, form.questions.length),
    end: formatLongDateTime(end, locale),
  }
  if (!start) {
    return t('process.publish_review.lead_now', {
      count,
      ...values,
      defaultValue_one: '{{voters}} can vote on {{questions}}, from when you publish until {{end}}.',
      defaultValue_other: '{{voters}} can vote on {{questions}}, from when you publish until {{end}}.',
    })
  }
  return t('process.publish_review.lead_scheduled', {
    count,
    ...values,
    start: formatLongDateTime(start, locale),
    defaultValue_one: '{{voters}} can vote on {{questions}}, from {{start}} until {{end}}.',
    defaultValue_other: '{{voters}} can vote on {{questions}}, from {{start}} until {{end}}.',
  })
}

export const questionTypeLabel = (t: TFunction, type: SelectorTypes) =>
  type === SelectorTypes.Multiple
    ? t('process.publish_review.type.multiple', { defaultValue: 'Multiple choice' })
    : t('process.publish_review.type.single', { defaultValue: 'Single choice' })

export const codeMethodLabel = (t: TFunction, method: CodeMethod) => {
  switch (method) {
    case 'email':
      return t('process.publish_review.code.email', { defaultValue: 'Code by email' })
    case 'sms':
      return t('process.publish_review.code.sms', { defaultValue: 'Code by SMS' })
    case 'voter_choice':
      return t('process.publish_review.code.choice', { defaultValue: 'Code by email or SMS' })
    default:
      return t('process.publish_review.code.none', { defaultValue: 'No code' })
  }
}

export type SummaryFact = { key: string; label: string; value: string; muted?: boolean }

/** The "Vote summary" rows. Anonymity is left out where the deployment turns it off. */
export const summaryFacts = (
  t: TFunction,
  form: Process,
  { locale, disableAnonymous }: { locale?: string; disableAnonymous?: boolean }
): SummaryFact[] => {
  const { start, end } = publishDates(form)
  const { credentials, codeMethod } = fromCensus(form.census)

  const facts: SummaryFact[] = [
    {
      key: 'dates',
      label: t('process.publish_review.facts.dates', { defaultValue: 'Dates' }),
      value: t('process.publish_review.facts.dates_value', {
        defaultValue: '{{start}} → {{end}}',
        start: start
          ? formatShortDateTime(start, locale)
          : t('process.publish_review.facts.now', { defaultValue: 'Now' }),
        end: formatShortDateTime(end, locale),
      }),
    },
    {
      key: 'weight',
      label: t('process.publish_review.facts.weight', { defaultValue: 'Vote weight' }),
      value: form.weightedVote
        ? t('process.publish_review.facts.weighted', { defaultValue: 'Weighted' })
        : t('process.publish_review.facts.equal', { defaultValue: 'Equal for everyone' }),
    },
    {
      key: 'results',
      label: t('process.publish_review.facts.results', { defaultValue: 'Results' }),
      value:
        form.resultVisibility === 'live'
          ? t('process.publish_review.facts.results_live', { defaultValue: 'Live' })
          : t('process.publish_review.facts.results_hidden', { defaultValue: 'Shown when it closes' }),
    },
    {
      key: 'credentials',
      label: t('process.publish_review.facts.credentials', { defaultValue: 'Credentials' }),
      value: credentials.length
        ? credentials.map((field) => getAuthFieldLabel(t, field)).join(' + ')
        : t('process.publish_review.facts.credentials_none', { defaultValue: 'None' }),
      muted: !credentials.length,
    },
    {
      key: 'code',
      label: t('process.publish_review.facts.code', { defaultValue: '2FA' }),
      value: codeMethodLabel(t, codeMethod),
    },
  ]

  if (!disableAnonymous) {
    facts.push({
      key: 'anonymous',
      label: t('process.publish_review.facts.anonymous', { defaultValue: 'Anonymous vote' }),
      value: form.anonymousVoting
        ? t('process.publish_review.facts.on', { defaultValue: 'On' })
        : t('process.publish_review.facts.off', { defaultValue: 'Off' }),
      muted: !form.anonymousVoting,
    })
  }

  return facts
}

export type AmountLine = { key: string; label: string; value: string; strong?: boolean; ruled?: boolean }

/**
 * The cost breakdown: the backend's lines (voter-based ones worded with the census size), the
 * total, then what the wallet has and what publishing leaves in it or lacks.
 */
export const costLines = (
  t: TFunction,
  price: ProcessPriceResponse,
  { voters, wallet, primary }: { voters?: number; wallet?: PublishWallet; primary: PublishPrimary }
): AmountLine[] => {
  const code = price.currency?.toUpperCase()
  const money = (cents: number) => currency(cents, code)
  const label = (line: ProcessPriceResponse['lines'][number]) => {
    if (voters === undefined) return lineLabel(t, line)
    if (line.kind === 'base') {
      return t('process.publish_review.cost.base', {
        count: voters,
        voters: quantity(voters),
        defaultValue_one: '{{voters}} voter',
        defaultValue_other: '{{voters}} voters',
      })
    }
    if (line.kind === 'smsTwoFA') {
      return t('process.publish_review.cost.sms', {
        count: voters,
        voters: quantity(voters),
        defaultValue_one: 'SMS code, {{voters}} voter',
        defaultValue_other: 'SMS code, {{voters}} voters',
      })
    }
    return lineLabel(t, line)
  }

  const lines: AmountLine[] = price.lines.map((line, i) => ({
    key: `${line.kind}-${i}`,
    label: label(line),
    value: money(line.amountCents),
  }))
  lines.push({
    key: 'total',
    label: t('process.publish_review.cost.total', { defaultValue: 'Total, VAT excluded' }),
    value: money(price.totalCents),
    strong: true,
    ruled: true,
  })

  if (wallet && (primary.kind === 'wallet' || primary.kind === 'card' || primary.kind === 'blocked')) {
    lines.push({
      key: 'balance',
      label: t('process.publish_review.cost.balance_now', { defaultValue: 'Organization balance now' }),
      value: money(wallet.balanceCents),
      ruled: true,
    })
    lines.push(
      primary.kind === 'wallet'
        ? {
            key: 'after',
            label: t('process.publish_review.cost.balance_after', { defaultValue: 'Balance after publishing' }),
            value: money(primary.afterCents),
          }
        : {
            key: 'short',
            label: t('process.publish_review.cost.short', { defaultValue: 'Short' }),
            value: money(primary.shortfallCents),
            strong: true,
          }
    )
  }

  return lines
}

/** The note under the breakdown: where the money comes from. */
export const costNote = (t: TFunction, price: ProcessPriceResponse, primary: PublishPrimary) => {
  if (primary.kind === 'wallet') {
    return t('process.publish_review.cost.note_wallet', {
      defaultValue:
        "It is taken from the organization's prepaid balance. Nothing is charged to a card: VAT is paid when the balance is topped up.",
    })
  }
  if (primary.kind === 'card') {
    return t('process.publish_review.cost.note_card', {
      defaultValue: 'What is short is paid by card in the next step. The rest comes from the balance.',
    })
  }
  return priceNote(t, price)
}
