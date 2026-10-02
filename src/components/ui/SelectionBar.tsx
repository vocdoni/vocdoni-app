import { CloseButton, Flex, Text, VisuallyHidden } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSupportChatControls } from '~components/SupportChat/controls'

// How long the count must settle before it's announced, so a range of clicks reads out once
export const SELECTION_ANNOUNCE_DELAY = 400

type SelectionBarProps = {
  count: number
  /** Replaces "{{count}} selected" ("1,512 found") */
  label?: string
  /** A second, quieter line: "(2 not on this page)" */
  secondary?: ReactNode
  onClear: () => void
  /** The actions for the selection */
  children?: ReactNode
}

/**
 * A floating bar for what's selected: bottom-centred on wide screens, full width at the bottom on
 * phones. It takes the support chat's corner, so the chat hides while it's showing.
 */
export const SelectionBar = ({ count, label, secondary, onClear, children }: SelectionBarProps) => {
  const { t, i18n } = useTranslation()
  const chat = useSupportChatControls()
  const hideChat = chat?.hideChat
  const countLabel =
    label ??
    t('selection_bar.count', {
      count,
      formattedCount: count.toLocaleString(i18n.resolvedLanguage),
      defaultValue_one: '{{formattedCount}} selected',
      defaultValue_other: '{{formattedCount}} selected',
    })
  const [announced, setAnnounced] = useState('')

  useEffect(() => hideChat?.(), [hideChat])

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(countLabel), SELECTION_ANNOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [countLabel])

  return (
    <Flex
      position='fixed'
      zIndex='banner'
      bottom={{ base: 0, lg: 6 }}
      left={{ base: 0, lg: '50%' }}
      right={{ base: 0, lg: 'auto' }}
      transform={{ lg: 'translateX(-50%)' }}
      maxW={{ lg: 'calc(100vw - 3rem)' }}
      align='center'
      gap={3}
      wrap='wrap'
      pl={4}
      pr={2}
      pt={3}
      pb={{ base: 'calc(12px + env(safe-area-inset-bottom))', lg: 3 }}
      bg='bg.panel'
      border='1px solid'
      borderColor='border'
      borderBottomWidth={{ base: 0, lg: '1px' }}
      borderRadius={{ base: 0, lg: 'xl' }}
      boxShadow='lg'
      animationName='slide-from-bottom, fade-in'
      animationDuration='moderate'
      _motionReduce={{ animation: 'none' }}
    >
      <Flex direction='column' minW={0} mr='auto'>
        <Text fontSize='sm' fontWeight='bolder' fontVariantNumeric='tabular-nums' aria-hidden='true'>
          {countLabel}
        </Text>
        {secondary && (
          <Text fontSize='xs' color='fg.muted'>
            {secondary}
          </Text>
        )}
      </Flex>
      <VisuallyHidden role='status' aria-live='polite'>
        {announced}
      </VisuallyHidden>
      <Flex gap={2} wrap='wrap' align='center'>
        {children}
      </Flex>
      <CloseButton
        size='sm'
        onClick={onClear}
        aria-label={t('selection_bar.clear', { defaultValue: 'Clear selection' })}
      />
    </Flex>
  )
}
