import { Button, Flex, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '~components/ui/Sheet'
import { PersonForm } from './PersonForm'

const FORM_ID = 'add-person-form'

type AddPersonSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Adds one person to the members, with the same form the drawer edits with. */
export const AddPersonSheet = ({ open, onOpenChange }: AddPersonSheetProps) => {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const save = t('members.person.add_submit', { defaultValue: 'Add person' })

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('members.person.add_title', { defaultValue: 'Add a person' })}
      headerActions={
        <Button size='sm' type='submit' form={FORM_ID} loading={saving} hideFrom='md'>
          {save}
        </Button>
      }
      footer={
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('members.person.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type='submit' form={FORM_ID} loading={saving} hideBelow='md'>
            {save}
          </Button>
        </Flex>
      }
    >
      <Text fontSize='sm' color='fg.muted' mb={4}>
        {t('members.person.add_hint', {
          defaultValue: 'A name and an email or mobile are enough. Add the rest only if you use it to sign in.',
        })}
      </Text>
      {open && <PersonForm formId={FORM_ID} onSaved={() => onOpenChange(false)} onPendingChange={setSaving} />}
    </Sheet>
  )
}
