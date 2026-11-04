import { SubscriptionPermission } from '~constants'

// Translation keys for the subscription features
export const PlanFeaturesTranslationKeys = {
  [SubscriptionPermission.Users]: 'features.users',
  [SubscriptionPermission.SubOrgs]: 'features.sub_orgs',
  [SubscriptionPermission.CustomURL]: 'features.custom_url',
  [SubscriptionPermission.WeightedVoting]: 'features.weighted',
  [SubscriptionPermission.ApprovalVoting]: 'features.approval',
  // [SubscriptionPermission.RankedVoting]: 'features.ranked',
  [SubscriptionPermission.SingleVoting]: 'features.single',
  [SubscriptionPermission.MultipleVoting]: 'features.multiple',
  // [SubscriptionPermission.CumulativeVoting]: 'features.cumulative',
  [SubscriptionPermission.Personalization]: 'features.personalization',
  [SubscriptionPermission.EmailReminder]: 'features.email_reminder',
  [SubscriptionPermission.TwoFASms]: 'features.sms_notification',
  [SubscriptionPermission.TwoFAEmail]: 'features.email_notification',
  [SubscriptionPermission.WhiteLabel]: 'features.white_label',
  [SubscriptionPermission.LiveStreaming]: 'features.live_streaming',
  [SubscriptionPermission.Anonymous]: 'features.anonymous',
  [SubscriptionPermission.Overwrite]: 'features.overwrite',
  [SubscriptionPermission.LiveResults]: 'features.live_results',
  [SubscriptionPermission.PhoneSupport]: 'features.phone_support',

  [SubscriptionPermission.MaxCensus]: 'organization.max_census',
  [SubscriptionPermission.MaxProcesses]: 'organization.max_processes',
}

// The keys above are looked up dynamically, so they are listed here for the extractor to keep them
// t('features.sub_orgs', { defaultValue: 'Up to {{ count }} sub-organizations' })
// t('features.custom_url', { defaultValue: 'Custom domain' })
// t('features.weighted', { defaultValue: 'Weighted voting' })
// t('features.approval', { defaultValue: 'Approval voting' })
// t('features.single', { defaultValue: 'Single choice voting' })
// t('features.multiple', { defaultValue: 'Multiple choice voting' })
// t('features.personalization', { defaultValue: 'Full customization' })
// t('features.email_reminder', { defaultValue: 'Email reminder' })
// t('features.sms_notification', { defaultValue: '2FA SMS' })
// t('features.email_notification', { defaultValue: '2FA Email' })
// t('features.white_label', { defaultValue: 'White-label (no vocdoni branding)' })
// t('features.live_streaming', { defaultValue: 'Live streaming integration' })
// t('features.anonymous', { defaultValue: 'Anonymous voting' })
// t('features.overwrite', { defaultValue: 'Vote overwrite' })
// t('features.live_results', { defaultValue: 'Live results' })
// t('features.phone_support', { defaultValue: 'Phone' })
// t('organization.max_census', { defaultValue: 'Max census per vote' })
// t('organization.max_processes', { defaultValue: 'Votes per year¹' })
