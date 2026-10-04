import { Box, Flex, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import type { ProcessState } from '../../processState'

// A soft ring that grows out of the live dot, so "live" reads at a glance without a loud fill
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--pulse-color); }
  70% { box-shadow: 0 0 0 5px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`

export type StatusDotTone = 'green' | 'orange' | 'blue' | 'gray'

/**
 * A quiet status pill: neutral background and text, the state carried by a coloured dot (pulsing
 * while live). Shared by every place that shows a vote's state, so they read the same.
 */
export const StatusPill = ({
  tone,
  label,
  pulsing,
  size = 'md',
}: {
  tone: StatusDotTone
  label: string
  pulsing?: boolean
  size?: 'sm' | 'md'
}) => (
  <Flex
    as='span'
    display='inline-flex'
    align='center'
    gap={1.5}
    h={size === 'sm' ? 5 : 6}
    px={size === 'sm' ? 2 : 2.5}
    borderRadius='full'
    borderWidth='1px'
    borderColor='border'
    bg='bg.subtle'
    flexShrink={0}
    verticalAlign='middle'
  >
    <Box
      as='span'
      boxSize={1.5}
      borderRadius='full'
      bg={`${tone}.500`}
      css={
        pulsing
          ? {
              '--pulse-color': `color-mix(in srgb, var(--chakra-colors-${tone}-500) 45%, transparent)`,
              animation: `${pulse} 2s ease-out infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }
          : undefined
      }
      aria-hidden
    />
    <Text as='span' fontSize='xs' fontWeight='medium' color='fg' lineHeight='1' whiteSpace='nowrap'>
      {label}
    </Text>
  </Flex>
)

export const StateBadge = ({ state, size = 'md' }: { state?: ProcessState; size?: 'sm' | 'md' }) => {
  const { t } = useTranslation()
  if (!state) return null

  const config: Record<ProcessState, { tone: StatusDotTone; label: string }> = {
    live: { tone: 'green', label: t('process_view.state.live', { defaultValue: 'Live' }) },
    paused: { tone: 'orange', label: t('process_view.state.paused', { defaultValue: 'Paused' }) },
    scheduled: { tone: 'blue', label: t('process_view.state.scheduled', { defaultValue: 'Scheduled' }) },
    ended: { tone: 'gray', label: t('process_view.state.ended', { defaultValue: 'Closed' }) },
    canceled: { tone: 'gray', label: t('process_view.state.canceled', { defaultValue: 'Canceled' }) },
  }
  const { tone, label } = config[state]

  return <StatusPill tone={tone} label={label} pulsing={state === 'live'} size={size} />
}
