import {
  AlertRoot as Alert,
  AlertDescription,
  Box,
  Button,
  FieldErrorText,
  FieldRoot,
  Input,
  Link,
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink } from 'react-router-dom'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { CensusCsvManager } from '~components/Process/Census/Spreadsheet'
import { CensusWeb3Addresses } from '~components/Process/Census/Web3'
import { Routes } from '~routes'
import { useGroups } from '~src/queries/groups'
import { GroupPickerCard } from '../GroupPicker'
import { AuthPassportCard } from '../VoterAuthentication/AuthPassportCard'
import { Process } from '../common'
import { VoterAuthentication } from '../VoterAuthentication'

const GroupCensusCreation = () => {
  const { t } = useTranslation()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<Process>()
  const censusType = watch('censusType')
  const groupId = watch('groupId')
  const census = watch('census')
  const { data: groups, fetchNextPage, hasNextPage, isFetching } = useGroups(6)
  const { open: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure()

  const selectedGroup = groups?.find((g) => g.id === groupId)

  const TLink = ({ children }) => (
    <Link asChild textDecoration='underline'>
      <ReactRouterLink to={Routes.dashboard.memberbase.base}>{children}</ReactRouterLink>
    </Link>
  )

  return (
    <Box display='flex' flexDirection='column' gap={4}>
      {groups?.length > 0 && (
        <>
          <GroupPickerCard
            groups={groups}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
          />

          {census ? (
            <AuthPassportCard
              census={census}
              groupName={
                selectedGroup?.isAutoGroup
                  ? t('groups_board.auto_group.title', { defaultValue: 'All Members' })
                  : selectedGroup?.title
              }
              groupMembersCount={selectedGroup?.membersCount}
              onEdit={onAuthOpen}
            />
          ) : (
            groupId && (
              <Button w='full' onClick={onAuthOpen}>
                {t('voter_auth.button.set_up', { defaultValue: 'Set up voter access' })}
              </Button>
            )
          )}

          <VoterAuthentication isOpen={isAuthOpen} onClose={onAuthClose} />
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
