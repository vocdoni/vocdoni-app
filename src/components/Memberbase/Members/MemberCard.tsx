import { Card, Checkbox, Flex, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Member } from '~src/queries/members'
import { useTable } from '../TableProvider'
import { maskIfNeeded } from './index'

type MemberCardProps = {
  member: Member
  actions?: ReactNode
  selectable?: boolean
}

const memberAlias = (member: Member) =>
  [member.name, member.surname].filter(Boolean).join(' ') || member.email || member.memberNumber

const MemberCard = ({ member, actions, selectable = true }: MemberCardProps) => {
  const { columns, isSelected, toggleOne } = useTable()

  return (
    <Card.Root variant='data-list-item'>
      <Card.Header>
        <Flex gap={3} alignItems='center' minW={0}>
          {selectable && (
            <Checkbox.Root
              checked={isSelected(member.id)}
              onCheckedChange={({ checked }) => toggleOne(member.id, checked === true)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
            </Checkbox.Root>
          )}
          <Text fontWeight='medium' lineClamp={2}>
            {memberAlias(member)}
          </Text>
        </Flex>
        {actions}
      </Card.Header>
      <Card.Body>
        {columns
          .filter((column) => column.visible && !['name', 'surname'].includes(column.id))
          .map((column) => {
            const value = maskIfNeeded(column.id, member[column.id])
            if (!value) return null
            return (
              <Text key={column.id}>
                {column.label}: {value}
              </Text>
            )
          })}
      </Card.Body>
    </Card.Root>
  )
}

export default MemberCard
