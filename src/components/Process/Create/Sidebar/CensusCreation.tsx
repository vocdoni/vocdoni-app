import {
  AlertRoot as Alert,
  AlertDescription,
  Badge,
  Box,
  FieldErrorText,
  FieldLabel,
  FieldRoot,
  Flex,
  FlexProps,
  HStack,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { chakraComponents } from 'chakra-react-select'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuCheck, LuUsers } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router'
import { Select } from '~components/Form/Select'
import { useToast } from '~components/Toast'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Routes } from '~routes'
import { Group, useGroups } from '~src/queries/groups'
import { VoterAuthentication } from '../VoterAuthentication'
import { Process } from '../common'

type GroupsQuery = ReturnType<typeof useGroups>

type StepStatus = 'idle' | 'current' | 'error' | 'done'

const stepMarkerStyles: Record<StepStatus, FlexProps> = {
  idle: { borderColor: 'border.emphasized', color: 'fg.muted' },
  current: { borderColor: 'orange.solid', color: 'orange.fg' },
  error: { borderColor: 'red.solid', color: 'red.fg' },
  done: { borderColor: 'green.solid', bg: 'green.solid', color: 'green.contrast' },
}

// Numbers the census' two parts (group, then voter authentication) so picking a
// group doesn't read as the whole job. Decorative: the section badge and the
// pending notice carry the same status in words.
const StepMarker = ({ step, status }: { step: number; status: StepStatus }) => (
  <Flex
    as='span'
    aria-hidden
    boxSize={4.5}
    mt='1px'
    flexShrink={0}
    align='center'
    justify='center'
    borderRadius='full'
    borderWidth='1.5px'
    fontSize='2xs'
    fontWeight='bold'
    {...stepMarkerStyles[status]}
  >
    {status === 'done' ? <LuCheck /> : step}
  </Flex>
)

// Headline status of the census for the sidebar section title: how many of its
// two steps are still missing, or ready once both are done.
export const CensusStatusBadge = () => {
  const { t } = useTranslation()
  const { watch } = useFormContext<Process>()
  const groupId = watch('groupId')
  const census = watch('census')
  const stepsLeft = (groupId ? 0 : 1) + (census ? 0 : 1)

  if (!stepsLeft) {
    return <Badge colorPalette='green'>{t('process_create.census.status.ready', { defaultValue: 'Ready' })}</Badge>
  }

  return (
    <Badge colorPalette='orange'>
      {t('process_create.census.status.steps_left', {
        defaultValue_one: '{{ count }} step left',
        defaultValue_other: '{{ count }} steps left',
        count: stepsLeft,
      })}
    </Badge>
  )
}

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
  const toast = useToast()
  const {
    watch,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext()
  const censusType = watch('censusType')
  const groupId = watch('groupId')
  const [hasFetchedScroll, setHasFetchedScroll] = useState(false)

  // Voter authentication is validated against the group it was set up for, so a
  // different group voids it. Only a user pick lands here: a draft restores both
  // fields with setValue and keeps its census. The dialog keeps the previous
  // choices ticked, so confirming them again for the new group is quick.
  const changeGroup = (nextGroupId: string, onChange: (value: string) => void) => {
    if (nextGroupId !== getValues('groupId') && getValues('census')) {
      setValue('census', null, { shouldDirty: true })
      toast({
        title: t('process_create.census.auth_reset.title', { defaultValue: 'Voter authentication was reset' }),
        description: t('process_create.census.auth_reset.description', {
          defaultValue: 'It was checked against the previous group. Your choices are kept: confirm them for this one.',
        }),
        type: 'info',
        duration: 6000,
        closable: true,
      })
    }
    onChange(nextGroupId)
  }

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
      <FieldLabel gap={2} alignItems='flex-start'>
        <StepMarker step={1} status={groupId ? 'done' : errors.groupId ? 'error' : 'idle'} />
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
              // Lets a blocked publish focus the combobox when no group is picked.
              ref={field.ref}
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
              onChange={(option) => changeGroup(option?.id ?? '', field.onChange)}
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
    watch,
    formState: { errors },
  } = useFormContext<Process>()
  const groupId = watch('groupId')
  const census = watch('census')
  const { data: groups, fetchNextPage, hasNextPage, isFetching } = useGroups(6)
  const voterAuthStatus: StepStatus = census ? 'done' : !groupId ? 'idle' : errors.census ? 'error' : 'current'

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
          <Flex direction='column' gap={1.5}>
            {/* Styled after the group field's label above, so both steps read alike. */}
            <HStack gap={2} align='flex-start' textStyle='sm' fontWeight='medium'>
              <StepMarker step={2} status={voterAuthStatus} />
              {t('process_create.census.voter_auth.label', { defaultValue: 'Set how voters prove who they are' })}
            </HStack>
            <VoterAuthentication />
          </Flex>
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
