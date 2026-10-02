import { Box, Checkbox, Flex, List, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { To } from 'react-router'
import { memberDisplayName } from './display'
import { MemberNameLink } from './PeopleTable'
import type { Selection, SelectedMember } from './useSelection'

type PeopleCardsProps = {
  members: SelectedMember[]
  surnameFirst: boolean
  /** Checkboxes only show in select mode, so a tap opens the person */
  selectMode: boolean
  selection: Selection
  activeId?: string | null
  memberLocation: (id: string) => To
  onOpen: (id: string) => void
  renderRowMenu: (member: SelectedMember, name: string) => ReactNode
  dimmed?: boolean
  empty?: ReactNode
}

/** The member list below md: one card per person, big enough to tap. */
export const PeopleCards = ({
  members,
  surnameFirst,
  selectMode,
  selection,
  activeId,
  memberLocation,
  onOpen,
  renderRowMenu,
  dimmed,
  empty,
}: PeopleCardsProps) => {
  const { t } = useTranslation()

  if (empty) return <Box px={4}>{empty}</Box>

  return (
    <List.Root
      listStyleType='none'
      gap={0}
      opacity={dimmed ? 0.6 : 1}
      aria-label={t('members.people.list_label', { defaultValue: 'Members' })}
    >
      {members.map((member) => {
        const name = memberDisplayName(member, surnameFirst)
        const selected = selection.isSelected(member.id)
        const meta = [member.email, member.memberNumber].filter(Boolean).join(' · ')
        return (
          // ph-no-capture: the whole card is member data, the checkbox's and menu's names included
          <List.Item
            key={member.id}
            data-member-row={member.id}
            className='ph-no-capture'
            display='flex'
            alignItems='center'
            gap={3}
            minH='64px'
            px={4}
            py={2}
            borderTopWidth='1px'
            borderColor='border'
            bg={selected || activeId === member.id ? 'bg.muted' : undefined}
            boxShadow={selected ? 'inset 2px 0 0 {colors.colorPalette.solid}' : undefined}
          >
            {selectMode && (
              <Checkbox.Root
                checked={selected}
                onCheckedChange={({ checked }) => selection.toggle(member, checked === true)}
                aria-label={t('members.table.select_member', { defaultValue: 'Select {{name}}', name })}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            )}
            <Flex direction='column' flex='1' minW={0}>
              <MemberNameLink
                member={member}
                label={name}
                to={memberLocation(member.id)}
                onOpen={onOpen}
                fontSize='md'
              />
              {meta && (
                <Text fontSize='xs' color='fg.muted' truncate>
                  {meta}
                </Text>
              )}
            </Flex>
            {renderRowMenu(member, name)}
          </List.Item>
        )
      })}
    </List.Root>
  )
}
