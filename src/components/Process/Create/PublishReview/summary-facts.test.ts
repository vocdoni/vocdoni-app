import type { ProcessPriceResponse } from '@vocdoni/api-types'
import i18n from 'i18next'
import { defaultProcessValues, type Process, SelectorTypes } from '../common'
import {
  costLines,
  costNote,
  formatLongDateTime,
  formatShortDateTime,
  leadSentence,
  primaryAction,
  publishDates,
  resolvePublishPrimary,
  showsFreeTrialHint,
  summaryFacts,
} from './summary-facts'

const t = i18n.getFixedT('en')

const price = (overrides: Partial<ProcessPriceResponse> = {}): ProcessPriceResponse => ({
  lines: [
    { kind: 'base', description: 'voting process (312 eligible voters)', amountCents: 15716 },
    { kind: 'smsTwoFA', description: 'sms 2FA', amountCents: 1560 },
  ],
  totalCents: 17276,
  currency: 'eur',
  quoteRecommended: false,
  quoteRequired: false,
  ...overrides,
})

const free = () => price({ lines: [{ kind: 'base', description: 'voting process', amountCents: 0 }], totalCents: 0 })
const noSms = () =>
  price({ lines: [{ kind: 'base', description: 'voting process', amountCents: 15716 }], totalCents: 15716 })

const form = (overrides: Partial<Process> = {}): Process => ({
  ...defaultProcessValues,
  title: 'General assembly',
  autoStart: true,
  endDate: '2026-03-12',
  endTime: '20:00',
  questions: [
    { ...defaultProcessValues.questions[0], title: 'Approve the accounts?' },
    { ...defaultProcessValues.questions[0], title: 'Who joins the board?', type: SelectorTypes.Multiple },
  ],
  census: { credentials: ['memberNumber', 'nationalId'], use2FA: true, use2FAMethod: 'voter_choice' },
  ...overrides,
})

const end = new Date(2026, 2, 12, 20, 0)

describe('resolvePublishPrimary', () => {
  const wallet = (balanceCents: number) => ({ balanceCents, currency: 'eur' })

  it('waits while the price loads, fails or needs a custom quote', () => {
    expect(resolvePublishPrimary({ canTopUp: true })).toEqual({ kind: 'waiting', reason: 'loading' })
    expect(resolvePublishPrimary({ price: price(), priceError: true, canTopUp: true })).toEqual({
      kind: 'waiting',
      reason: 'error',
    })
    expect(
      resolvePublishPrimary({ price: price({ quoteRequired: true, lines: [], totalCents: 0 }), canTopUp: true })
    ).toEqual({ kind: 'waiting', reason: 'quote' })
  })

  it('publishes straight away when the vote is free, already paid or the wallet cannot be read', () => {
    expect(resolvePublishPrimary({ price: free(), wallet: wallet(0), canTopUp: true }).kind).toBe('publish')
    expect(
      resolvePublishPrimary({ price: price({ paymentStatus: 'paid' }), wallet: wallet(0), canTopUp: true }).kind
    ).toBe('publish')
    expect(resolvePublishPrimary({ price: price(), canTopUp: true }).kind).toBe('publish')
  })

  it('pays from the wallet when the balance covers the price, exactly too', () => {
    expect(resolvePublishPrimary({ price: price(), wallet: wallet(23080), canTopUp: false })).toEqual({
      kind: 'wallet',
      totalCents: 17276,
      balanceCents: 23080,
      afterCents: 5804,
    })
    expect(resolvePublishPrimary({ price: price(), wallet: wallet(17276), canTopUp: false }).kind).toBe('wallet')
  })

  it('tops up by card when short, unless only an admin may', () => {
    expect(resolvePublishPrimary({ price: price(), wallet: wallet(13080), canTopUp: true })).toEqual({
      kind: 'card',
      totalCents: 17276,
      balanceCents: 13080,
      shortfallCents: 4196,
    })
    expect(resolvePublishPrimary({ price: price(), wallet: wallet(13080), canTopUp: false }).kind).toBe('blocked')
  })

  // An open top-up (after "Back to the summary" from the card step) still leaves the wallet short
  it('treats a draft with an open top-up like an unpaid one when the wallet is readable', () => {
    const pending = price({ paymentStatus: 'pending' })
    expect(resolvePublishPrimary({ price: pending, wallet: wallet(13080), canTopUp: true })).toEqual({
      kind: 'card',
      totalCents: 17276,
      balanceCents: 13080,
      shortfallCents: 4196,
    })
    expect(resolvePublishPrimary({ price: pending, wallet: wallet(13080), canTopUp: false }).kind).toBe('blocked')
    expect(resolvePublishPrimary({ price: pending, wallet: wallet(23080), canTopUp: true })).toEqual({
      kind: 'wallet',
      totalCents: 17276,
      balanceCents: 23080,
      afterCents: 5804,
    })
    // Unreadable, the backend still decides
    expect(resolvePublishPrimary({ price: pending, canTopUp: true }).kind).toBe('publish')
  })

  it('maps each state to the action the button means', () => {
    expect(primaryAction({ kind: 'publish' })).toBe('publish')
    expect(primaryAction({ kind: 'wallet', totalCents: 1, balanceCents: 1, afterCents: 0 })).toBe('wallet')
    expect(primaryAction({ kind: 'card', totalCents: 2, balanceCents: 1, shortfallCents: 1 })).toBe('card')
    expect(primaryAction({ kind: 'blocked', totalCents: 2, balanceCents: 1, shortfallCents: 1 })).toBeNull()
    expect(primaryAction({ kind: 'waiting', reason: 'loading' })).toBeNull()
  })
})

describe('showsFreeTrialHint', () => {
  it('offers a free test above the free tier when SMS codes do not make it paid anyway', () => {
    expect(showsFreeTrialHint(26, noSms())).toBe(true)
    expect(showsFreeTrialHint(25, noSms())).toBe(false)
    expect(showsFreeTrialHint(312, price())).toBe(false)
  })

  it('stays quiet without a price, without voters or once paid', () => {
    expect(showsFreeTrialHint(312, undefined)).toBe(false)
    expect(showsFreeTrialHint(undefined, noSms())).toBe(false)
    expect(showsFreeTrialHint(312, { ...noSms(), paymentStatus: 'paid' })).toBe(false)
  })
})

describe('leadSentence', () => {
  it('says who votes on what until when, from publishing', () => {
    expect(leadSentence(t, form(), 312, 'en')).toBe(
      `312 people can vote on 2 questions, from when you publish until ${formatLongDateTime(end, 'en')}.`
    )
  })

  it('uses the singular for one voter and one question', () => {
    const one = form({ questions: [form().questions[0]] })
    expect(leadSentence(t, one, 1, 'en')).toMatch(/^1 person can vote on 1 question, from when you publish/)
  })

  it('names the start date of a scheduled vote', () => {
    const scheduled = form({ autoStart: false, startDate: '2026-03-05', startTime: '10:00' })
    const start = new Date(2026, 2, 5, 10, 0)
    expect(leadSentence(t, scheduled, 1500, 'en')).toBe(
      `1,500 people can vote on 2 questions, from ${formatLongDateTime(start, 'en')} until ${formatLongDateTime(end, 'en')}.`
    )
  })

  it('reads "the voters" while the census size is unknown', () => {
    expect(leadSentence(t, form(), undefined, 'en')).toMatch(/^The voters can vote on 2 questions/)
  })
})

describe('publishDates', () => {
  it('has no start when the vote opens on publish', () => {
    expect(publishDates(form())).toEqual({ start: null, end })
  })
})

describe('summaryFacts', () => {
  const byKey = (facts: ReturnType<typeof summaryFacts>) => Object.fromEntries(facts.map((f) => [f.key, f]))

  it('lists dates, weight, results, credentials, 2FA and anonymity', () => {
    const facts = byKey(summaryFacts(t, form(), { locale: 'en' }))

    expect(facts.dates).toMatchObject({ label: 'Dates', value: `Now → ${formatShortDateTime(end, 'en')}` })
    expect(facts.weight).toMatchObject({ label: 'Vote weight', value: 'Equal for everyone' })
    expect(facts.results).toMatchObject({ label: 'Results', value: 'Shown when it closes' })
    expect(facts.credentials).toMatchObject({ label: 'Credentials', value: 'Member Number + National ID' })
    expect(facts.code).toMatchObject({ label: '2FA', value: 'Code by email or SMS' })
    expect(facts.anonymous).toMatchObject({ label: 'Anonymous vote', value: 'Off', muted: true })
  })

  it('reflects the other choices', () => {
    const facts = byKey(
      summaryFacts(
        t,
        form({
          autoStart: false,
          startDate: '2026-03-05',
          startTime: '10:00',
          weightedVote: true,
          resultVisibility: 'live',
          anonymousVoting: true,
          census: { credentials: [], use2FA: true, use2FAMethod: 'sms' },
        }),
        { locale: 'en' }
      )
    )

    expect(facts.dates.value).toBe(
      `${formatShortDateTime(new Date(2026, 2, 5, 10, 0), 'en')} → ${formatShortDateTime(end, 'en')}`
    )
    expect(facts.weight.value).toBe('Weighted')
    expect(facts.results.value).toBe('Live')
    expect(facts.credentials).toMatchObject({ value: 'None', muted: true })
    expect(facts.code.value).toBe('Code by SMS')
    expect(facts.anonymous).toMatchObject({ value: 'On', muted: false })
  })

  it('says "No code" without 2FA and hides anonymity where the deployment turns it off', () => {
    const facts = byKey(
      summaryFacts(t, form({ census: { credentials: ['email'], use2FA: false, use2FAMethod: 'email' } }), {
        locale: 'en',
        disableAnonymous: true,
      })
    )
    expect(facts.code.value).toBe('No code')
    expect(facts.anonymous).toBeUndefined()
  })
})

describe('costLines', () => {
  const rows = (lines: ReturnType<typeof costLines>) => lines.map(({ label, value }) => `${label}: ${value}`)

  it("words the backend's voter lines with the census size and totals them, VAT excluded", () => {
    const lines = costLines(t, price(), { voters: 312, primary: { kind: 'publish' } })

    expect(rows(lines)).toEqual(['312 voters: €157.16', 'SMS code, 312 voters: €15.60', 'Total, VAT excluded: €172.76'])
    expect(lines.at(-1)).toMatchObject({ strong: true, ruled: true })
  })

  it('keeps the generic labels when the census size is unknown, and for other kinds', () => {
    const lines = costLines(
      t,
      price({
        lines: [
          { kind: 'base', description: 'voting process', amountCents: 2900 },
          { kind: 'emailTwoFA', description: 'email 2FA', amountCents: 700 },
        ],
        totalCents: 3600,
      }),
      { primary: { kind: 'publish' } }
    )
    expect(rows(lines).slice(0, 2)).toEqual(['Voting process: €29', 'Email verification code: €7'])
  })

  it('adds the balance and what remains after publishing when the wallet covers it', () => {
    const wallet = { balanceCents: 23080 }
    const primary = resolvePublishPrimary({ price: price(), wallet, canTopUp: true })
    expect(rows(costLines(t, price(), { voters: 312, wallet, primary })).slice(3)).toEqual([
      'Organization balance now: €230.80',
      'Balance after publishing: €58.04',
    ])
  })

  it('adds the balance and what is short when it does not', () => {
    const wallet = { balanceCents: 13080 }
    const primary = resolvePublishPrimary({ price: price(), wallet, canTopUp: true })
    const lines = costLines(t, price(), { voters: 312, wallet, primary })
    expect(rows(lines).slice(3)).toEqual(['Organization balance now: €130.80', 'Short: €41.96'])
    expect(lines.at(-1)).toMatchObject({ strong: true })
  })
})

describe('costNote', () => {
  it('explains where the money comes from', () => {
    const covers = resolvePublishPrimary({ price: price(), wallet: { balanceCents: 23080 }, canTopUp: true })
    const short = resolvePublishPrimary({ price: price(), wallet: { balanceCents: 13080 }, canTopUp: true })

    expect(costNote(t, price(), covers)).toMatch(/^It is taken from the organization's prepaid balance/)
    expect(costNote(t, price(), short)).toBe(
      'What is short is paid by card in the next step. The rest comes from the balance.'
    )
    expect(costNote(t, free(), { kind: 'publish' })).toMatch(/free: it publishes without payment/)
    expect(costNote(t, price(), { kind: 'publish' })).toMatch(/Prices exclude VAT/)
  })
})
