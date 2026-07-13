import {
  AlertRoot as Alert,
  AlertDescription,
  Box,
  HStack,
  Input,
  Link,
  Spinner,
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from '@chakra-ui/react'
import { chakraComponents } from 'chakra-react-select'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuUsers } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Select } from '~components/Form/Select'
import { Field } from '~components/ui/Field'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { CensusCsvManager } from '~components/Process/Census/Spreadsheet'
import { CensusWeb3Addresses } from '~components/Process/Census/Web3'
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
    <Field
      invalid={!!errors.groupId}
      label={
        <Trans i18nKey='process_create.census.memberbase.label'>Select a group of members to create the census</Trans>
      }
      errorText={errors.groupId?.message?.toString()}
    >
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
    </Field>
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

      <Field invalid={!!errors.census} errorText={errors.census?.message?.toString()}>
        <Input
          type='hidden'
          {...register('census', {
            required: {
              value: censusType === CensusTypes.CSP,
              message: t('form.error.census_config_required', 'Please configure the census authentication settings.'),
            },
          })}
        />
      </Field>
    </Box>
  )
}

const CensusCreation = ({ showExtraMethods }: { showExtraMethods: boolean }) => {
  const { t } = useTranslation()
  const { setValue, watch } = useFormContext()
  const censusType = watch('censusType')

  const currentValue = censusType || CensusTypes.CSP

  // Set default census type to Memberbase (Group) if not set
  useEffect(() => {
    if (!censusType) {
      setValue('censusType', CensusTypes.CSP)
    }
  }, [censusType, setValue])

  const handleTabChange = (nextType: CensusTypes) => {
    const prevType = watch('censusType')

    if (nextType === prevType) return

    switch (prevType) {
      case CensusTypes.CSP:
        setValue('groupId', '')
        break
      case CensusTypes.Web3:
        setValue('addresses', [])
        break
      case CensusTypes.Spreadsheet:
        setValue('spreadsheet', undefined)
        break
    }

    setValue('censusType', nextType)
  }

  // If extra methods are not enabled, show only the Group selection
  if (!showExtraMethods) {
    return <GroupCensusCreation />
  }

  // If extra methods are enabled, show the full tab system
  return (
    <TabsRoot value={currentValue} onValueChange={({ value }) => handleTabChange(value as CensusTypes)} fitted>
      <TabsList w='full'>
        <TabsTrigger value={CensusTypes.CSP}>
          {t('process_create.census.group.label', { defaultValue: 'Group' })}
        </TabsTrigger>
        <TabsTrigger value={CensusTypes.Spreadsheet}>
          {t('process_create.census.spreadsheet.label', { defaultValue: 'Spreadsheet' })}
        </TabsTrigger>
        <TabsTrigger value={CensusTypes.Web3}>
          {t('process_create.census.web3.label', { defaultValue: 'Web3' })}
        </TabsTrigger>
      </TabsList>
      <TabsContentGroup>
        <TabsContent value={CensusTypes.CSP} px={0}>
          <GroupCensusCreation />
        </TabsContent>
        <TabsContent value={CensusTypes.Spreadsheet} px={0} display='flex' flexDirection='column' gap={4}>
          <CensusCsvManager />
        </TabsContent>
        <TabsContent value={CensusTypes.Web3} px={0} display='flex' flexDirection='column' gap={4}>
          <CensusWeb3Addresses />
        </TabsContent>
      </TabsContentGroup>
    </TabsRoot>
  )
}

export default CensusCreation
