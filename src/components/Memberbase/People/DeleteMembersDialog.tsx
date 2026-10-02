import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { useDeleteMembers } from '~src/queries/members'
import { memberDisplayName } from './display'
import type { SelectedMember } from './useSelection'

type DeleteMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: SelectedMember[]
  onDeleted?: (ids: string[]) => void
}

/** Confirms deleting the given members from the member list. */
export const DeleteMembersDialog = ({ open, onOpenChange, members, onDeleted }: DeleteMembersDialogProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const deleteMembers = useDeleteMembers()
  const count = members.length
  const single = count === 1 ? memberDisplayName(members[0]) : ''

  const confirm = async () => {
    const ids = members.map((member) => member.id)
    try {
      await deleteMembers.mutateAsync({ ids })
      toast({
        title: t('members.delete.done', {
          defaultValue_one: 'Deleted from members',
          defaultValue_other: '{{count}} people deleted from members',
          count,
        }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onOpenChange(false)
      onDeleted?.(ids)
    } catch (error) {
      toast({
        title: t('members.delete.error', { defaultValue: 'Nobody was deleted' }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => onOpenChange(next)}
      title={
        single ? (
          // ph-no-capture: the member's name
          <span className='ph-no-capture'>
            {t('members.delete.title_person', { defaultValue: 'Delete {{name}} from members?', name: single })}
          </span>
        ) : (
          t('members.delete.title_people', { defaultValue: 'Delete {{count}} people from members?', count })
        )
      }
      description={t('members.delete.description', {
        defaultValue: "They're removed from every census they're in. This can't be undone.",
      })}
      confirmText={t('members.delete.confirm', {
        defaultValue_one: 'Delete',
        defaultValue_other: 'Delete {{count}}',
        count,
      })}
      loading={deleteMembers.isPending}
      onConfirm={confirm}
    />
  )
}
