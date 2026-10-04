import type { TFunction } from 'i18next'

/** How voters prove who they are, in plain words, from the census' one-time code channels. */
export const signInText = (t: TFunction, twoFa: string[] = []) => {
  if (twoFa.includes('email') && twoFa.includes('phone')) {
    return t('process_view.sign_in.email_or_sms', {
      defaultValue: 'Members sign in with their details and a one-time code by email or SMS.',
    })
  }
  if (twoFa.includes('email')) {
    return t('process_view.sign_in.email', {
      defaultValue: 'Members sign in with their details and a one-time code by email.',
    })
  }
  if (twoFa.includes('phone')) {
    return t('process_view.sign_in.sms', {
      defaultValue: 'Members sign in with their details and a one-time code by SMS.',
    })
  }
  return t('process_view.sign_in.details', { defaultValue: 'Members sign in with their details.' })
}

/** The same, in a couple of words for a list row ("Code by email"). */
export const signInShortText = (t: TFunction, twoFa: string[] = []) => {
  if (twoFa.includes('email') && twoFa.includes('phone')) {
    return t('process_view.sign_in_short.email_or_sms', { defaultValue: 'Code by email or SMS' })
  }
  if (twoFa.includes('email')) return t('process_view.sign_in_short.email', { defaultValue: 'Code by email' })
  if (twoFa.includes('phone')) return t('process_view.sign_in_short.sms', { defaultValue: 'Code by SMS' })
  return t('process_view.sign_in_short.details', { defaultValue: 'Details only' })
}
