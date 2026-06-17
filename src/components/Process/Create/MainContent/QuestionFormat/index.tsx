import {
  Box,
  chakra,
  HStack,
  Icon,
  Separator,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown, LuSlidersHorizontal } from 'react-icons/lu'
import { SURFACE } from '../../editor/surfaces'
import { textType } from '../../editor/typography'
import { EASE, fadeUp } from '../../VoterAuthentication/motion'
import { MethodPicker } from './MethodPicker'
import { useFormatSummary } from './methods'
import { OptionStyle } from './OptionStyle'

/**
 * Per-question "Voting configuration" — a collapsible section grouping the
 * voting method and option display. Always-visible header + summary so it can't
 * be missed; expands to the full controls. Question 1 is authoritative;
 * questions 2+ show a muted "matches question 1" summary. Keyed by `index` so
 * going truly per-question later is a localized change.
 */
export const QuestionFormat = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const editable = index === 0
  const [open, setOpen] = useState(false)
  const { method, style } = useFormatSummary(index)

  const summaryText = (
    <>
      {method}
      <chakra.span color='texts.subtle'> · {style}</chakra.span>
    </>
  )

  if (!editable) {
    return (
      <TooltipRoot positioning={{ placement: 'top' }}>
        <TooltipTrigger asChild>
          <HStack gap={2} mt={1} cursor='default' color='texts.subtle'>
            <Icon as={LuSlidersHorizontal} boxSize={3.5} flexShrink={0} />
            <Text fontSize='xs' lineClamp={1}>
              <chakra.span fontWeight='medium'>
                {t('editor.format.config_label', { defaultValue: 'Question configuration' })}:{' '}
              </chakra.span>
              {summaryText}
            </Text>
          </HStack>
        </TooltipTrigger>
        <TooltipPositioner>
          <TooltipContent fontSize='sm'>
            {t('editor.format.inherited', { defaultValue: 'Matches question 1' })}
          </TooltipContent>
        </TooltipPositioner>
      </TooltipRoot>
    )
  }

  return (
    <Box mt={4} borderRadius='xl' bg={SURFACE.inset} overflow='hidden'>
      <HStack
        role='button'
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        justify='space-between'
        gap={3}
        p={3}
        cursor='pointer'
        css={{ transition: `background-color 0.15s ${EASE}` }}
        _hover={{ bg: SURFACE.surface }}
      >
        <HStack gap={2.5} minW={0}>
          <Icon as={LuSlidersHorizontal} boxSize={4} color='texts.subtle' flexShrink={0} />
          <VStack align='start' gap={0} minW={0}>
            <Text {...textType.configHeader}>
              {t('editor.format.config_label', { defaultValue: 'Question configuration' })}
            </Text>
            {!open && (
              <Text fontSize='xs' color='texts.primary' lineClamp={1}>
                {summaryText}
              </Text>
            )}
          </VStack>
        </HStack>
        <Icon
          as={LuChevronDown}
          boxSize={4}
          color='texts.subtle'
          flexShrink={0}
          css={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: `transform 0.2s ${EASE}` }}
        />
      </HStack>

      {open && (
        <Box px={3} pb={3} css={{ animation: `${fadeUp} 0.22s ${EASE} both` }}>
          <Separator borderColor='table.border' mb={3} />
          <VStack align='stretch' gap={4}>
            <Box>
              <Text {...textType.controlLabel} mb={1}>
                {t('editor.format.method_label', { defaultValue: 'Voting method' })}
              </Text>
              <Text {...textType.helper} mb={3}>
                {t('editor.format.method_help', { defaultValue: 'Choose how voters answer this question.' })}
              </Text>
              <MethodPicker index={index} />
            </Box>

            <Separator borderColor='table.border' />

            <HStack justify='space-between' gap={3} flexWrap='wrap'>
              <Text {...textType.controlLabel}>
                {t('editor.format.style_label', { defaultValue: 'Option display' })}
              </Text>
              <OptionStyle />
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  )
}
