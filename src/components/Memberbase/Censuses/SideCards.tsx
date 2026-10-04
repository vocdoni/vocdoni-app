import {
  Box,
  Button,
  Field,
  Flex,
  Icon,
  IconButton,
  Input,
  Menu,
  Portal,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuDownload, LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu'
import { useNavigate } from 'react-router'
import { useMemberFields, type MemberFieldId } from '~components/Memberbase/fields'
import { useToast } from '~components/Toast'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { Sheet } from '~components/ui/Sheet'
import { Tooltip } from '~components/ui/Tooltip'
import { Routes } from '~routes'
import type { AffectedVote } from '~src/queries/affectedVotes'
import { type Group, useDeleteGroup, useGroupMembersFetcher, useUpdateGroup } from '~src/queries/groups'
import { collectMembers, isAbortError } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { csvBlob, downloadBlob } from '~utils/download'
import { censusCsvRows, censusFileName } from './exportCsv'
import { publishedUsers } from './model'
import { UsedByWarning } from './UsedBy'

/**
 * Downloads every person of a census' group as a semicolon CSV, loaded page by page in the browser.
 * Names, member numbers and emails; national IDs masked; never phones.
 */
export const useCensusDownload = (groupId: string, name: string, kind: string) => {
  const { t } = useTranslation()
  const toast = useToast()
  const fields = useMemberFields()
  const fetchPage = useGroupMembersFetcher(groupId)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  const download = async () => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setProgress({ done: 0, total: 0 })
    try {
      const { members } = await collectMembers(fetchPage, {
        signal: current.signal,
        onProgress: ({ collected, total }) => setProgress({ done: collected, total }),
      })
      const headers = Object.fromEntries(fields.map((field) => [field.id, field.label])) as Record<
        MemberFieldId,
        string
      >
      downloadBlob(csvBlob(censusCsvRows(members, headers)), censusFileName(name))
      trackAnalyticsEvent({ name: AnalyticsEvents.CensusExported, props: { kind, count: members.length } })
    } catch (error) {
      if (isAbortError(error)) return
      toast({
        title: t('census_detail.export.error', { defaultValue: "The census couldn't be downloaded" }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      if (controller.current === current) controller.current = null
      setProgress(null)
    }
  }

  return { download, progress }
}

/** "Download CSV", for the table's toolbar. Says what leaves out on hover, and how far along it is. */
export const CensusDownloadButton = ({ groupId, name, kind }: { groupId: string; name: string; kind: string }) => {
  const { t, i18n } = useTranslation()
  const { download, progress } = useCensusDownload(groupId, name, kind)
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  return (
    <Tooltip
      content={t('census_detail.export.hint', {
        defaultValue: 'Names, member numbers and emails, dated today. National IDs are masked and phones left out.',
      })}
    >
      <Button
        size='sm'
        variant='outline'
        colorPalette='gray'
        onClick={download}
        loading={!!progress}
        loadingText={
          progress?.total
            ? t('census_detail.export.progress', {
                defaultValue: 'Preparing {{done}} of {{total}}…',
                done: format(progress.done),
                total: format(progress.total),
              })
            : undefined
        }
      >
        <Icon as={LuDownload} />
        {t('census_detail.export.csv', { defaultValue: 'Download CSV' })}
      </Button>
    </Tooltip>
  )
}

type EditForm = { title: string; description: string }

/** Rename a saved census or change its description. */
const EditSavedSheet = ({
  open,
  onOpenChange,
  group,
  usedBy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  usedBy: AffectedVote[]
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const updateGroup = useUpdateGroup()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditForm>({ defaultValues: { title: group.title, description: group.description ?? '' } })

  useEffect(() => {
    if (open) reset({ title: group.title, description: group.description ?? '' })
  }, [open, group.title, group.description, reset])

  const onSubmit = handleSubmit(async ({ title, description }) => {
    try {
      await updateGroup.mutateAsync({
        groupId: group.id,
        body: { title: title.trim(), description: description.trim() },
      })
      toast({
        title: t('census_detail.edit.saved', { defaultValue: 'Census updated' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('census_detail.edit.error', { defaultValue: "Your changes weren't saved" }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  })

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      size='sm'
      title={t('census_detail.edit.title', { defaultValue: 'Rename census' })}
      footer={
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('members.bulk.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type='submit' form='edit-census-form' loading={updateGroup.isPending}>
            {t('census_detail.edit.submit', { defaultValue: 'Save' })}
          </Button>
        </Flex>
      }
    >
      <Stack as='form' id='edit-census-form' gap={4} onSubmit={onSubmit}>
        <Field.Root invalid={!!errors.title} required>
          <Field.Label>{t('members.save_census.name', { defaultValue: 'Name' })}</Field.Label>
          <Input
            {...register('title', {
              validate: (value) =>
                !!value.trim() || t('census_detail.edit.name_required', { defaultValue: 'Add a name' }),
            })}
            autoComplete='off'
            fontSize={{ base: 'md', md: 'sm' }}
          />
          <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root>
          <Field.Label>
            {t('members.save_census.description_label', { defaultValue: 'Description (optional)' })}
          </Field.Label>
          <Textarea {...register('description')} autoComplete='off' fontSize={{ base: 'md', md: 'sm' }} />
        </Field.Root>
        <UsedByWarning votes={usedBy} />
      </Stack>
    </Sheet>
  )
}

/**
 * The rarer actions on a saved census, in a "…" menu: rename it, delete it. Deleting is refused while a
 * published vote uses it, since that vote's census would be emptied, and until every vote is loaded,
 * since only then is it known that none does.
 */
export const SavedCensusMenu = ({
  group,
  usedBy,
  votesComplete = true,
}: {
  group: Group
  usedBy: AffectedVote[]
  /** Every vote (published and drafts) is loaded with no failed page */
  votesComplete?: boolean
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const deleteGroup = useDeleteGroup()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const blockers = publishedUsers(usedBy)
  const drafts = usedBy.filter((vote) => vote.state === 'draft')
  const blockedText = blockers.length
    ? t('census_detail.delete.blocked', {
        count: blockers.length,
        defaultValue_one: 'A published vote uses it, so it stays.',
        defaultValue_other: '{{count}} published votes use it, so it stays.',
      })
    : !votesComplete
      ? t('census_detail.delete.checking', {
          defaultValue: 'Deleting waits until all your votes are checked, so none still using it is missed.',
        })
      : ''

  const remove = async () => {
    try {
      await deleteGroup.mutateAsync(group.id)
      toast({
        title: t('census_detail.delete.done', { defaultValue: 'Census deleted' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      setDeleting(false)
      navigate(Routes.dashboard.memberbase.censuses)
    } catch (error) {
      toast({
        title: t('census_detail.delete.error', { defaultValue: "The census wasn't deleted" }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Menu.Root positioning={{ placement: 'bottom-end' }}>
        <Menu.Trigger asChild>
          <IconButton
            size='sm'
            variant='outline'
            colorPalette='gray'
            aria-label={t('census_detail.actions.more', { defaultValue: 'More actions' })}
          >
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW='240px'>
              <Menu.Item value='rename' onSelect={() => setEditing(true)}>
                <Icon as={LuPencil} />
                {t('census_detail.actions.rename', { defaultValue: 'Rename' })}
              </Menu.Item>
              <Menu.Item value='delete' color='fg.error' disabled={!!blockedText} onSelect={() => setDeleting(true)}>
                <Icon as={LuTrash2} />
                <Box>
                  <Text fontSize='sm'>{t('census_detail.delete.button', { defaultValue: 'Delete saved census' })}</Text>
                  {blockedText && (
                    <Text fontSize='xs' color='fg.muted'>
                      {blockedText}
                    </Text>
                  )}
                </Box>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <EditSavedSheet open={editing} onOpenChange={setEditing} group={group} usedBy={usedBy} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={({ open }) => setDeleting(open)}
        title={t('census_detail.delete.title', { defaultValue: "Delete '{{name}}'?", name: group.title })}
        description={t('census_detail.delete.description', {
          defaultValue: "The people stay in your members. This can't be undone.",
        })}
        confirmText={t('census_detail.delete.confirm', { defaultValue: 'Delete census' })}
        loading={deleteGroup.isPending}
        onConfirm={remove}
      >
        {drafts.length > 0 && (
          <Box mt={3}>
            <UsedByWarning votes={drafts} />
          </Box>
        )}
      </ConfirmDialog>
    </>
  )
}

/** Why nothing can be added or removed here, in one line. */
export const readOnlyText = (t: ReturnType<typeof useTranslation>['t'], reason: string) => {
  switch (reason) {
    case 'everyone':
      return t('census_detail.read_only.everyone', {
        defaultValue: 'Everyone always holds all your members. Add or remove people in People.',
      })
    case 'ended':
      return t('census_detail.read_only.ended', { defaultValue: "This vote has ended, so its census can't change." })
    case 'follows_everyone':
      return t('census_detail.read_only.follows_everyone', {
        defaultValue: 'This vote follows Everyone, so it changes with your members.',
      })
    case 'draft_saved':
      return t('census_detail.read_only.draft_saved', {
        defaultValue:
          'This draft still uses a saved census other votes share. Open it in the editor to give it a copy of its own you can change.',
      })
    default:
      return t('census_detail.read_only.draft_selected', {
        defaultValue: 'To change who can vote, edit the draft.',
      })
  }
}
