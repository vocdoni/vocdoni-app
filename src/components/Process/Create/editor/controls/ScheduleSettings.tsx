import { Box, chakra, HStack, Text, VStack } from '@chakra-ui/react'
import { addDays, format } from 'date-fns'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Process } from '../../common'
import { BasicConfig } from '../../Sidebar/BasicConfig'
import { EASE } from '../../VoterAuthentication/motion'

/**
 * Scheduling. Reuses BasicConfig verbatim (all date/time validation intact) and
 * adds quick-duration preset chips that set the end relative to the start — a
 * premium shortcut for the most common case.
 */
export const ScheduleSettings = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext<Process>()
  const autoStart = watch('autoStart')
  const startDate = watch('startDate')
  const startTime = watch('startTime')

  const presets = [
    { days: 1, label: t('editor.schedule.preset_1d', { defaultValue: '1 day' }) },
    { days: 3, label: t('editor.schedule.preset_3d', { defaultValue: '3 days' }) },
    { days: 7, label: t('editor.schedule.preset_1w', { defaultValue: '1 week' }) },
    { days: 14, label: t('editor.schedule.preset_2w', { defaultValue: '2 weeks' }) },
  ]

  const applyPreset = (days: number) => {
    const base = !autoStart && startDate ? new Date(`${startDate}T${startTime || '00:00'}`) : new Date()
    const end = addDays(base, days)
    setValue('endDate', format(end, 'yyyy-MM-dd'), { shouldDirty: true, shouldValidate: true })
    setValue('endTime', format(end, 'HH:mm'), { shouldDirty: true, shouldValidate: true })
  }

  return (
    <VStack align='stretch' gap={4}>
      <BasicConfig />

      <Box>
        <Text fontSize='xs' color='texts.subtle' mb={2}>
          {t('editor.schedule.presets_label', { defaultValue: 'Quick duration' })}
        </Text>
        <HStack gap={2} flexWrap='wrap'>
          {presets.map((p) => (
            <chakra.button
              type='button'
              key={p.days}
              onClick={() => applyPreset(p.days)}
              px={3}
              py={1.5}
              borderRadius='full'
              borderWidth='1px'
              borderColor='table.border'
              fontSize='xs'
              fontWeight='medium'
              css={{ transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}` }}
              _hover={{ borderColor: 'gray.400', bg: 'auth.bg' }}
            >
              {p.label}
            </chakra.button>
          ))}
        </HStack>
      </Box>
    </VStack>
  )
}
