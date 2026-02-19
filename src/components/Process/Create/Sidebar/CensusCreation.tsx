import {
  AlertRoot as Alert,
  AlertDescription,
  Box,
  FieldErrorText,
  FieldLabel,
  FieldRoot,
  Input,
  Link,
  Spinner,
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@chakra-ui/react'
import { chakraComponents } from 'chakra-react-select'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Select } from '~components/Form/Select'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { CensusCsvManager } from '~components/Process/Census/Spreadsheet'
import { CensusWeb3Addresses } from '~components/Process/Census/Web3'
import { Routes } from '~routes'
import { Group, useGroups } from '~src/queries/groups'
import { VoterAuthentication } from '../VoterAuthentication'
import { Process } from '../common'

type GroupsQuery = ReturnType<typeof useGroups>

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
              options={groups ?? []}
              value={selected}
              getOptionLabel={(option) => option.title}
              getOptionValue={(option) => option.id}
              placeholder={t('process_create.group.select', 'Select group')}
              isLoading={isFetching}
              onChange={(option) => field.onChange(option?.id ?? '')}
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
