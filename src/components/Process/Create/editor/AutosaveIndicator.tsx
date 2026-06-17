import { Box, HStack, Icon, Spinner, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'
import { EASE } from '../VoterAuthentication/motion'

export type AutosaveIndicatorProps = {
  isSaving: boolean
  isDirty: boolean
  hasDraft: boolean
}

/**
 * Quiet, reassuring autosave status. Replaces the silent 30s autosave with a
 * calm signal: "Saving…" while in flight, "Saved" once a draft exists and the
 * form is clean, and nothing at all before the first edit.
 */
export const AutosaveIndicator = ({ isSaving, isDirty, hasDraft }: AutosaveIndicatorProps) => {
  const { t } = useTranslation()

  const state: 'saving' | 'saved' | 'idle' = isSaving ? 'saving' : hasDraft && !isDirty ? 'saved' : 'idle'

  if (state === 'idle') return null

  return (
    <HStack gap={1.5} color='texts.subtle' fontSize='xs' css={{ transition: `opacity 0.2s ${EASE}` }}>
      {state === 'saving' ? (
        <>
          <Spinner size='xs' borderWidth='1.5px' />
          <Text>{t('editor.autosave.saving', { defaultValue: 'Saving…' })}</Text>
        </>
      ) : (
        <>
          <Box color='green.500' lineHeight={0}>
            <Icon as={LuCheck} boxSize={3.5} />
          </Box>
          <Text>{t('editor.autosave.saved', { defaultValue: 'Saved' })}</Text>
        </>
      )}
    </HStack>
  )
}
