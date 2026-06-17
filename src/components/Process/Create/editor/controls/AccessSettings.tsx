import { Box, Button, Dialog, Icon, IconButton, Portal, Text } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuSettings2 } from 'react-icons/lu'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Process } from '../../common'
import CensusCreation from '../../Sidebar/CensusCreation'

/**
 * Voter access: the already-redesigned census/auth flow, plus the toggle that
 * reveals the extra census methods (Spreadsheet / Web3). Logic mirrors the old
 * CreateSidebar dialog so nothing changes behaviourally.
 */
export const AccessSettings = () => {
  const { t } = useTranslation()
  const [showExtraCensusMethods, setShowExtraCensusMethods] = useLocalStorage('showExtraCensusMethods', false)
  const { setValue } = useFormContext<Process>()

  const handleToggleExtraMethods = () => {
    if (showExtraCensusMethods) {
      setValue('censusType', CensusTypes.CSP)
    }
    setShowExtraCensusMethods(!showExtraCensusMethods)
  }

  return (
    <Box>
      <Box display='flex' justifyContent='flex-end' mb={1}>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <IconButton
              aria-label={t('process_create.census.settings', { defaultValue: 'Census settings' })}
              variant='ghost'
              size='xs'
            >
              <Icon as={LuSettings2} />
            </IconButton>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.CloseTrigger />
                <Dialog.Header display='flex' flexDirection='column' alignItems='flex-start' gap={1}>
                  <Dialog.Title>
                    {t('process_create.census.extra_methods.modal_title', { defaultValue: 'Extra census methods' })}
                  </Dialog.Title>
                  <Text fontSize='sm' color='texts.subtle'>
                    {showExtraCensusMethods
                      ? t('process_create.census.extra_methods.disable_description', {
                          defaultValue:
                            'Do you want to disable extra census methods? This will hide the Spreadsheet and Web3 options and show only the Group method.',
                        })
                      : t('process_create.census.extra_methods.enable_description', {
                          defaultValue:
                            'Do you want to enable extra census methods? This will show additional options like Spreadsheet and Web3 census creation.',
                        })}
                  </Text>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant='ghost'>{t('common.cancel', { defaultValue: 'Cancel' })}</Button>
                  </Dialog.ActionTrigger>
                  <Dialog.ActionTrigger asChild>
                    <Button onClick={handleToggleExtraMethods}>
                      {showExtraCensusMethods
                        ? t('common.disable', { defaultValue: 'Disable' })
                        : t('common.enable', { defaultValue: 'Enable' })}
                    </Button>
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>
      <CensusCreation showExtraMethods={showExtraCensusMethods} />
    </Box>
  )
}
