import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { IconType } from 'react-icons'
import { EASE } from '../VoterAuthentication/motion'
import { ELEVATION, SURFACE } from './surfaces'

export type SettingsSectionProps = {
  icon: IconType
  title: string
  subtitle?: string
  /** One-line live summary of the current configuration. */
  summary?: ReactNode
  children: ReactNode
  /** Briefly highlight (e.g. when a validation error points here). */
  highlight?: boolean
}

/**
 * Elevated wrapper for a settings group: icon tile + title + subtitle, an
 * optional live summary line, and the control body. Used as the card in the
 * Two-pane rail and as the panel header elsewhere.
 */
export const SettingsSection = ({ icon, title, subtitle, summary, children, highlight }: SettingsSectionProps) => (
  <Box
    borderWidth='1px'
    borderColor={highlight ? 'brand.500' : SURFACE.border}
    borderRadius='xl'
    bg={SURFACE.surface}
    p={4}
    css={{ transition: `border-color 0.25s ${EASE}, box-shadow 0.25s ${EASE}` }}
    boxShadow={highlight ? '0 0 0 1px var(--chakra-colors-brand-500)' : ELEVATION.rest}
  >
    <HStack gap={3} align='start' mb={subtitle || summary ? 3 : 4}>
      <Box bg={SURFACE.inset} p={2} borderRadius='lg' color='texts.primary' lineHeight={0} flexShrink={0}>
        <Icon as={icon} boxSize={5} />
      </Box>
      <VStack align='start' gap={0.5} flex={1} minW={0}>
        <Text fontWeight='semibold' fontSize='sm'>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize='xs' color='texts.subtle'>
            {subtitle}
          </Text>
        )}
        {summary && (
          <Text fontSize='xs' color='texts.subtle' lineClamp={1}>
            {summary}
          </Text>
        )}
      </VStack>
    </HStack>
    {children}
  </Box>
)
