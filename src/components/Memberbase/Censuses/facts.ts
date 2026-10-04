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
    // Only a code that is sent is worth saying: nothing when there's none
    sub: channel
      ? t('census_detail.facts.get_in.then_code', { defaultValue: 'Then a one-time code by {{channel}}', channel })
      : undefined,
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
              defaultValue: 'You can still add and remove members in this census',
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
