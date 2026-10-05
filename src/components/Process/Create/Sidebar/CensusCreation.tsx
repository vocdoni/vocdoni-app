import { Box, FieldErrorText, FieldRoot, Input } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { useAppEnv } from '~src/app-env'
import { useAllGroups } from '~src/queries/groups'
import { WhoCanVote } from '../Settings/WhoCanVote'
import { VoterAuthentication } from '../VoterAuthentication'
import { Process } from '../common'

/**
 * Who can vote: where the voters come from (Everyone to start with, see `WhoCanVote`, which gives
 * the vote a census of its own when it isn't Everyone) and how they sign in.
 */
const CensusCreation = () => {
  const { t } = useTranslation()
  const {
    register,
    resetField,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<Process>()
  const [censusType, groupId] = useWatch({ control, name: ['censusType', 'groupId'] })
  const { data: groups } = useAllGroups()
  // While a new census is being chosen, the sign-in summary would describe the one being replaced
  const [startingOver, setStartingOver] = useState(false)
  // AppEnv `CENSUS_STEP_CLASSIC` brings back the cards and the full sign-in card
  const compact = !useAppEnv().CENSUS_STEP_CLASSIC

  // Set default census type to Memberbase (Group) if not set
  useEffect(() => {
    if (!censusType) setValue('censusType', CensusTypes.CSP)
  }, [censusType, setValue])

  // Most votes are for every member: start there, without it counting as a change to save
  const autoGroup = groups?.find((group) => group.isAutoGroup)
  useEffect(() => {
    if (!groupId && autoGroup) resetField('groupId', { defaultValue: autoGroup.id })
  }, [groupId, autoGroup, resetField])

  return (
    <Box display='flex' flexDirection='column' gap={4}>
      {/* Registered so the form knows the field (and resetting it to Everyone above takes) */}
      <input
        type='hidden'
        {...register('groupId', {
          required: {
            value: censusType === CensusTypes.CSP,
            message: t('form.error.required', 'This field is required'),
          },
        })}
      />
      <WhoCanVote onStartingOverChange={setStartingOver} compact={compact} />
      {!startingOver && <VoterAuthentication compact={compact} />}

      <FieldRoot invalid={!!errors.census}>
        <Input
          type='hidden'
          {...register('census', {
            required: {
              value: censusType === CensusTypes.CSP,
              message: t('form.error.census_config_required', 'Please configure the census authentication settings.'),
            },
          })}
        />
        <FieldErrorText>{errors.census?.message?.toString()}</FieldErrorText>
      </FieldRoot>
    </Box>
  )
}

export default CensusCreation
