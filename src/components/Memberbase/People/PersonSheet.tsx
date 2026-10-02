import { Badge, Button, DataList, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPencil } from 'react-icons/lu'
import { Sheet } from '~components/ui/Sheet'
import { useMemberFields } from '../fields'
import { findMemberLink, memberDisplayName } from './display'
import { MemberValue } from './PeopleTable'
import { PersonCensuses } from './PersonCensuses'
import { PersonForm } from './PersonForm'
import { usePersonCensuses } from './usePersonCensuses'
import type { SelectedMember } from './useSelection'

/** From xl the drawer sits beside the table without blocking it. */
const WIDE_QUERY = '(min-width: 80rem)'

/** The drawer's width from md (the Sheet's `md` size, Chakra's `lg` size token) */
export const PERSON_DRAWER_WIDTH = '32rem'

const subscribeWide = (onChange: () => void) => {
  const query = typeof window !== 'undefined' ? window.matchMedia?.(WIDE_QUERY) : undefined
  query?.addEventListener?.('change', onChange)
  return () => query?.removeEventListener?.('change', onChange)
}

/** Whether the viewport is xl or wider. False on the server, so it never renders a non-modal sheet there. */
export const useIsWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia?.(WIDE_QUERY).matches ?? false,
    () => false
  )

type StepEvent = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'target' | 'preventDefault'>

type PersonSheetProps = {
  /** The id in the URL (`?member=`) */
  memberId: string | null
  /** That member, when they're on the page */
  member?: SelectedMember
  /** The page is still loading, so a missing member may yet arrive */
  loading?: boolean
  onClose: () => void
  onDelete: (member: SelectedMember) => void
  /** j/k: the next or previous person on the page */
  onStep: (event: StepEvent) => void
  inLiveVote?: boolean
}

const FORM_ID = 'person-form'

/**
 * A person's details, opened from their name. It edits in place: "Edit" turns the details into the
 * form, with Save in the header on phones and in the footer from md.
 */
export const PersonSheet = ({ memberId, member, loading, onClose, onDelete, onStep, inLiveVote }: PersonSheetProps) => {
  const { t } = useTranslation()
  const fields = useMemberFields()
  const isWide = useIsWide()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  // Remembered while closing, so focus can go back to the row that opened it
  const lastId = useRef(memberId)
  if (memberId) lastId.current = memberId
  const open = Boolean(memberId)
  const name = member ? memberDisplayName(member) : ''
  const censuses = usePersonCensuses(open ? member : undefined)

  // A different person (j/k or another row) starts in view mode
  useEffect(() => {
    setEditing(false)
  }, [memberId])

  // j/k only while focus is inside the drawer
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (contentRef.current?.contains(event.target as Node)) onStep(event)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onStep])

  const headingFocus = useCallback(
    () => contentRef.current?.querySelector<HTMLElement>('[data-person-heading]') ?? null,
    []
  )
  const restoreFocus = useCallback(() => (lastId.current ? findMemberLink(lastId.current) : null), [])

  const title = member ? (
    // ph-no-capture: the member's name
    <span className='ph-no-capture' data-person-heading tabIndex={-1} style={{ outline: 'none' }}>
      {name || t('members.people.unnamed', { defaultValue: 'No name' })}
    </span>
  ) : (
    <span data-person-heading tabIndex={-1} style={{ outline: 'none' }}>
      {t('members.person.title', { defaultValue: 'Person' })}
    </span>
  )

  const footer = member ? (
    editing ? (
      <Flex justify='flex-end' gap={2} w='full'>
        <Button variant='outline' onClick={() => setEditing(false)}>
          {t('members.person.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button key='save' type='submit' form={FORM_ID} loading={saving} hideBelow='md'>
          {t('members.person.save', { defaultValue: 'Save' })}
        </Button>
      </Flex>
    ) : (
      <Flex justify='space-between' gap={2} w='full' wrap='wrap'>
        <Button variant='ghost' colorPalette='red' onClick={() => onDelete(member)}>
          {t('members.people.delete_person', { defaultValue: 'Delete from members…' })}
        </Button>
        {/* Its own key: reused as the Save button above, the click that opens the form would submit it */}
        <Button key='edit' onClick={() => setEditing(true)}>
          <Icon as={LuPencil} />
          {t('members.person.edit', { defaultValue: 'Edit' })}
        </Button>
      </Flex>
    )
  ) : undefined

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={title}
      modal={!isWide}
      closeOnInteractOutside={!isWide}
      initialFocusEl={headingFocus}
      finalFocusEl={restoreFocus}
      contentRef={contentRef}
      headerActions={
        editing ? (
          <Button size='sm' type='submit' form={FORM_ID} loading={saving} hideFrom='md'>
            {t('members.person.save', { defaultValue: 'Save' })}
          </Button>
        ) : undefined
      }
      footer={footer}
    >
      {!member ? (
        loading ? null : (
          <Text fontSize='sm' color='fg.muted'>
            {t('members.person.not_found', {
              defaultValue: "This person isn't on this page. They may have been deleted, or the list changed.",
            })}
          </Text>
        )
      ) : editing ? (
        <PersonForm
          key={member.id}
          formId={FORM_ID}
          member={member}
          onSaved={() => setEditing(false)}
          onPendingChange={setSaving}
          inLiveVote={inLiveVote}
          runningVotes={censuses.running}
        />
      ) : (
        <Stack gap={5}>
          {(member.memberNumber || (member.weight && member.weight !== '1')) && (
            // ph-no-capture: member data
            <Flex gap={2} wrap='wrap' className='ph-no-capture'>
              {member.memberNumber && (
                <Badge variant='subtle' fontVariantNumeric='tabular-nums'>
                  {t('members.person.member_number_chip', {
                    defaultValue: 'No. {{number}}',
                    number: member.memberNumber,
                  })}
                </Badge>
              )}
              {member.weight && member.weight !== '1' && (
                <Badge variant='subtle' fontVariantNumeric='tabular-nums'>
                  {t('members.person.weight_chip', { defaultValue: 'Voting power {{weight}}', weight: member.weight })}
                </Badge>
              )}
            </Flex>
          )}
          {/* ph-no-capture: member data */}
          <DataList.Root orientation='horizontal' size='md' className='ph-no-capture'>
            {fields
              .filter((field) => field.id !== 'name' && field.id !== 'surname')
              .map((field) => (
                <DataList.Item key={field.id}>
                  <DataList.ItemLabel minW='9rem'>{field.label}</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {field.mask(member[field.id as keyof SelectedMember] as string).kind === 'empty' ? (
                      <Text as='span' color='fg.muted'>
                        {t('members.person.not_set', { defaultValue: 'Not set' })}
                      </Text>
                    ) : (
                      <MemberValue field={field} member={member} />
                    )}
                  </DataList.ItemValue>
                </DataList.Item>
              ))}
          </DataList.Root>
          <PersonCensuses censuses={censuses} />
        </Stack>
      )}
    </Sheet>
  )
}
