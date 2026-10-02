import { IconButton, Menu, Portal } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuEllipsis } from 'react-icons/lu'
import type { SelectedMember } from './useSelection'

export type RowAction = 'open' | 'add_to_saved_census' | 'add_to_vote' | 'delete'

type RowMenuProps = {
  member: SelectedMember
  /** The member's name, for the button's accessible name */
  name: string
  onAction: (action: RowAction, member: SelectedMember) => void
}

/** A row's own actions. They act on that one person and leave the selection alone. */
export const RowMenu = ({ member, name, onAction }: RowMenuProps) => {
  const { t } = useTranslation()

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <IconButton
          variant='ghost'
          size='sm'
          aria-label={t('members.people.row_actions', { defaultValue: 'Actions for {{name}}', name })}
        >
          <LuEllipsis />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW='160px'>
            <Menu.Item value='open' onSelect={() => onAction('open', member)}>
              {t('members.people.open', { defaultValue: 'Open' })}
            </Menu.Item>
            <Menu.Item value='add_to_vote' onSelect={() => onAction('add_to_vote', member)}>
              {t('members.bulk.add_to_vote', { defaultValue: 'Add to a vote' })}
            </Menu.Item>
            <Menu.Item value='add_to_saved_census' onSelect={() => onAction('add_to_saved_census', member)}>
              {t('members.bulk.add_to_saved_census', { defaultValue: 'Add to a saved census' })}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value='delete' color='fg.error' onSelect={() => onAction('delete', member)}>
              {t('members.people.delete_person', { defaultValue: 'Delete from members…' })}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
