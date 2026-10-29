import {
  AlertRoot as Alert,
  AlertDescription,
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
import { ControllerRenderProps, useController, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { CheckIcon, UsersIcon } from '~theme/icons'
import { Link as ReactRouterLink } from 'react-router'
import { Select } from '~components/Form/Select'
import { useToast } from '~components/Toast'
import { StatusBadge } from '~components/ui/StatusBadge'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Routes } from '~routes'
import { Group, useGroup, useGroups } from '~src/queries/groups'
import { statusPalette } from '~theme/status'
import { VoterAuthentication } from '../VoterAuthentication'
import { Process } from '../common'
import { StepStatus, useCensusSteps } from '../useCensusSteps'

type GroupsQuery = ReturnType<typeof useGroups>

const stepMarkerStyles: Record<StepStatus, FlexProps> = {
  idle: { borderColor: 'border.emphasized', color: 'fg.muted' },
  current: { colorPalette: statusPalette.warning, borderColor: 'colorPalette.solid', color: 'colorPalette.fg' },
  error: { colorPalette: statusPalette.error, borderColor: 'colorPalette.solid', color: 'colorPalette.fg' },
  done: {
    colorPalette: statusPalette.success,
    borderColor: 'colorPalette.solid',
    bg: 'colorPalette.solid',
    color: 'colorPalette.contrast',
  },
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
    {status === 'done' ? <CheckIcon /> : step}
  </Flex>
)

// Headline status of the census for the sidebar section title: how many of its
// two steps are still missing, or ready once both are done.
export const CensusStatusBadge = () => {
  const { t } = useTranslation()
  const { stepsLeft } = useCensusSteps()

  if (!stepsLeft) {
    return (
      <StatusBadge tone='success'>{t('process_create.census.status.ready', { defaultValue: 'Ready' })}</StatusBadge>
    )
  }

  return (
    <StatusBadge tone='warning'>
      {t('process_create.census.status.steps_left', {
        defaultValue_one: '{{ count }} step left',
        defaultValue_other: '{{ count }} steps left',
        count: stepsLeft,
      })}
    </StatusBadge>
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
      <HStack gap={1.5} color='fg.muted' fontSize='sm' flexShrink={0}>
        <UsersIcon />
        <Text as='span'>{group.membersCount || 0}</Text>
      </HStack>
    </HStack>
  )
}

export type GroupSelectProps = {
  groups: Group[]
  // Owned by GroupCensusCreation, which registers the field's rules (see there).
  field: ControllerRenderProps<Process, 'groupId'>
} & Pick<GroupsQuery, 'fetchNextPage' | 'hasNextPage' | 'isFetching'>

export const GroupSelect = ({ groups, field, fetchNextPage, hasNextPage, isFetching }: GroupSelectProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<Process>()
  const { groupStatus } = useCensusSteps()
  const [hasFetchedScroll, setHasFetchedScroll] = useState(false)
  const selected = groups?.find((g) => g.id === field.value) ?? null

  // Voter authentication is validated against the group it was set up for, so a
  // different group voids it. Only a user pick lands here: a draft restores both
  // fields with setValue and keeps its census. The dialog keeps the previous
  // choices ticked, so confirming them again for the new group is quick.
  const changeGroup = (nextGroupId: string) => {
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
    field.onChange(nextGroupId)
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
        <StepMarker step={1} status={groupStatus} />
        <Trans i18nKey='process_create.census.memberbase.label'>Select a group of members to create the census</Trans>
      </FieldLabel>
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
        onChange={(option) => changeGroup(option?.id ?? '')}
        onBlur={field.onBlur}
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
      <FieldErrorText>{errors.groupId?.message?.toString()}</FieldErrorText>
    </FieldRoot>
  )
}

const GroupCensusCreation = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<Process>()
  const { required, authStatus } = useCensusSteps()
  const { data: groups, fetchNextPage, hasNextPage, isFetching } = useGroups(6)

  // Both census fields are registered here, not in the controls that edit them:
  // those only render once the organization has groups, and publishing must stay
  // blocked while the groups are loading, failed to load, or there are none.
  const { field: groupField } = useController({
    control,
    name: 'groupId',
    rules: { required: { value: required, message: t('form.error.required', 'This field is required') } },
  })
  const listedGroup = groups?.find((group) => group.id === groupField.value)
  // A draft's group may sit on a page the list hasn't loaded: fetch just that one.
  const { data: unlistedGroup } = useGroup(groupField.value, !!groups && !listedGroup)
  const selectedGroup = listedGroup ?? unlistedGroup ?? null
  // No message: the pending notice in VoterAuthentication says what's missing.
  const {
    field: { ref: censusRef },
  } = useController({ control, name: 'census', rules: { required } })

  const TLink = ({ children }) => (
    <Link asChild>
      <ReactRouterLink to={Routes.dashboard.memberbase.base}>{children}</ReactRouterLink>
    </Link>
  )

  return (
    <Box display='flex' flexDirection='column' gap={4}>
      {groups?.length > 0 && (
        <>
          <GroupSelect
            groups={groups}
            field={groupField}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
          />
          <Flex direction='column' gap={1.5}>
            {/* Styled after the group field's label above, so both steps read alike. */}
            <HStack gap={2} align='flex-start' textStyle='sm' fontWeight='medium'>
              <StepMarker step={2} status={authStatus} />
              {t('process_create.census.voter_auth.label', { defaultValue: 'Set how voters prove who they are' })}
            </HStack>
            <VoterAuthentication triggerRef={censusRef} group={selectedGroup} />
          </Flex>
        </>
      )}

      {(!groups || groups?.length === 0) && (
        <Alert status='warning' fontSize='xs' color='fg.muted'>
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
