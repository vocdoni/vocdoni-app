import { Flex, TagLabel, TagRoot, Text } from '@chakra-ui/react'
import { dotobject } from '@vocdoni/sdk'
import { Trans, useTranslation } from 'react-i18next'
import { BooleanIcon } from '~components/Layout/BooleanIcon'
import { isPlanNamed, PlanName, SubscriptionPermission } from '~constants'
import type { Plan } from './Plans'

export type PlanFeatureSpec = {
  kind: 'plan'
  path: string
  labelKey: string
  tooltip?: string
}

export type StaticFeatureSpec = {
  kind: 'static'
  id: string
  labelKey: string
  tooltip?: string
  render?: (plan: Plan) => React.ReactNode | number | boolean
  available?: (plan: Plan) => boolean
}

export type FeatureSpec = PlanFeatureSpec | StaticFeatureSpec

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

// Translation keys for the subscription features in the comparison table

export const CategoryTitleKeys = {
  generalLimits: 'features.section.general_limits',
  memberbaseManagement: 'features.section.memberbase_management',
  votingTypes: 'features.section.voting_types',
  authenticationSecurity: 'features.section.authentication_security',
  customization: 'features.section.customization',
  extraFeatures: 'features.section.extra_features',
  analyticsAndReporting: 'features.section.analytics_and_reporting',
  support: 'features.section.support',
  complianceAndSecurity: 'features.section.compliance_and_security',
}

// Helper to quickly create specs
export const planFeature = (path: string, labelKey: string, tooltip?: string): PlanFeatureSpec => ({
  kind: 'plan',
  path,
  labelKey,
  tooltip,
})

export const staticFeature = (
  id: string,
  labelKey: string,
  options?: {
    render?: StaticFeatureSpec['render']
    available?: StaticFeatureSpec['available']
  },
  tooltip?: string
): StaticFeatureSpec => ({
  kind: 'static',
  id,
  labelKey,
  tooltip,
  ...options,
})

const OnDemandTag = () => (
  <TagRoot size='sm'>
    <TagLabel>
      <Trans i18nKey='features.on_demand'>On demand</Trans>
    </TagLabel>
  </TagRoot>
)

export const CategorizedSpecs: Record<string, FeatureSpec[]> = {
  generalLimits: [
    planFeature(SubscriptionPermission.MaxCensus, 'organization.max_census'),
    planFeature(SubscriptionPermission.MaxProcesses, 'organization.max_processes'),
    planFeature(SubscriptionPermission.Users, 'features.team_members', 'features.tooltips.team_members'),
  ],
  votingTypes: [
    planFeature(SubscriptionPermission.SingleVoting, 'features.single', 'features.tooltips.single'),
    planFeature(SubscriptionPermission.MultipleVoting, 'features.multiple', 'features.tooltips.multiple'),
    staticFeature(
      'templates',
      'features.vote_templates',
      {
        available: () => true,
      },
      'features.tooltips.templates'
    ),
  ],
  memberbaseManagement: [
    staticFeature(
      'allInOneManagement',
      'features.memberbase_all_in_one_management',
      {
        available: () => true,
      },
      'features.tooltips.memberbase_all_in_one'
    ),
  ],
  authenticationSecurity: [
    planFeature(SubscriptionPermission.TwoFAEmail, 'features.email_notification'),
    planFeature(SubscriptionPermission.TwoFASms, 'features.sms_notification'),
    planFeature(SubscriptionPermission.Anonymous, 'features.anonymous', 'features.tooltips.anonymous'),
    planFeature(SubscriptionPermission.Overwrite, 'features.overwrite', 'features.tooltips.overwrite'),
  ],
  customization: [
    staticFeature('basicBranding', 'features.basic_branding', {
      render: (plan) => (isPlanNamed(plan, PlanName.Professional) ? <OnDemandTag /> : false),
    }),
    planFeature(SubscriptionPermission.WhiteLabel, 'features.white_label'),
    planFeature(SubscriptionPermission.Personalization, 'features.personalization'),
    planFeature(SubscriptionPermission.CustomURL, 'features.custom_url'),
  ],
  extraFeatures: [
    planFeature(SubscriptionPermission.LiveResults, 'features.live_results', 'features.tooltips.live_results'),
    staticFeature('emailNotifications', 'features.email_notifications', {
      render: (plan) => (isPlanNamed(plan, PlanName.Professional) ? <OnDemandTag /> : false),
    }),
    staticFeature('smsNotifications', 'features.sms_notifications', {
      render: (plan) => (isPlanNamed(plan, PlanName.Professional) ? <OnDemandTag /> : false),
    }),
    planFeature(SubscriptionPermission.LiveStreaming, 'features.live_streaming'),
  ],
  analyticsAndReporting: [
    staticFeature('basicAnalytics', 'features.basic_analytics', {
      available: () => true,
    }),
    staticFeature('customReports', 'features.custom_reports', {
      available: () => false,
    }),
  ],
  support: [
    staticFeature('prioritySupport', 'features.priority_support', {
      available: (plan) => (isPlanNamed(plan, PlanName.Professional) ? true : false),
    }),
    staticFeature('emailSupport', 'features.email_support', {
      available: () => true,
      render: (plan) => {
        const { t } = useTranslation()
        return (
          <Flex flexDirection='column' alignItems='center' gap={1}>
            <BooleanIcon value={true} />
            <Text fontSize='xs'>
              {isPlanNamed(plan, PlanName.Professional)
                ? t('features.email_support_premium', { defaultValue: '(24h resp.)' })
                : isPlanNamed(plan, PlanName.Starter)
                  ? t('features.email_support_essential', { defaultValue: '(48h resp.)' })
                  : t('features.email_support_basic', { defaultValue: '(72h resp.)' })}
            </Text>
          </Flex>
        )
      },
    }),
    planFeature(SubscriptionPermission.PhoneSupport, 'features.phone_support'),
    staticFeature('dedicatedAccountManager', 'features.dedicated_account_manager', {
      available: () => false,
    }),
  ],
  complianceAndSecurity: [
    staticFeature('GDPRCompliance', 'features.GDPR_compliance', {
      available: () => true,
    }),
    staticFeature('audit', 'features.audit', {
      available: () => true,
      render: () => (
        <Text fontSize='xs'>
          <Trans i18nKey='features.audit_blockchain'>Fully auditable on blockchain</Trans>
        </Text>
      ),
    }),
    staticFeature(
      'uptime',
      'features.uptime',
      {
        render: (plan) => {
          const { t } = useTranslation()
          return (
            <Flex alignItems='center' justifyContent='center' gap={1}>
              <BooleanIcon value={true} />
              <Text fontSize='xs'>
                {t('features.uptime_guaranteed', {
                  suffix: isPlanNamed(plan, PlanName.Professional)
                    ? t('features.generic_sla', { defaultValue: 'Generic SLA' })
                    : t('features.basic_sla', { defaultValue: 'Best-effort' }),
                  defaultValue: 'Guaranteed ({{suffix}})',
                })}
              </Text>
            </Flex>
          )
        },
      },
      'features.tooltips.uptime'
    ),
  ],
}

/**
 * Checks if the specified feature exists in the plan.
 *
 * @param plan  - The plan object to check.
 * @param featurePath  - Dot notation path to the feature (e.g., 'organization.users').
 * @returns boolean - `true` if the feature exists, `false` otherwise.
 */
export const hasFeature = (plan: Plan, featurePath: string) => dotobject(plan, featurePath) !== 'undefined'

/**
 * Checks if a given feature exists and meets the required condition in a plan.
 *
 * @param plan - The plan object to check.
 * @param featurePath - Dot notation path to the feature (e.g., 'organization.users').
 * @param expectedValue - Expected value or comparison object.
 *                         - If a number, checks for >= comparison.
 *                         - If an object, supports { operator, value } (e.g., { operator: '>=', value: 10 }).
 * @returns boolean - `true` if the feature meets the condition, `false` otherwise.
 */
export const isFeatureAvailable = (
  plan: Plan,
  featurePath: string,
  expectedValue?: number | { operator: '===' | '>' | '>=' | '<' | '<='; value: number }
): boolean => {
  const featureValue = dotobject(plan, featurePath) // Get the feature value using dot notation

  if (typeof featureValue === 'undefined') {
    return false // If the feature doesn't exist, return false
  }

  // If no expected value is provided, return true if the feature exists
  if (typeof expectedValue === 'undefined') {
    return true
  }

  // Handle exact match or comparison
  if (typeof expectedValue === 'number') {
    return featureValue >= expectedValue // Default to "greater than or equal to" for numbers
  }

  if (typeof expectedValue === 'object' && expectedValue.operator && expectedValue.value !== undefined) {
    const { operator, value } = expectedValue

    switch (operator) {
      case '===':
        return featureValue === value
      case '>':
        return featureValue > value
      case '>=':
        return featureValue >= value
      case '<':
        return featureValue < value
      case '<=':
        return featureValue <= value
      default:
        throw new Error(`Unsupported operator: ${operator}`)
    }
  }

  throw new Error('Invalid expectedValue type')
}

// We need to include all the translations in a way the extractor does not remove them, that's why this is here
// i18next-extract-mark-ns:categories
// t('features.team_members', { defaultValue: 'Team members' })
// t('features.total_users', { defaultValue: 'Total available users' })
// t('features.sub_orgs', { defaultValue: 'Up to {{ count }} sub-organizations' })
// t('features.total_orgs', { defaultValue: 'Total available sub-organizations' })
// t('features.custom_url', { defaultValue: 'Custom domain' })
// t('features.single', { defaultValue: 'Single choice voting' })
// t('features.multiple', { defaultValue: 'Multiple choice voting' })
// t('features.approval', { defaultValue: 'Approval voting' })
// t('features.cumulative', { defaultValue: 'Cumulative voting' })
// t('features.ranked', { defaultValue: 'Ranked voting' })
// t('features.weighted', { defaultValue: 'Weighted voting' })
// t('features.personalization', { defaultValue: 'Full customization' })
// t('features.email_reminder', { defaultValue: 'Email reminder' })
// t('features.sms_notification', { defaultValue: '2FA SMS' })
// t('features.email_notification', { defaultValue: '2FA Email' })
// t('features.white_label', { defaultValue: 'White-label (no vocdoni branding)' })
// t('features.live_streaming', { defaultValue: 'Live streaming integration' })
// t('features.anonymous_voting', { defaultValue: 'Anonymous voting' })
// t('features.overwrite', { defaultValue: 'Vote overwrite' })
// t('features.live_results', { defaultValue: 'Live results' })
// t('features.phone_support', { defaultValue: 'Phone' })
// t('organization.max_census', { defaultValue: 'Max census per vote' })
// t('organization.max_processes', { defaultValue: 'Votes per year¹' })
// t('features.participatory_budgeting', { defaultValue: 'Participatory budgeting' })
// t('features.vote_templates', { defaultValue: 'Easy-to-use templates for all voting methods' })
// t('features.memberbase_all_in_one_management', { defaultValue: 'All-in-one memberbase management' })
// t('features.basic_branding', { defaultValue: 'Basic branding' })
// t('features.email_notifications', { defaultValue: 'Email notifications to voters' })
// t('features.sms_notifications', { defaultValue: 'SMS notifications to voters' })
// t('features.basic_analytics', { defaultValue: 'Basic Analytics' })
// t('features.custom_reports', { defaultValue: 'Custom Reports' })
// t('features.priority_support', { defaultValue: 'Priority support' })
// t('features.email_support', { defaultValue: 'Email' })
// t('features.email_support_premium', { defaultValue: '(24h resp.)' })
// t('features.email_support_essential', { defaultValue: '(48h resp.)' })
// t('features.email_support_basic', { defaultValue: '(72h resp.)' })
// t('features.dedicated_account_manager', { defaultValue: 'Dedicated Account Manager' })
// t('features.GDPR_compliance', { defaultValue: 'GDPR Compliance' })
// t('features.uptime', { defaultValue: '99.99% Uptime' })
// t('features.uptime_guaranteed', { defaultValue: 'Guaranteed ({{suffix}})' })
// t('features.generic_sla', { defaultValue: 'Generic SLA' })
// t('features.basic_sla', { defaultValue: 'Best-effort' })
// t('features.section.voting_types', { defaultValue: 'Voting Types' })
// t('features.section.features', { defaultValue: 'Features' })
// t('features.section.organization', { defaultValue: 'Organization' })
// t('features.section.general_limits', { defaultValue: 'General Limits' })
// t('features.section.memberbase_management', { defaultValue: 'Memberbase Management' })
// t('features.section.authentication_security', { defaultValue: 'Authentication & Security' })
// t('features.section.customization', { defaultValue: 'Customization' })
// t('features.section.extra_features', { defaultValue: 'Extra Features' })
// t('features.section.analytics_and_reporting', { defaultValue: 'Analytics & Reporting' })
// t('features.section.support', { defaultValue: 'Support' })
// t('features.section.compliance_and_security', { defaultValue: 'Compliance & Security' })
// t('features.tooltips.team_members', { defaultValue: 'Invite team members and assign role-based permissions so you can effortlessly manage your organization's governance.'})
// t('features.tooltips.single', { defaultValue: 'Voters can select only one option from the available choices. Perfect for elections and simple yes/no decisions.'})
// t('features.tooltips.multiple', { defaultValue: 'Voters can select multiple options from the available choices. Ideal for surveys and decisions where multiple selections are allowed.'})
// t('features.tooltips.templates', { defaultValue: 'With our templates, it\'s so easy to start with ready-made setups for AGMs, Elections, and Participatory budgeting (and much more to come).'})
// t('features.tooltips.memberbase_all_in_one', { defaultValue: 'Import your memberbase to create groups of eligible voters and manage voting permissions in a really easy way.'})
// t('features.tooltips.anonymous', { defaultValue: 'This is an optional feature that organizers can choose. When enabled, votes are completely anonymous - not even we can know who voted for a specific option. Alternatively, organizers can choose to encrypt results until the vote ends, or make the vote completely public.'})
// t('features.tooltips.overwrite', { defaultValue: 'Voters can change their vote before the voting period ends. This feature helps avoid mistakes and prevents coercion by allowing voters to correct their choices.'})
// t('features.tooltips.live_results', { defaultValue: 'This is an optional feature that organizers can choose. Results can be displayed in real-time as votes are cast, or organizers can choose to keep results encrypted and hidden until the voting period ends.'})
// t('features.tooltips.uptime', { defaultValue: 'We guarantee a 99.99% uptime, but only in the paid plans these are enforced by contract with warranties.'})
// t('features.audit', { defaultValue: 'Audit' })
