import {
  Box,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  Icon,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useId } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { HelpIcon } from '~theme/icons'
import { Select } from '~components/Form/Select'
import { useAnonymityLabels } from '~components/Process/anonymityLabels'
import { Tooltip } from '~components/ui/Tooltip'
import { useAppEnv } from '~src/app-env'
import { useValidations } from '~utils/validation'
import { Process } from '../common'

type SelectOption<T = string> = {
  value: T
  label: string
}

const LabelTooltip = ({ children }: { children: React.ReactNode }) => (
  <Tooltip content={children} positioning={{ placement: 'top' }} contentProps={{ fontSize: 'sm', maxW: 'xs' }}>
    <Box
      as='span'
      display='inline-flex'
      ml='1'
      cursor='[help]'
      color='fg.muted'
      tabIndex={0}
      // This sits inside a <label>: without cancelling the click, tapping the
      // icon to read the tooltip would activate the label's control (and flip
      // the switch below). The tooltip trigger ignores a prevented click.
      onClick={(event) => event.preventDefault()}
    >
      <Icon as={HelpIcon} />
    </Box>
  </Tooltip>
)

/**
 * Voter anonymity as an on/off setting, in the same shape as "Start immediately"
 * in the block above. Off is the ordinary vote and needs no explaining; on adds
 * the blind-signature layer, and that is the only state that gets a sentence.
 */
const VoterAnonymity = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<Process>()
  const { description } = useAnonymityLabels(true)

  return (
    <Box>
      <Controller
        control={control}
        name='anonymousVoting'
        render={({ field }) => (
          <>
            <Switch.Root
              // `name` lands on the hidden input, which is the structural handle
              // the e2e suite toggles this with — no test id needed.
              name={field.name}
              checked={field.value}
              onCheckedChange={({ checked }) => field.onChange(checked)}
            >
              <Switch.HiddenInput onBlur={field.onBlur} />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label display='flex' alignItems='center'>
                <Trans i18nKey='process_create.anonymity.title'>Anonymous voting</Trans>
                <LabelTooltip>
                  {t('process_create.anonymity.tooltip', {
                    defaultValue:
                      "Either way, your organization can't see how anyone voted. Voter anonymity adds a cryptographic layer that makes it impossible to link a vote to a person.",
                  })}
                </LabelTooltip>
              </Switch.Label>
            </Switch.Root>
            {field.value && (
              <Text textStyle='caption' color='fg.muted' mt='1'>
                {description}
              </Text>
            )}
          </>
        )}
      />
    </Box>
  )
}

/**
 * Whether voters see the results on the voting page, in both modes (stored on every question as
 * `metadata.voterResults`). Off by default; off, the voting page never offers them.
 */
const VoterResults = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<Process>()
  const votingMode = useWatch({ control, name: 'votingMode' })
  const resultVisibility = useWatch({ control, name: 'resultVisibility' })
  const helpId = useId()

  // Question by question with hidden results: no question's count shows until the vote ends, so the help says so.
  const help =
    votingMode !== 'byQuestion'
      ? t('process_create.voter_results.help_all', {
          defaultValue:
            'Voters can see the results on the voting page. Results hidden until the end appear when the vote ends.',
        })
      : resultVisibility === 'hidden'
        ? t('process_create.voter_results.help_by_question_hidden', {
            defaultValue: 'With the results hidden, voters see them all when the vote ends.',
          })
        : t('process_create.voter_results.help_by_question', {
            defaultValue: "Voters see each question's result when it closes, and every result when the vote ends.",
          })

  return (
    <Box>
      <Controller
        control={control}
        name='showVoterResults'
        render={({ field }) => (
          <>
            <Switch.Root
              name={field.name}
              checked={!!field.value}
              onCheckedChange={({ checked }) => field.onChange(checked)}
            >
              <Switch.HiddenInput onBlur={field.onBlur} aria-describedby={helpId} />
              {/* The stock control gap is 8px and the thumb is its only child: 0 keeps the stress theme clean */}
              <Switch.Control gap='0'>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>
                {t('process_create.voter_results.label', { defaultValue: 'Show the results to voters' })}
              </Switch.Label>
            </Switch.Root>
            <Text id={helpId} textStyle='caption' color='fg.muted' mt='1'>
              {help}
            </Text>
          </>
        )}
      />
    </Box>
  )
}

export const ExtraConfig = () => {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<Process>()
  const { required } = useValidations()
  const { DISABLE_ANONYMOUS_VOTING: disableAnonymousVoting } = useAppEnv()

  const resultVisibilityOptions: SelectOption[] = [
    { value: 'live', label: t('process_create.result_visibility.live', 'Live results') },
    { value: 'hidden', label: t('process_create.result_visibility.hidden', 'Hidden until the end') },
  ]

  const weightOptions: SelectOption<boolean>[] = [
    { value: false, label: t('process_create.weight.equal', 'One person, one vote') },
    { value: true, label: t('process_create.weight.weighted', 'Weighted by voting power') },
  ]

  return (
    <VStack align='stretch' gap='4'>
      {/* Result visibility */}
      <Box>
        <FormControl invalid={!!errors.resultVisibility}>
          <FormLabel htmlFor='resultVisibility'>
            <Trans i18nKey='process_create.result_visibility.title'>Result visibility</Trans>
          </FormLabel>
          <Controller
            control={control}
            name='resultVisibility'
            rules={{ required }}
            render={({ field }) => (
              <Select
                inputId='resultVisibility'
                value={resultVisibilityOptions.find((opt) => opt.value === field.value)}
                onChange={(opt) => field.onChange(opt.value)}
                options={resultVisibilityOptions}
                placeholder={t('process_create.result_visibility.live', 'Live results')}
              />
            )}
          />
          <FormErrorMessage>{errors.resultVisibility?.message?.toString()}</FormErrorMessage>
        </FormControl>
      </Box>
      <VoterResults />
      <Box>
        <FormControl invalid={!!errors.weightedVote}>
          <FormLabel htmlFor='weightedVote' display='flex' alignItems='center'>
            <Trans i18nKey='process_create.weight.title'>Voting power</Trans>
            <LabelTooltip>
              <Trans i18nKey='process_create.weight.tooltip'>
                Set whether votes are equal for each eligible voter or weighted according to the memberbase "Vote power"
                field.
              </Trans>
            </LabelTooltip>
          </FormLabel>
          <Controller
            control={control}
            name='weightedVote'
            render={({ field }) => (
              <Select
                inputId='weightedVote'
                value={weightOptions.find((opt) => opt.value === field.value)}
                onChange={(opt) => field.onChange(opt.value)}
                options={weightOptions}
                placeholder={t('process_create.weight.equal', 'One person, one vote')}
              />
            )}
          />
          <FormErrorMessage>{errors.weightedVote?.message?.toString()}</FormErrorMessage>
        </FormControl>
      </Box>
      {!disableAnonymousVoting && <VoterAnonymity />}
    </VStack>
  )
}
