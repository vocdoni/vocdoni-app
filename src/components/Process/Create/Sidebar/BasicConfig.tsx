import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Box,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  HStack,
  Input,
  Link,
  Switch,
  VStack,
} from '@chakra-ui/react'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { SubscriptionPermission } from '~constants'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'

const DateFormatHtml = 'yyyy-MM-dd'

export const BasicConfig = () => {
  const { t } = useTranslation()
  const { permission } = useSubscription()
  const { format } = useDateFns()
  const maxDuration = permission(SubscriptionPermission.MaxDuration)
  const [durationExceeded, setDurationExceeded] = useState(false)
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useFormContext()
  const startDateRef = useRef<HTMLInputElement | null>()
  const endDateRef = useRef<HTMLInputElement | null>()
  const [min, setMin] = useState<Date>(new Date())

  const autoStart = watch('autoStart')
  const startDate = watch('startDate')
  const startTime = watch('startTime')
  const endDate = watch('endDate')
  const today = new Date().toISOString().split('T')[0]

  const required = {
    value: true,
    message: t('form.error.field_is_required'),
  }

  const validateDuration = (value: string) => {
    if (!value || !maxDuration) return true

    const start = startDate && !autoStart ? new Date(startDate) : new Date()
    const end = new Date(value)
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const maxDurationDays = parseInt(maxDuration)

    return (
      durationDays <= maxDurationDays ||
      t('form.create_process.error.max_duration_exceeded', {
        defaultValue: 'Exceeds max duration.',
        days: maxDuration,
      })
    )
  }

  const validateEndDateAfterStart = (value: string) => {
    if (!value || !startDate || autoStart) return true
    const start = startDate && !autoStart ? new Date(startDate) : new Date()
    const end = new Date(value)

    return (
      end >= start ||
      t('form.create_process.error.end_date_greater_than_start', {
        defaultValue: 'End date must be greater than start date.',
      })
    )
  }

  const startDateRegister = register('startDate', {
    onChange: (e) => setMin(new Date(e.target.value)),
    required: {
      value: !autoStart,
      message: t('form.error.field_is_required'),
    },
  })

  const endDateRegister = register('endDate', {
    required,
    validate: { validateDuration, validateEndDateAfterStart },
  })

  const showPicker = (ref: MutableRefObject<HTMLInputElement | null | undefined>) => {
    if (ref.current && 'showPicker' in ref.current) ref.current.showPicker()
  }

  useEffect(() => {
    if (!endDate || !maxDuration) return

    const start = startDate && !autoStart ? new Date(startDate) : new Date()
    const end = new Date(endDate)
    const maxDurationDays = parseInt(maxDuration)
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    setDurationExceeded(durationDays > maxDurationDays)
  }, [startDate, endDate, autoStart, maxDuration])

  const handleAutoStartChange = (checked: boolean) => {
    setValue('autoStart', checked)
    if (checked) {
      setValue('startDate', '')
      setValue('startTime', '')
      setMin(new Date())
      clearErrors(['startDate', 'startTime'])
    }
  }

  return (
    <VStack align='stretch' gap={4}>
      <Switch.Root checked={autoStart} onCheckedChange={(details) => handleAutoStartChange(details.checked)}>
        <Switch.HiddenInput {...register('autoStart')} />
        <Switch.Label>
          <Trans i18nKey='process_create.auto_start'>Start immediately</Trans>
        </Switch.Label>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>

      {!autoStart && (
        <>
          <FormControl invalid={!!errors.startDate || !!errors.startTime} mb={2}>
            <FormLabel htmlFor='startDate'>
              <Trans i18nKey='process_create.start_datetime'>Start date and time</Trans>
            </FormLabel>
            <HStack>
              <Box flex='1'>
                <Input
                  id='startDate'
                  {...startDateRegister}
                  ref={(e) => {
                    startDateRegister.ref(e)
                    startDateRef.current = e
                  }}
                  type='date'
                  min={today}
                  onFocus={() => showPicker(startDateRef)}
                />
              </Box>
              <Box flex='1'>
                <Input
                  type='time'
                  {...register('startTime', {
                    required,
                  })}
                />
              </Box>
            </HStack>
            <FormErrorMessage>
              {errors.startDate?.message?.toString() || errors.startTime?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
        </>
      )}

      {/* End date and time */}
      <FormControl invalid={!!errors.endDate || !!errors.endTime} mb={2}>
        <FormLabel htmlFor='endDate'>
          <Trans i18nKey='process_create.end_datetime'>End date and time</Trans>
        </FormLabel>
        <HStack gap={4} align='start'>
          <Box flex='1'>
            <Input
              id='endDate'
              {...endDateRegister}
              ref={(e) => {
                endDateRegister.ref(e)
                endDateRef.current = e
              }}
              type='date'
              min={format(min, DateFormatHtml)}
              onFocus={() => showPicker(endDateRef)}
            />
          </Box>
          <Box flex='1'>
            <Input
              type='time'
              {...register('endTime', {
                required,
                validate: (value: string) => {
                  if (!value || !endDate) return true
                  const end = new Date(`${endDate}T${value}`)
                  const start = startDate && !autoStart ? new Date(`${startDate}T${startTime}`) : new Date()
                  return (
                    end >= start ||
                    t('form.create_process.error.end_time_greater_than_start', {
                      defaultValue: 'End time must be greater than start time.',
                    })
                  )
                },
              })}
            />
          </Box>
        </HStack>
        <FormErrorMessage>
          {errors.endDate?.message?.toString() || errors.endTime?.message?.toString()}
        </FormErrorMessage>
      </FormControl>

      {durationExceeded && (
        <Alert status='error'>
          <AlertIndicator />
          <AlertDescription fontSize='sm'>
            <Trans
              i18nKey='calendar.max_duration_exceeded'
              values={{ maxDuration }}
              components={{
                a: (
                  <Link asChild>
                    <RouterLink to={Routes.dashboard.settings.support} />
                  </Link>
                ),
              }}
              defaults="Duration exceeds your plan's {{ maxDuration }}-day limit. Reduce the voting length, or <a>contact us</a> if you need more days."
            />
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  )
}
