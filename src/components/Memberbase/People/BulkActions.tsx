import { Box, Button, Flex, Icon, Stack, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { computeProcessStatus } from '@vocdoni/api-client'
import type { QuestionStatus } from '@vocdoni/api-types'
import { getElectionTitle } from '@vocdoni/react-components'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuUsers } from 'react-icons/lu'
import { useNavigate } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import InputBasic from '~components/Form/InputBasic'
import { Select } from '~components/Form/Select'
import { useToast } from '~components/Toast'
import { Sheet } from '~components/ui/Sheet'
import { Routes } from '~routes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAddCensusParticipants } from '~src/queries/census'
import { useAllGroups, useCreateGroup, useUpdateGroup } from '~src/queries/groups'
import { paginatedElectionsQuery } from '~src/queries/organization'
import { memberDisplayName } from './display'
import type { SelectedMember } from './useSelection'

type BulkSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Who the action applies to: the selection, or the one row whose menu opened it */
  members: SelectedMember[]
  /** After the action went through (the selection clears only when it was the target) */
  onDone?: () => void
}

/** Up to five names, then "+N more". */
const MemberChips = ({ members }: { members: SelectedMember[] }) => {
  const { t } = useTranslation()
  const visible = members.slice(0, 5)
  const remaining = members.length - visible.length

  return (
    // ph-no-capture: member names
    <Wrap className='ph-no-capture'>
      {visible.map((member) => (
        <WrapItem key={member.id}>
          <Tag.Root borderRadius='sm' size='sm' variant='subtle' colorPalette='gray'>
            <Tag.Label>{memberDisplayName(member)}</Tag.Label>
          </Tag.Root>
        </WrapItem>
      ))}
      {remaining > 0 && (
        <WrapItem>
          <Tag.Root borderRadius='sm' size='sm' variant='outline'>
            <Tag.Label>
              {t('members.table.remaining_members', { defaultValue: '+{{count}} more', count: remaining })}
            </Tag.Label>
          </Tag.Root>
        </WrapItem>
      )}
    </Wrap>
  )
}

export const CreateGroupSheet = ({ open, onOpenChange, members, onDone }: BulkSheetProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const createGroup = useCreateGroup()
  const methods = useForm({ defaultValues: { title: '', description: '' } })

  useEffect(() => {
    if (!open) methods.reset()
  }, [open, methods])

  const onSubmit = (data: { title: string; description: string }) => {
    createGroup.mutate(
      { ...data, memberIDs: members.map((member) => member.id) },
      {
        onSuccess: () => {
          toast({
            title: t('members.people.toast.group_created', {
              defaultValue: 'Group “{{title}}” created',
              title: data.title,
            }),
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
          onOpenChange(false)
          onDone?.()
          navigate(Routes.dashboard.memberbase.groups)
        },
        onError: (error: Error) => {
          toast({
            title: t('members.table.create_group_error', { defaultValue: 'Error creating group' }),
            description: error.message,
            type: 'error',
            duration: 3000,
            isClosable: true,
          })
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      size='sm'
      title={t('members.table.create_group_form_title', { defaultValue: 'Create New Group' })}
      footer={
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('members.table.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type='submit' form='create-group-form' loading={createGroup.isPending} disabled={!members.length}>
            {t('members.table.create_group', { defaultValue: 'Create group' })}
          </Button>
        </Flex>
      }
    >
      <FormProvider {...methods}>
        <Stack as='form' id='create-group-form' gap={4} onSubmit={methods.handleSubmit(onSubmit)}>
          <Text fontSize='sm' color='fg.muted'>
            {t('members.table.create_group_form_description', {
              defaultValue:
                'Create a new group from selected members. This will organize them for future voting processes.',
            })}
          </Text>
          <InputBasic
            formValue='title'
            label={t('members.table.group_name', { defaultValue: 'Group name' })}
            required
          />
          <InputBasic
            formValue='description'
            label={t('members.table.group_description', { defaultValue: 'Description (Optional)' })}
            placeholder={t('members.table.group_description_placeholder', {
              defaultValue: 'Enter a brief description of the group',
            })}
          />
          <Box>
            <Text fontSize='sm' mb={2}>
              {t('members.table.group_members_count', {
                defaultValue: '{{count}} members selected',
                count: members.length,
              })}
            </Text>
            <MemberChips members={members} />
          </Box>
        </Stack>
      </FormProvider>
    </Sheet>
  )
}

export const AddToGroupSheet = ({ open, onOpenChange, members, onDone }: BulkSheetProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  // Every saved census, not just the first page; "Everyone" can't be added to
  const { data: allGroups, isLoading } = useAllGroups({ enabled: open })
  const groups = (allGroups ?? []).filter((group) => !group.isAutoGroup)
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; title: string } | null>(null)
  const updateGroup = useUpdateGroup()

  const close = () => {
    setSelectedGroup(null)
    onOpenChange(false)
  }

  const submit = () => {
    if (!selectedGroup) return
    updateGroup.mutate(
      { groupId: selectedGroup.id, body: { addMembers: members.map((member) => member.id) } },
      {
        onSuccess: () => {
          toast({
            title: t('members.people.toast.added_to_group', {
              defaultValue: 'Added to “{{group}}”',
              group: selectedGroup.title,
            }),
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
          close()
          onDone?.()
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      size='sm'
      title={t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
    >
      <Stack gap={4}>
        <Text fontSize='sm' color='fg.muted'>
          {t('members.table.add_to_group_description', { defaultValue: 'Select a group to add the members to.' })}
        </Text>
        <Select
          placeholder={t('members.table.select_group', { defaultValue: 'Select group' })}
          options={groups}
          isLoading={isLoading}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          formatOptionLabel={(option) => (
            <Flex align='center' gap={2}>
              {option.title}
              <Flex align='center' gap={1} fontSize='sm' color='fg.muted'>
                <Icon as={LuUsers} />
                {option.membersCount}
              </Flex>
            </Flex>
          )}
          value={selectedGroup}
          onChange={(option) => setSelectedGroup(option)}
        />
        {selectedGroup && (
          <Text fontSize='sm' color='fg.muted'>
            {t('members.table.add_to_group_confirmation', {
              defaultValue: 'You will add {{count}} members to the "{{group}}" group.',
              count: members.length,
              group: selectedGroup.title,
            })}
          </Text>
        )}
        <Button onClick={submit} loading={updateGroup.isPending} disabled={!selectedGroup || !members.length}>
          {t('members.table.add_to_group_button', { defaultValue: 'Add {{count}} member', count: members.length })}
        </Button>
      </Stack>
    </Sheet>
  )
}

const ACTIVE_PROCESS_STATUSES: QuestionStatus[] = ['ONGOING', 'UPCOMING', 'PAUSED']

export const AddToCensusSheet = ({ open, onOpenChange, members, onDone }: BulkSheetProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { client } = useApiClient()
  const { currentAddress } = useAuth()
  const [selectedProcess, setSelectedProcess] = useState<{ id: string; title: string } | null>(null)
  const addCensusParticipants = useAddCensusParticipants()

  const electionsQuery = paginatedElectionsQuery(currentAddress, client, { limit: 100 })
  const { data: elections, isLoading } = useQuery({ ...electionsQuery, enabled: electionsQuery.enabled && open })

  const processes = (elections?.processes ?? [])
    .filter((election) => ACTIVE_PROCESS_STATUSES.includes(computeProcessStatus(election.questions)))
    .map((election) => ({ id: election.id, title: getElectionTitle(election) || election.id }))

  const close = () => {
    setSelectedProcess(null)
    onOpenChange(false)
  }

  const submit = () => {
    if (!selectedProcess) return
    addCensusParticipants.mutate(
      { processId: selectedProcess.id, memberIds: members.map((member) => member.id) },
      {
        onSuccess: (response) => {
          toast({
            title: t('members.table.add_to_census_success', {
              defaultValue: '{{count}} member added to the census',
              defaultValue_other: '{{count}} members added to the census',
              count: response.added,
            }),
            description: response.errors?.length
              ? t('members.table.add_to_census_partial', { defaultValue: 'Some members could not be added.' })
              : undefined,
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
          close()
          onDone?.()
        },
        onError: (error: Error) => {
          toast({
            title: t('members.table.add_to_census_error', { defaultValue: 'Error adding members to the census' }),
            description: error.message,
            type: 'error',
            duration: 3000,
            isClosable: true,
          })
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      size='sm'
      title={t('members.table.add_to_census', { defaultValue: 'Add to census' })}
    >
      <Stack gap={4}>
        <Text fontSize='sm' color='fg.muted'>
          {t('members.table.add_to_census_description', {
            defaultValue: 'Select an active voting process to add the members to its census.',
          })}
        </Text>
        <Select
          placeholder={t('members.table.select_process', { defaultValue: 'Select process' })}
          options={processes}
          isLoading={isLoading}
          noOptionsMessage={() => t('members.table.no_active_processes', { defaultValue: 'No active processes found' })}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          value={selectedProcess}
          onChange={(option) => setSelectedProcess(option)}
        />
        {selectedProcess && (
          <Text fontSize='sm' color='fg.muted'>
            {t('members.table.add_to_census_confirmation', {
              defaultValue: 'You will add {{count}} member to the "{{process}}" process census.',
              defaultValue_other: 'You will add {{count}} members to the "{{process}}" process census.',
              count: members.length,
              process: selectedProcess.title,
            })}
          </Text>
        )}
        <Button
          onClick={submit}
          loading={addCensusParticipants.isPending}
          disabled={!selectedProcess || !members.length}
        >
          {t('members.table.add_to_census_button', { defaultValue: 'Add {{count}} member', count: members.length })}
        </Button>
      </Stack>
    </Sheet>
  )
}
