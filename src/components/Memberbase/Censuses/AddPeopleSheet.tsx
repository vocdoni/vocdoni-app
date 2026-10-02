import { Button, Flex, Stack, Tabs, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { Sheet } from '~components/ui/Sheet'
import { type Member, useMembersPageFetcher } from '~src/queries/members'
import { PersonForm } from '../People/PersonForm'
import type { SelectedMember } from '../People/useSelection'
import { findCreatedMember } from './censusEdits'
import { MemberPicker } from './MemberPicker'
import { UsedByWarning } from './UsedBy'
import type { useCensusEditor } from './useCensusEditor'
import type { ResolvedCensusState } from './useResolvedCensus'

const FORM_ID = 'census-new-person'

type AddPeopleSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  census: ResolvedCensusState
  editor: ReturnType<typeof useCensusEditor>
  /** The census' name, for messages */
  name: string
}

/**
 * "Add people": pick existing members (search, or paste a list), or create a new one, who joins the
 * members and this census at once.
 */
export const AddPeopleSheet = ({ open, onOpenChange, census, editor, name }: AddPeopleSheetProps) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const fetchPage = useMembersPageFetcher()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [tab, setTab] = useState<'members' | 'new'>('members')
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())
  const [creating, setCreating] = useState(false)
  const [formPending, setFormPending] = useState(false)
  const existing = new Set(census.group?.memberIds ?? [])
  const busy = editor.busy || creating || formPending
  const vote = census.kind === 'vote'

  useEffect(() => {
    if (open) return
    setSelected(new Map())
    setTab('members')
  }, [open])

  const done = (added: number) => {
    const after = census.count + added
    toast({
      title: vote
        ? t('census_detail.add.done_vote', {
            defaultValue: '{{before}} → {{after}} voters',
            before: format(census.count),
            after: format(after),
          })
        : t('census_detail.add.done', {
            defaultValue: '{{before}} → {{after}} people',
            before: format(census.count),
            after: format(after),
          }),
      description: t('census_detail.add.done_detail', { defaultValue: "Added to '{{name}}'", name }),
      type: 'success',
      duration: 4000,
      isClosable: true,
    })
    onOpenChange(false)
  }

  const fail = (error: unknown, title: string) =>
    toast({
      title,
      description: error instanceof Error ? error.message : undefined,
      type: 'error',
      duration: 6000,
      isClosable: true,
    })

  const addSelected = async () => {
    try {
      done(await editor.add([...selected.keys()]))
    } catch (error) {
      fail(error, t('census_detail.add.error', { defaultValue: "They couldn't be added" }))
    }
  }

  const addCreated = async (person?: Partial<Member>) => {
    if (!person) return
    setCreating(true)
    try {
      const member = await findCreatedMember(fetchPage, person)
      if (!member) {
        toast({
          title: t('census_detail.add.created_not_found', {
            defaultValue: "Added to your members, but not to this census yet. Add them from 'From members'.",
          }),
          type: 'warning',
          duration: 8000,
          isClosable: true,
        })
        setTab('members')
        return
      }
      done(await editor.add([member.id]))
    } catch (error) {
      fail(
        error,
        t('census_detail.add.created_error', {
          defaultValue: "Added to your members, but not to this census. Add them from 'From members'.",
        })
      )
    } finally {
      setCreating(false)
    }
  }

  const progress = editor.progress

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : !busy && onOpenChange(false))}
      title={t('census_detail.add.title', { defaultValue: 'Add people' })}
      footer={
        <Flex justify='space-between' align='center' gap={2} w='full' wrap='wrap'>
          <Text fontSize='xs' color='fg.muted' role='status' fontVariantNumeric='tabular-nums'>
            {progress?.phase === 'updating_vote'
              ? t('census_detail.add.updating_vote', {
                  defaultValue: 'Added. Updating the vote so they can vote…',
                })
              : progress && progress.total > 1
                ? t('members.bulk.progress', {
                    defaultValue: '{{done}} of {{total}} done…',
                    done: format(progress.done),
                    total: format(progress.total),
                  })
                : null}
          </Text>
          <Flex gap={2}>
            <Button variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
              {t('members.bulk.cancel', { defaultValue: 'Cancel' })}
            </Button>
            {tab === 'members' ? (
              <Button onClick={addSelected} loading={busy} disabled={!selected.size}>
                {t('census_detail.add.submit', {
                  count: selected.size,
                  formattedCount: format(selected.size),
                  defaultValue_one: 'Add 1 person',
                  defaultValue_other: 'Add {{formattedCount}} people',
                })}
              </Button>
            ) : (
              <Button type='submit' form={FORM_ID} loading={busy}>
                {t('members.person.add_submit', { defaultValue: 'Add person' })}
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      <Stack gap={4}>
        <UsedByWarning votes={census.sharedWith} />
        <Tabs.Root value={tab} onValueChange={({ value }) => setTab(value as 'members' | 'new')} variant='line'>
          <Tabs.List>
            <Tabs.Trigger value='members'>
              {t('census_detail.add.from_members', { defaultValue: 'From members' })}
            </Tabs.Trigger>
            <Tabs.Trigger value='new'>{t('census_detail.add.new_person', { defaultValue: 'New person' })}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value='members'>
            <MemberPicker selected={selected} onChange={setSelected} existing={existing} />
          </Tabs.Content>
          <Tabs.Content value='new'>
            <Stack gap={4}>
              <Text fontSize='sm' color='fg.muted'>
                {t('census_detail.add.new_hint', {
                  defaultValue: "They'll be added to your members and to this census.",
                })}
              </Text>
              {open && tab === 'new' && (
                <PersonForm
                  formId={FORM_ID}
                  quiet
                  source='census'
                  onSaved={addCreated}
                  onPendingChange={setFormPending}
                />
              )}
            </Stack>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Sheet>
  )
}

/**
 * For a vote whose people were picked one by one there's no list to tick in: pick the members to take
 * out from the member list instead (anyone not in the vote is simply skipped).
 */
export const PickToRemoveSheet = ({
  open,
  onOpenChange,
  onPicked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPicked: (people: SelectedMember[]) => void
}) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())

  useEffect(() => {
    if (!open) setSelected(new Map())
  }, [open])

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('census_detail.remove.pick_title', { defaultValue: 'Remove people' })}
      footer={
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('members.bulk.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button colorPalette='red' disabled={!selected.size} onClick={() => onPicked([...selected.values()])}>
            {t('census_detail.remove.pick_submit', {
              count: selected.size,
              formattedCount: format(selected.size),
              defaultValue_one: 'Remove 1 person…',
              defaultValue_other: 'Remove {{formattedCount}} people…',
            })}
          </Button>
        </Flex>
      }
    >
      <Stack gap={4}>
        <Text fontSize='sm' color='fg.muted'>
          {t('census_detail.remove.pick_hint', {
            defaultValue: 'Find them in your members. Anyone who isn’t in this vote is left as is.',
          })}
        </Text>
        <MemberPicker selected={selected} onChange={setSelected} />
      </Stack>
    </Sheet>
  )
}
