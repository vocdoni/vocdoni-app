import { Box, Button, Field, Flex, Icon, Input, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuDownload, LuPencil, LuTrash2, LuVote } from 'react-icons/lu'
import { useNavigate } from 'react-router'
import { useMemberFields, type MemberFieldId } from '~components/Memberbase/fields'
import { signInText } from '~components/Process/Dashboard/View/shared'
import { useToast } from '~components/Toast'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { SectionCard } from '~components/ui/SectionCard'
import { Sheet } from '~components/ui/Sheet'
import { Tooltip } from '~components/ui/Tooltip'
import { Routes } from '~routes'
import type { AffectedVote } from '~src/queries/affectedVotes'
import { type Group, useDeleteGroup, useGroupMembersFetcher, useUpdateGroup } from '~src/queries/groups'
import { collectMembers, isAbortError, useCensusReadiness } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { csvBlob, downloadBlob } from '~utils/download'
import { censusCsvRows, censusFileName } from './exportCsv'
import { publishedUsers } from './model'
import { UsedByWarning } from './UsedBy'
import { useNavigateToVote } from './useNavigateToVote'

type SignInCardProps = {
  /** The vote's one-time code channels; undefined for a saved census (each vote sets its own) */
  twoFaFields?: string[]
  /** Scopes the readiness check; none checks the whole organization */
  groupId?: string
  total: number
  /** Readiness can't be checked (a census of people picked one by one has no group to check) */
  noReadiness?: boolean
}

/** How people sign in, and how many of them can get a one-time code. */
export const SignInCard = ({ twoFaFields, groupId, total, noReadiness }: SignInCardProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const forVote = twoFaFields !== undefined
  const channels = forVote ? twoFaFields : ['email', 'phone']
  const readiness = useCensusReadiness({ groupId, channels, total, enabled: !noReadiness })

  return (
    <SectionCard title={t('census_detail.sign_in.title', { defaultValue: 'Sign-in' })}>
      <Text fontSize='sm'>
        {forVote
          ? signInText(t, twoFaFields)
          : t('census_detail.sign_in.per_vote', { defaultValue: 'Each vote sets how its voters sign in.' })}
      </Text>
      {readiness.available && (
        <Text
          fontSize='sm'
          color={readiness.unreachable ? 'fg.warning' : 'fg.muted'}
          mt={2}
          fontVariantNumeric='tabular-nums'
        >
          {forVote
            ? t('census_detail.sign_in.ready', {
                defaultValue: '{{ready}} of {{total}} can get a code',
                ready: format(readiness.ready),
                total: format(readiness.total),
              })
            : t('census_detail.sign_in.ready_any', {
                defaultValue: '{{ready}} of {{total}} can get a code by email or SMS',
                ready: format(readiness.ready),
                total: format(readiness.total),
              })}
        </Text>
      )}
    </SectionCard>
  )
}

/**
 * "Download census (CSV)": every person of the census' group, loaded page by page and saved as a
 * semicolon CSV in the browser. Names, member numbers and emails; national IDs masked; never phones.
 */
export const ExportCard = ({ groupId, name, kind }: { groupId: string; name: string; kind: string }) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const fields = useMemberFields()
  const fetchPage = useGroupMembersFetcher(groupId)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const controller = useRef<AbortController | null>(null)
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

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

  return (
    <SectionCard title={t('census_detail.export.title', { defaultValue: 'Download' })}>
      <Text fontSize='sm' color='fg.muted' mb={3}>
        {t('census_detail.export.hint', {
          defaultValue: 'Names, member numbers and emails, dated today. National IDs are masked and phones left out.',
        })}
      </Text>
      <Button size='sm' variant='outline' colorPalette='gray' onClick={download} loading={!!progress}>
        <Icon as={LuDownload} />
        {t('census_detail.export.button', { defaultValue: 'Download census (CSV)' })}
      </Button>
      {progress && progress.total > 0 && (
        <Text fontSize='xs' color='fg.muted' mt={2} fontVariantNumeric='tabular-nums' role='status'>
          {t('census_detail.export.progress', {
            defaultValue: 'Preparing {{done}} of {{total}}…',
            done: format(progress.done),
            total: format(progress.total),
          })}
        </Text>
      )}
    </SectionCard>
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
 * What can be done with a saved census: use it in a vote, rename it, delete it. Deleting is refused
 * while a published vote uses it, since that vote's census would be emptied.
 */
export const SavedCensusActions = ({ group, usedBy }: { group: Group; usedBy: AffectedVote[] }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const navigateToVote = useNavigateToVote()
  const deleteGroup = useDeleteGroup()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const blockers = publishedUsers(usedBy)
  const drafts = usedBy.filter((vote) => vote.state === 'draft')

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

  const deleteButton = (
    <Button
      size='sm'
      variant='ghost'
      colorPalette='red'
      justifyContent='flex-start'
      disabled={blockers.length > 0}
      onClick={() => setDeleting(true)}
    >
      <Icon as={LuTrash2} />
      {t('census_detail.delete.button', { defaultValue: 'Delete saved census' })}
    </Button>
  )

  return (
    <SectionCard title={t('census_detail.actions.title', { defaultValue: 'Saved census' })}>
      <Stack gap={1} align='stretch'>
        <Button
          size='sm'
          variant='ghost'
          colorPalette='gray'
          justifyContent='flex-start'
          onClick={() => navigateToVote(group.id)}
        >
          <Icon as={LuVote} />
          {t('census_detail.actions.use', { defaultValue: 'Use in a new vote' })}
        </Button>
        <Button
          size='sm'
          variant='ghost'
          colorPalette='gray'
          justifyContent='flex-start'
          onClick={() => setEditing(true)}
        >
          <Icon as={LuPencil} />
          {t('census_detail.actions.rename', { defaultValue: 'Rename' })}
        </Button>
        {blockers.length ? (
          <Tooltip
            content={t('census_detail.delete.blocked', {
              count: blockers.length,
              defaultValue_one: 'A published vote uses it, so it stays.',
              defaultValue_other: '{{count}} published votes use it, so it stays.',
            })}
          >
            <Box>{deleteButton}</Box>
          </Tooltip>
        ) : (
          deleteButton
        )}
        {blockers.length > 0 && (
          <Text fontSize='xs' color='fg.muted' px={3}>
            {t('census_detail.delete.blocked', {
              count: blockers.length,
              defaultValue_one: 'A published vote uses it, so it stays.',
              defaultValue_other: '{{count}} published votes use it, so it stays.',
            })}
          </Text>
        )}
      </Stack>
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
    </SectionCard>
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
    default:
      return t('census_detail.read_only.draft_selected', {
        defaultValue: 'To change who can vote, edit the draft.',
      })
  }
}
