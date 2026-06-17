import {
  Box,
  HStack,
  Icon,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
  VStack,
} from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCircleHelp, LuEye, LuEyeOff, LuScale, LuUser } from 'react-icons/lu'
import { Process } from '../../common'
import { OptionCardChoice } from './OptionCardChoice'

/**
 * Result visibility + voting power, presented as segmented option cards instead
 * of dropdowns. Same form fields and semantics as the old ExtraConfig.
 */
export const ResultsSettings = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<Process>()

  return (
    <VStack align='stretch' gap={5}>
      <Box>
        <Text fontSize='sm' fontWeight='semibold' mb={2}>
          {t('process_create.result_visibility.title', { defaultValue: 'Result visibility' })}
        </Text>
        <Controller
          control={control}
          name='resultVisibility'
          rules={{ required: true }}
          render={({ field }) => (
            <OptionCardChoice<'live' | 'hidden'>
              ariaLabel={t('process_create.result_visibility.title', { defaultValue: 'Result visibility' })}
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: 'live',
                  icon: LuEye,
                  label: t('process_create.result_visibility.live', { defaultValue: 'Live results' }),
                  description: t('editor.results.live_desc', { defaultValue: 'Tallies update as votes arrive' }),
                },
                {
                  value: 'hidden',
                  icon: LuEyeOff,
                  label: t('process_create.result_visibility.hidden', { defaultValue: 'Hidden until the end' }),
                  description: t('editor.results.hidden_desc', {
                    defaultValue: 'Results reveal only when voting closes',
                  }),
                },
              ]}
            />
          )}
        />
      </Box>

      <Box>
        <HStack gap={1} mb={2}>
          <Text fontSize='sm' fontWeight='semibold'>
            {t('process_create.weight.title', { defaultValue: 'Voting power' })}
          </Text>
          <TooltipRoot positioning={{ placement: 'top' }}>
            <TooltipTrigger asChild>
              <Box as='span' display='inline-flex' cursor='help' color='texts.subtle'>
                <Icon as={LuCircleHelp} boxSize={3.5} />
              </Box>
            </TooltipTrigger>
            <TooltipPositioner>
              <TooltipContent fontSize='sm' maxW='260px'>
                {t('editor.results.weight_help', {
                  defaultValue:
                    'Choose whether every eligible voter counts equally, or votes are weighted by the memberbase "Vote power" field.',
                })}
              </TooltipContent>
            </TooltipPositioner>
          </TooltipRoot>
        </HStack>
        <Controller
          control={control}
          name='weightedVote'
          rules={{ validate: (v) => v === true || v === false }}
          render={({ field }) => (
            <OptionCardChoice<boolean>
              ariaLabel={t('process_create.weight.title', { defaultValue: 'Voting power' })}
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: false,
                  icon: LuUser,
                  label: t('process_create.weight.equal', { defaultValue: 'One person, one vote' }),
                  description: t('editor.results.equal_desc', { defaultValue: 'Every voter counts the same' }),
                },
                {
                  value: true,
                  icon: LuScale,
                  label: t('process_create.weight.weighted', { defaultValue: 'Weighted by voting power' }),
                  description: t('editor.results.weighted_desc', { defaultValue: 'Uses each member’s vote weight' }),
                },
              ]}
            />
          )}
        />
      </Box>
    </VStack>
  )
}
