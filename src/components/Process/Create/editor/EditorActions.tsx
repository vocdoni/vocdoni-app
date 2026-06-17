import { Box, Button, Icon, IconButton } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuRotateCcw } from 'react-icons/lu'
import { EditorChrome } from './types'

export type EditorActionsProps = {
  chrome: EditorChrome
}

/**
 * The Publish / Save-draft / Reset actions. Publish stays a real `type=submit`
 * so the existing form handler fires unchanged, regardless of which shell hosts
 * these buttons.
 */
export const EditorActions = ({ chrome }: EditorActionsProps) => {
  const { t } = useTranslation()
  const { isDirty, isSubmitting, isSaving, onReset, onManualSave } = chrome

  return (
    <Box display='inline-flex' alignItems='center' gap={2}>
      {isDirty && (
        <IconButton
          size='sm'
          variant='ghost'
          onClick={onReset}
          aria-label={t('dashboard.actions.reset_form', { defaultValue: 'Reset form' })}
          title={t('dashboard.actions.reset_form', { defaultValue: 'Reset form' })}
        >
          <Icon as={LuRotateCcw} />
        </IconButton>
      )}
      <Button size='sm' variant='outline' colorPalette='black' onClick={onManualSave} loading={isSaving} type='button'>
        {t('process.create.action.save_draft', { defaultValue: 'Save' })}
      </Button>
      <Button size='sm' colorPalette='black' type='submit' loading={isSubmitting}>
        {t('process.create.action.publish', { defaultValue: 'Publish' })}
      </Button>
    </Box>
  )
}
