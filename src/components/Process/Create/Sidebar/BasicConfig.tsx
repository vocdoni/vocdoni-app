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
import { MutableRefObject, ReactNode, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { useSubscription } from '~components/Auth/Subscription'
import { SubscriptionPermission } from '~constants'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { parseFormDateTime, Process } from '../common'

const DateFormatHtml = 'yyyy-MM-dd'

type ScheduleValues = Pick<Process, 'autoStart' | 'startDate' | 'startTime' | 'endTime'>

// When the vote opens: now for an immediate start (or while no start date is set), else the picked local date/time.
const getStart = ({ autoStart, startDate, startTime }: ScheduleValues) =>
  startDate && !autoStart ? parseFormDateTime(startDate, startTime) : new Date()

// Trans replaces its component's children with the translated text, so the RouterLink must live
// inside a wrapper; passed inline, `asChild` would be left without a child and Chakra would throw.
const SupportLink = ({ children }: { children?: ReactNode }) => (
  <Link asChild>
    <RouterLink to={Routes.dashboard.settings.support}>{children}</RouterLink>
  </Link>
)

export const BasicConfig = () => {
  const { t } = useTranslation()
  const { permission } = useSubscription()
  const { format } = useDateFns()
  const maxDuration = permission(SubscriptionPermission.MaxDuration)
  const {
    register,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    clearErrors,
    trigger,
  } = useFormContext<Process>()
  const startDateRef = useRef<HTMLInputElement | null>(null)
  const endDateRef = useRef<HTMLInputElement | null>(null)

  const autoStart = watch('autoStart')
  const startDate = watch('startDate')
  const startTime = watch('startTime')
  const endDate = watch('endDate')
  const endTime = watch('endTime')
  const today = format(new Date(), DateFormatHtml)
  // Derived from the form values, so it also holds for a start date loaded from a draft or cleared.
  const endDateMin = !autoStart && startDate ? startDate : today

  const required = {
    value: true,
    message: t('form.error.field_is_required'),
  }

  // Whether an end date goes past the plan's duration limit; shared by the field validation and the warning.
  // Validators pass RHF's current form values: `deps`/`trigger` can run before a re-render refreshes these closures.
  const exceedsMaxDuration = (value: string, values: ScheduleValues) => {
    if (!value || !maxDuration) return false

    const end = parseFormDateTime(value, values.endTime)
    const durationDays = (end.getTime() - getStart(values).getTime()) / (1000 * 60 * 60 * 24)

    return durationDays > parseInt(maxDuration)
  }

  // Derived on render, so it also clears when the end date is emptied or the limit goes away.
  const durationExceeded = exceedsMaxDuration(endDate, { autoStart, startDate, startTime, endTime })

  const validateDuration = (value: string, values: Process) => {
    return (
      !exceedsMaxDuration(value, values) ||
      t('form.create_process.error.max_duration_exceeded', {
        defaultValue: 'Exceeds max duration.',
        days: maxDuration,
      })
    )
  }

  const validateEndDateAfterStart = (value: string, { startDate, autoStart }: Process) => {
    if (!value || !startDate || autoStart) return true
    const start = parseFormDateTime(startDate)
    const end = parseFormDateTime(value)

    return (
      end >= start ||
      t('form.create_process.error.end_date_greater_than_start', {
        defaultValue: 'End date must be greater than start date.',
      })
    )
  }

  const startDateRegister = register('startDate', {
    // Re-check the end date/time against the new start once the form has been submitted.
    deps: ['endDate', 'endTime'],
    required: {
      value: !autoStart,
      message: t('form.error.field_is_required'),
    },
  })

  const endDateRegister = register('endDate', {
    required,
    // The end time is validated against the end date, so re-check it once the form has been submitted.
    deps: ['endTime'],
    validate: { validateDuration, validateEndDateAfterStart },
  })

  const showPicker = (ref: MutableRefObject<HTMLInputElement | null | undefined>) => {
    if (ref.current && 'showPicker' in ref.current) ref.current.showPicker()
  }

  const handleAutoStartChange = (checked: boolean) => {
    setValue('autoStart', checked)
    if (checked) {
      setValue('startDate', '')
      setValue('startTime', '')
      clearErrors(['startDate', 'startTime'])
    }
    // The end fields are measured from the start, so re-check them for the new mode once submitted.
    if (isSubmitted) trigger(['endDate', 'endTime'])
  }

  return (
    <VStack align='stretch' gap={4}>
      <Switch.Root checked={autoStart} onCheckedChange={(details) => handleAutoStartChange(details.checked)}>
        {/* Controlled: registering the hidden input stored its "on" value instead of the boolean */}
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>
          <Trans i18nKey='process_create.auto_start'>Start immediately</Trans>
        </Switch.Label>
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
                    deps: ['endDate', 'endTime'],
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
              min={endDateMin}
              onFocus={() => showPicker(endDateRef)}
            />
          </Box>
          <Box flex='1'>
            <Input
              type='time'
              {...register('endTime', {
                required,
                deps: ['endDate'],
                validate: (value: string, values: Process) => {
                  if (!value || !values.endDate) return true
                  const end = parseFormDateTime(values.endDate, value)
                  const start = getStart(values)
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
              components={{ a: <SupportLink /> }}
              defaults="Duration exceeds your plan's {{ maxDuration }}-day limit. Reduce the voting length, or <a>contact us</a> if you need more days."
            />
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  )
}
