import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuShield, LuShieldCheck } from 'react-icons/lu'
import { EASE } from './motion'
import { getSecurityLevel, getSecurityLevelMessages, SecurityLevel, SecurityLevels } from './SecurityLevel'

type LevelConfig = {
  fill: string
  color: string
  track: string
}

const LEVEL_CONFIG: Record<SecurityLevel, LevelConfig> = {
  [SecurityLevels.WEAK]: { fill: '33%', color: 'red.500', track: 'red.500' },
  [SecurityLevels.MID]: { fill: '66%', color: 'orange.400', track: 'orange.400' },
  [SecurityLevels.STRONG]: { fill: '100%', color: 'green.500', track: 'green.500' },
}

const useLevelLabel = () => {
  const { t } = useTranslation()
  return (level: SecurityLevel) => {
    switch (level) {
      case SecurityLevels.STRONG:
        return t('voter_auth.security.strong_label', { defaultValue: 'Strong' })
      case SecurityLevels.MID:
        return t('voter_auth.security.mid_label', { defaultValue: 'Good' })
      default:
        return t('voter_auth.security.weak_label', { defaultValue: 'Basic' })
    }
  }
}

export type SecurityGaugeProps = {
  credentials: string[]
  use2FA: boolean
  /** 'inline' for step footers, 'hero' for the launch step. */
  variant?: 'inline' | 'hero'
}

/**
 * A single, living security meter. The fill and colour animate smoothly between
 * states (CSS transitions) as the admin toggles credentials / 2FA, so the
 * consequence of every choice is visible in real time.
 */
export const SecurityGauge = ({ credentials, use2FA, variant = 'inline' }: SecurityGaugeProps) => {
  const { t } = useTranslation()
  const level = getSecurityLevel(use2FA, credentials)
  const config = LEVEL_CONFIG[level]
  const label = useLevelLabel()(level)
  const isHero = variant === 'hero'

  const verdict =
    level === SecurityLevels.STRONG
      ? t('voter_auth.security.verdict_strong', { defaultValue: 'Strong protection' })
      : level === SecurityLevels.MID
        ? t('voter_auth.security.verdict_mid', { defaultValue: 'Good protection' })
        : t('voter_auth.security.verdict_weak', { defaultValue: 'Basic protection' })

  const bar = (
    <Box
      position='relative'
      h={isHero ? '8px' : '6px'}
      w='full'
      bg='table.border'
      borderRadius='full'
      overflow='hidden'
    >
      <Box
        position='absolute'
        insetStart={0}
        top={0}
        h='full'
        borderRadius='full'
        bg={config.track}
        css={{ width: config.fill, transition: `width 0.4s ${EASE}, background-color 0.4s ${EASE}` }}
      />
    </Box>
  )

  if (isHero) {
    const { subtext } = getSecurityLevelMessages(level)
    return (
      <VStack gap={3} w='full' align='center'>
        <Box
          css={{ transition: `color 0.4s ${EASE}` }}
          color={config.color}
          p={3}
          borderRadius='full'
          bg='auth.bg'
          lineHeight={0}
        >
          <Icon as={use2FA ? LuShieldCheck : LuShield} boxSize={8} />
        </Box>
        <Text fontWeight='bold' fontSize='lg' css={{ transition: `color 0.4s ${EASE}` }} color={config.color}>
          {verdict}
        </Text>
        <Box w='full' maxW='280px'>
          {bar}
        </Box>
        <Text fontSize='sm' color='texts.subtle' textAlign='center' maxW='360px'>
          {subtext}
        </Text>
      </VStack>
    )
  }

  return (
    <HStack gap={3} w='full' align='center'>
      <Icon
        as={use2FA ? LuShieldCheck : LuShield}
        boxSize={5}
        color={config.color}
        css={{ transition: `color 0.4s ${EASE}`, flexShrink: 0 }}
      />
      <Box flex={1}>{bar}</Box>
      <Text
        fontSize='sm'
        fontWeight='semibold'
        minW='52px'
        textAlign='end'
        color={config.color}
        css={{ transition: `color 0.4s ${EASE}` }}
      >
        {label}
      </Text>
    </HStack>
  )
}
