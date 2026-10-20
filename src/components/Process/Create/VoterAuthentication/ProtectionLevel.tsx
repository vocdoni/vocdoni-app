import { Box, HStack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { CodeMethod, PRIVATE_AUTH_FIELDS } from './utils'

export type ProtectionLevel = 'unset' | 'basic' | 'good' | 'strong'

/**
 * How hard it is to vote in another member's place with a given sign-in
 * configuration. The one rule behind every place that grades it (the modal,
 * the sidebar summary), so the grade can never disagree with itself.
 *
 * - strong: a one-time code *and* something the voter has to know.
 * - good: a one-time code alone, or several details including a private one.
 * - basic: details only, and few or public ones.
 */
export const getProtectionLevel = (credentials: readonly string[], codeMethod: CodeMethod): ProtectionLevel => {
  const hasCode = codeMethod !== 'none'
  const count = credentials.length

  if (!hasCode && count === 0) return 'unset'
  if (hasCode) return count > 0 ? 'strong' : 'good'
  const hasPrivateDetail = credentials.some((field) => PRIVATE_AUTH_FIELDS.includes(field))
  return count >= 2 && hasPrivateDetail ? 'good' : 'basic'
}

// Red is kept for what blocks saving (members who can't sign in); a basic but
// valid configuration is a caution, not an error.
export const protectionLevelPalettes: Record<ProtectionLevel, string> = {
  unset: 'gray',
  basic: 'orange',
  good: 'green',
  strong: 'green',
}

const filledSegments: Record<ProtectionLevel, number> = {
  unset: 0,
  basic: 1,
  good: 2,
  strong: 3,
}

export const getProtectionLevelTitle = (t: TFunction, level: ProtectionLevel) => {
  switch (level) {
    case 'strong':
      return t('voter_auth.level.strong', { defaultValue: 'Strong' })
    case 'good':
      return t('voter_auth.level.good', { defaultValue: 'Good' })
    case 'basic':
      return t('voter_auth.level.basic', { defaultValue: 'Basic' })
    default:
      return t('voter_auth.level.unset', { defaultValue: 'Not set' })
  }
}

// The risk said in plain words: what someone would need to vote in a member's
// place. Facts only, no advice on which details to pick: that is the admin's
// call, made with knowledge of their own member list.
const getProtectionLevelDescription = (t: TFunction, level: ProtectionLevel, codeMethod: CodeMethod) => {
  switch (level) {
    case 'strong':
      return t('voter_auth.protection.strong', {
        defaultValue: "Someone would need a member's details and their email or phone to vote in their place.",
      })
    case 'good':
      return codeMethod === 'none'
        ? t('voter_auth.protection.good_details_risk', {
            defaultValue: "Someone would need several private details to vote in a member's place.",
          })
        : t('voter_auth.protection.good_code_risk', {
            defaultValue: "Anyone who can open a member's email or phone could vote in their place.",
          })
    case 'basic':
      return t('voter_auth.protection.basic_risk', {
        defaultValue: "Anyone who knows these details could vote in a member's place.",
      })
    default:
      return t('voter_auth.protection.unset', { defaultValue: 'Choose at least one detail or a code.' })
  }
}

export const ProtectionMeter = ({
  credentials,
  codeMethod,
}: {
  credentials: readonly string[]
  codeMethod: CodeMethod
}) => {
  const { t } = useTranslation()
  const level = getProtectionLevel(credentials, codeMethod)
  const palette = protectionLevelPalettes[level]

  return (
    <Box data-testid='protection-level' data-level={level}>
      <HStack gap={2} fontSize='sm'>
        <Text fontSize='inherit' color='fg.muted'>
          {t('voter_auth.protection.label', { defaultValue: 'Protection' })}
        </Text>
        <HStack gap={0.5} w={16} aria-hidden>
          {[0, 1, 2].map((segment) => (
            <Box
              key={segment}
              flex='1'
              h={1}
              borderRadius='full'
              bg={segment < filledSegments[level] ? `${palette}.solid` : 'bg.emphasized'}
            />
          ))}
        </HStack>
        <Text fontSize='inherit' fontWeight='semibold' color={`${palette}.fg`}>
          {getProtectionLevelTitle(t, level)}
        </Text>
      </HStack>
      <Text fontSize='sm' color='fg.muted' mt={1}>
        {getProtectionLevelDescription(t, level, codeMethod)}
      </Text>
    </Box>
  )
}
