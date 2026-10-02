import { Button, Icon, Menu, Portal } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuChevronUp, LuListPlus, LuSave } from 'react-icons/lu'

export type SelectionAction =
  | 'save_census'
  | 'add_to_vote'
  | 'add_to_saved_census'
  | 'remove_from_saved_census'
  | 'delete'

/**
 * The SelectionBar's actions: "Save as census", "Add to a vote" and a More menu with the rest.
 * Delete only ever sits in More. On phones "Add to a vote" moves into More too (by CSS, so the
 * server and the client render the same).
 */
export const SelectionActions = ({ onAction }: { onAction: (action: SelectionAction) => void }) => {
  const { t } = useTranslation()

  return (
    <>
      <Button size='sm' onClick={() => onAction('save_census')}>
        <Icon as={LuSave} />
        {t('members.bulk.save_census', { defaultValue: 'Save as census' })}
      </Button>
      <Button size='sm' variant='outline' hideBelow='md' onClick={() => onAction('add_to_vote')}>
        <Icon as={LuListPlus} />
        {t('members.bulk.add_to_vote', { defaultValue: 'Add to a vote' })}
      </Button>
      <Menu.Root positioning={{ placement: 'top-end' }} onSelect={({ value }) => onAction(value as SelectionAction)}>
        <Menu.Trigger asChild>
          <Button size='sm' variant='outline'>
            {t('members.bulk.more', { defaultValue: 'More' })}
            <Icon as={LuChevronUp} />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            {/* Above the floating bar it opens from (the positioner copies the content's z-index) */}
            <Menu.Content minW='230px' zIndex='popover'>
              <Menu.Item value='add_to_vote' hideFrom='md'>
                {t('members.bulk.add_to_vote', { defaultValue: 'Add to a vote' })}
              </Menu.Item>
              <Menu.Item value='add_to_saved_census'>
                {t('members.bulk.add_to_saved_census', { defaultValue: 'Add to a saved census' })}
              </Menu.Item>
              <Menu.Item value='remove_from_saved_census'>
                {t('members.bulk.remove_from_saved_census', { defaultValue: 'Remove from a saved census' })}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item value='delete' color='fg.error'>
                {t('members.bulk.delete', { defaultValue: 'Delete…' })}
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  )
}
