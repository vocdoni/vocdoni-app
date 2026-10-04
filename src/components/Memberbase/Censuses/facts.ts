import type { TFunction } from 'i18next'
import type { IconType } from 'react-icons'
import { LuCopy, LuFlaskConical, LuHand, LuListChecks, LuLock, LuUsers } from 'react-icons/lu'
import type { MemberFieldId } from '../fields'
import { copiedFromUnnamed } from './labels'
import type { CensusSource } from './model'

/**
 * A sign-in detail inside "They confirm their {{details}}", lowercase where the language wants it. Some
 * languages carry the article or possessive in the word itself (gender agreement), so only use these there.
 */
const fieldInSentence = (t: TFunction, id: string) => {
  switch (id as MemberFieldId) {
    case 'name':
      return t('census_detail.facts.field.name', { defaultValue: 'first name' })
    case 'surname':
      return t('census_detail.facts.field.surname', { defaultValue: 'last name' })
    case 'email':
      return t('census_detail.facts.field.email', { defaultValue: 'email' })
    case 'phone':
      return t('census_detail.facts.field.phone', { defaultValue: 'mobile number' })
    case 'memberNumber':
      return t('census_detail.facts.field.member_number', { defaultValue: 'member number' })
    case 'nationalId':
      return t('census_detail.facts.field.national_id', { defaultValue: 'national ID' })
    case 'birthDate':
      return t('census_detail.facts.field.birth_date', { defaultValue: 'date of birth' })
    default:
      return id
  }
}

/** "member number and date of birth", in the page's language. */
export const detailsList = (t: TFunction, language: string | undefined, authFields: string[]) => {
  const words = authFields.map((id) => fieldInSentence(t, id))
  try {
    return new Intl.ListFormat(language, { type: 'conjunction' }).format(words)
  } catch {
    return words.join(', ')
  }
}

/** Where the one-time code goes: "email", "SMS" or "email or SMS"; nothing when no code is sent. */
export const codeChannel = (t: TFunction, twoFaFields: string[] = []) => {
  const email = twoFaFields.includes('email')
  const sms = twoFaFields.includes('phone')
  if (email && sms) return t('census_detail.facts.channel.email_or_sms', { defaultValue: 'email or SMS' })
  if (email) return t('census_detail.facts.channel.email', { defaultValue: 'email' })
  if (sms) return t('census_detail.facts.channel.sms', { defaultValue: 'SMS' })
  return undefined
}

/** How voters get in, as the card says it: what they confirm, then whether a code follows. */
export const signInFacts = (
  t: TFunction,
  language: string | undefined,
  authFields: string[],
  twoFaFields: string[]
) => {
  const channel = codeChannel(t, twoFaFields)
  if (!authFields.length)
    return {
      value: channel
        ? t('census_detail.facts.get_in.code_only', { defaultValue: 'With a one-time code by {{channel}}', channel })
        : '',
    }
  return {
    value: t('census_detail.facts.get_in.confirm', {
      defaultValue: 'They confirm their {{details}}',
      details: detailsList(t, language, authFields),
    }),
    sub: channel
      ? t('census_detail.facts.get_in.then_code', { defaultValue: 'Then a one-time code by {{channel}}', channel })
      : t('census_detail.facts.get_in.no_code', { defaultValue: 'Without a one-time code' }),
  }
}

type SourceContext = {
  /** Still a draft: members added before publishing join */
  draft: boolean
  /** Its people can still change here */
  editable: boolean
  /** When a vote's own copy was made, formatted */
  copiedOn?: string
  /** Formats a date ("12 Nov 2026") */
  day: (iso: string) => string
}

/** Where a vote's list comes from, as the card says it: an icon, the answer and what it means. */
export const sourceFacts = (
  t: TFunction,
  source: CensusSource,
  { draft, editable, copiedOn, day }: SourceContext
): { icon: IconType; value: string; sub?: string } => {
  const copied = copiedOn
    ? t('census_detail.copied_into.on', { defaultValue: 'Copied on {{date}}', date: copiedOn })
    : undefined
  switch (source.kind) {
    case 'everyone':
      return {
        icon: LuUsers,
        value: t('census_detail.facts.source.everyone', { defaultValue: 'All your members' }),
        sub: draft
          ? t('census_detail.facts.source.everyone_draft', {
              defaultValue: 'Members you add before publishing can vote too',
            })
          : t('census_detail.facts.source.everyone_live', { defaultValue: 'Members you add can vote too' }),
      }
    case 'snapshot':
      return {
        icon: LuLock,
        value: source.madeAt
          ? t('census_detail.facts.source.snapshot_on', {
              defaultValue: 'Your members on {{date}}',
              date: day(source.madeAt),
            })
          : t('census_detail.facts.source.snapshot', { defaultValue: 'Your members when you published' }),
        sub: editable
          ? t('census_detail.facts.source.snapshot_open', {
              defaultValue: 'Fixed when you published. Add late members here.',
            })
          : t('census_detail.facts.source.snapshot_closed', { defaultValue: 'Fixed when you published' }),
      }
    case 'copy':
      if (source.source === 'choose')
        return {
          icon: LuHand,
          value: t('census_detail.facts.source.picked', { defaultValue: 'People you picked one by one' }),
          sub: copiedOn
            ? t('census_detail.facts.source.picked_on', { defaultValue: 'Chosen on {{date}}', date: copiedOn })
            : undefined,
        }
      if (source.source === 'everyone')
        return {
          icon: LuLock,
          value: copiedOn
            ? t('census_detail.facts.source.snapshot_on', { defaultValue: 'Your members on {{date}}', date: copiedOn })
            : t('census_detail.facts.source.members_copy', { defaultValue: 'A copy of your members' }),
          sub: t('census_detail.facts.source.members_copy_hint', {
            defaultValue: "Members you add later aren't included",
          }),
        }
      if (source.from)
        return {
          icon: LuCopy,
          value:
            source.source === 'previous'
              ? t('census_detail.facts.source.from_vote', {
                  defaultValue: "From the vote '{{name}}'",
                  name: source.from,
                })
              : t('census_detail.facts.source.from_saved', {
                  defaultValue: "From the saved census '{{name}}'",
                  name: source.from,
                }),
          sub: copied,
        }
      return { icon: LuCopy, value: copiedFromUnnamed(t, source.source), sub: copied }
    case 'test':
      return { icon: LuFlaskConical, value: t('censuses.source.test', { defaultValue: 'Test vote' }) }
    case 'saved':
      return {
        icon: LuListChecks,
        value: t('census_detail.facts.source.shared', {
          defaultValue: "The saved census '{{name}}'",
          name: source.group.title,
        }),
        sub: t('census_detail.facts.source.shared_hint', { defaultValue: 'Changes to it reach this vote' }),
      }
    case 'selected':
      return {
        icon: LuHand,
        value: t('census_detail.facts.source.picked', { defaultValue: 'People you picked one by one' }),
      }
  }
}

/** The short name of the time zone a date is shown in ("CET"), when the browser knows one. */
export const zoneName = (iso: string, language?: string) => {
  try {
    return new Intl.DateTimeFormat(language, { timeZoneName: 'short' })
      .formatToParts(new Date(iso))
      .find((part) => part.type === 'timeZoneName')?.value
  } catch {
    return undefined
  }
}

type SummaryInput = {
  count: number
  formattedCount: string
  source?: CensusSource
  draft: boolean
  /** When a vote's own copy was made, formatted */
  copiedOn?: string
  day: (iso: string) => string
  details?: string
  channel?: string
  weighted: boolean
  /** Voting dates, already formatted; none for a draft */
  dates?: { start: string; end: string; time: string; zone?: string; over: boolean; canceled: boolean }
}

/** "1,184 members are on the voter list", then where they come from. */
const summaryWho = (t: TFunction, { count, formattedCount, source, draft, copiedOn, day }: SummaryInput) => {
  switch (source?.kind) {
    case 'everyone':
      return draft
        ? t('census_detail.summary.who.everyone_draft', {
            count,
            formattedCount,
            defaultValue_one:
              '1 member is on the voter list: all your members, plus anyone you add before you publish.',
            defaultValue_other:
              '{{formattedCount}} members are on the voter list: all your members, plus anyone you add before you publish.',
          })
        : t('census_detail.summary.who.everyone_live', {
            count,
            formattedCount,
            defaultValue_one: '1 member is on the voter list: all your members, plus anyone you add.',
            defaultValue_other:
              '{{formattedCount}} members are on the voter list: all your members, plus anyone you add.',
          })
    case 'snapshot':
      if (source.madeAt)
        return t('census_detail.summary.who.snapshot_on', {
          count,
          formattedCount,
          date: day(source.madeAt),
          defaultValue_one: '1 member is on the voter list: your members as they were on {{date}}, when you published.',
          defaultValue_other:
            '{{formattedCount}} members are on the voter list: your members as they were on {{date}}, when you published.',
        })
      break
    case 'copy':
      if (source.source === 'choose')
        return t('census_detail.summary.who.picked', {
          count,
          formattedCount,
          defaultValue_one: '1 member is on the voter list, picked one by one.',
          defaultValue_other: '{{formattedCount}} members are on the voter list, picked one by one.',
        })
      if (source.source === 'everyone' && copiedOn)
        return t('census_detail.summary.who.members_copy', {
          count,
          formattedCount,
          date: copiedOn,
          defaultValue_one: '1 member is on the voter list: a copy of your members made on {{date}}.',
          defaultValue_other:
            '{{formattedCount}} members are on the voter list: a copy of your members made on {{date}}.',
        })
      if (source.from)
        return source.source === 'previous'
          ? t('census_detail.summary.who.from_vote', {
              count,
              formattedCount,
              name: source.from,
              defaultValue_one: "1 member is on the voter list, copied from the vote '{{name}}'.",
              defaultValue_other: "{{formattedCount}} members are on the voter list, copied from the vote '{{name}}'.",
            })
          : t('census_detail.summary.who.from_saved', {
              count,
              formattedCount,
              name: source.from,
              defaultValue_one: "1 member is on the voter list, copied from the saved census '{{name}}'.",
              defaultValue_other:
                "{{formattedCount}} members are on the voter list, copied from the saved census '{{name}}'.",
            })
      break
    case 'saved':
      return t('census_detail.summary.who.shared', {
        count,
        formattedCount,
        name: source.group.title,
        defaultValue_one: "1 member is on the voter list, from the saved census '{{name}}'.",
        defaultValue_other: "{{formattedCount}} members are on the voter list, from the saved census '{{name}}'.",
      })
    case 'selected':
      return t('census_detail.summary.who.picked', {
        count,
        formattedCount,
        defaultValue_one: '1 member is on the voter list, picked one by one.',
        defaultValue_other: '{{formattedCount}} members are on the voter list, picked one by one.',
      })
  }
  return t('census_detail.summary.who.plain', {
    count,
    formattedCount,
    defaultValue_one: '1 member is on the voter list.',
    defaultValue_other: '{{formattedCount}} members are on the voter list.',
  })
}

/** The census in a few sentences, to paste into an email to the board. */
export const censusSummary = (t: TFunction, input: SummaryInput) => {
  const { details, channel, weighted, dates } = input
  const parts: string[] = []
  const who = summaryWho(t, input)
  parts.push(who)

  if (details && channel)
    parts.push(
      t('census_detail.summary.how.details_code', {
        defaultValue: 'They get in by confirming their {{details}} and a one-time code sent by {{channel}}.',
        details,
        channel,
      })
    )
  else if (details)
    parts.push(
      t('census_detail.summary.how.details', {
        defaultValue: 'They get in by confirming their {{details}}, without a one-time code.',
        details,
      })
    )
  else if (channel)
    parts.push(
      t('census_detail.summary.how.code', {
        defaultValue: 'They get in with a one-time code sent by {{channel}}.',
        channel,
      })
    )

  if (weighted) parts.push(t('census_detail.summary.weighted', { defaultValue: 'Votes count by voting power.' }))

  if (!dates) parts.push(t('census_detail.summary.when.draft', { defaultValue: "The voting dates aren't set yet." }))
  else {
    const at = dates.zone ? `${dates.time} (${dates.zone})` : dates.time
    if (dates.canceled) parts.push(t('census_detail.summary.when.canceled', { defaultValue: 'The vote was canceled.' }))
    else
      parts.push(
        dates.over
          ? t('census_detail.summary.when.ran', {
              defaultValue: 'Voting ran from {{start}} to {{end}} and closed at {{at}}.',
              start: dates.start,
              end: dates.end,
              at,
            })
          : t('census_detail.summary.when.runs', {
              defaultValue: 'Voting runs from {{start}} to {{end}} and closes at {{at}}.',
              start: dates.start,
              end: dates.end,
              at,
            })
      )
  }

  return parts.join(' ')
}
