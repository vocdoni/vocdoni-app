import {
  AlertRoot as Alert,
  AlertDescription,
  Box,
  FieldErrorText,
  FieldLabel,
  FieldRoot,
  HStack,
  Input,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { chakraComponents } from 'chakra-react-select'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuUsers } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Select } from '~components/Form/Select'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Routes } from '~routes'
import { Group, useGroups } from '~src/queries/groups'
import { VoterAuthentication } from '../VoterAuthentication'
import { Process } from '../common'

type GroupsQuery = ReturnType<typeof useGroups>

type GroupOptionLabelContext = {
  context: 'menu' | 'value'
}

export const formatGroupOptionLabel = (group: Group, { context }: GroupOptionLabelContext) => {
  if (context === 'value') return group.title

  return (
    <HStack gap={4} align='center' justifyContent='space-between' w='full'>
      <Text as='span'>{group.title}</Text>
      <HStack gap={1.5} color='texts.subtle' fontSize='sm' flexShrink={0}>
        <LuUsers />
        <Text as='span'>{group.membersCount || 0}</Text>
      </HStack>
    </HStack>
  )
}

export type GroupSelectProps = {
  groups: Group[]
} & Pick<GroupsQuery, 'fetchNextPage' | 'hasNextPage' | 'isFetching'>

export const GroupSelect = ({ groups, fetchNextPage, hasNextPage, isFetching }: GroupSelectProps) => {
  const { t } = useTranslation()
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext()
  const censusType = watch('censusType')
  const [hasFetchedScroll, setHasFetchedScroll] = useState(false)

  const CustomMenuList = (props) => {
    return (
      <chakraComponents.MenuList {...props}>
        {props.children}
        {hasNextPage && (
          <Box py={2} textAlign='center'>
            {isFetching ? <Spinner size='sm' /> : t('process_create.groups.scroll_to_load', 'Scroll to load more...')}
          </Box>
        )}
      </chakraComponents.MenuList>
    )
  }

  // Reset hasFetchedScroll when fetching starts
  useEffect(() => {
    if (!isFetching) setHasFetchedScroll(false)
  }, [isFetching])

  return (
    <FieldRoot invalid={!!errors.groupId}>
      <FieldLabel>
        <Trans i18nKey='process_create.census.memberbase.label'>Select a group of members to create the census</Trans>
      </FieldLabel>
      <Controller
        control={control}
        name='groupId'
        rules={{
          required: {
            value: censusType === CensusTypes.CSP,
            message: t('form.error.required', 'This field is required'),
          },
        }}
        render={({ field }) => {
          const selected = groups?.find((g) => g.id === field.value) ?? null
          return (
            <Select
              // Stable handle for the group combobox (labelled by the
              // FieldLabel above, which Chakra wires up by id).
              inputId='groupId'
              options={groups ?? []}
              value={selected}
              getOptionLabel={(option) =>
                option.isAutoGroup ? t('groups_board.auto_group.title', { defaultValue: 'All Members' }) : option.title
              }
              getOptionValue={(option) => option.id}
              placeholder={t('process_create.group.select', 'Select group')}
              isLoading={isFetching}
              onChange={(option) => field.onChange(option?.id ?? '')}
              formatOptionLabel={(option, meta) => formatGroupOptionLabel(option, meta)}
              onMenuScrollToBottom={async () => {
                if (hasNextPage && !hasFetchedScroll) {
                  setHasFetchedScroll(true)
                  await fetchNextPage()
                }
              }}
              closeMenuOnSelect
              maxMenuHeight={200}
              components={{ MenuList: CustomMenuList }}
            />
          )
        }}
      />
      <FieldErrorText>{errors.groupId?.message?.toString()}</FieldErrorText>
    </FieldRoot>
  )
}

const GroupCensusCreation = () => {
  const { t } = useTranslation()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<Process>()
  const censusType = watch('censusType')
  const { data: groups, fetchNextPage, hasNextPage, isFetching } = useGroups(6)

  const TLink = ({ children }) => (
    <Link asChild textDecoration='underline'>
      <ReactRouterLink to={Routes.dashboard.memberbase.base}>{children}</ReactRouterLink>
    </Link>
  )

  return (
    <Box display='flex' flexDirection='column' gap={4}>
      {groups?.length > 0 && (
        <>
          <GroupSelect
            groups={groups}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
          />
          <VoterAuthentication />
        </>
      )}

      {(!groups || groups?.length === 0) && (
        <Alert status='warning' fontSize='xs' color='texts.subtle'>
          <AlertDescription>
            <Trans i18nKey='process_create.census.group.no_groups'>
              To start a vote, you first need to create a group of eligible voters from your memberbase.
              <TLink>Create one here</TLink>.
            </Trans>
          </AlertDescription>
        </Alert>
      )}

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

const CensusCreation = () => {
  const { setValue, watch } = useFormContext()
  const censusType = watch('censusType')

  // Set default census type to Memberbase (Group) if not set
  useEffect(() => {
    if (!censusType) {
      setValue('censusType', CensusTypes.CSP)
    }
  }, [censusType, setValue])

  return <GroupCensusCreation />
}

export default CensusCreation
