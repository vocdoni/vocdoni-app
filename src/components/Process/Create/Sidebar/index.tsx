import { Button, Dialog, Flex, Icon, IconButton, Portal, Text, useBreakpointValue } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuSettings, LuX } from 'react-icons/lu'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Sidebar, SidebarContents, SidebarSubtitle, SidebarTitle } from '~components/shared/Dashboard/Contents'
import { useSidebarVisibility } from '~components/shared/Dashboard/SidebarContext'
import { Process } from '../common'
import { BasicConfig } from './BasicConfig'
import CensusCreation from './CensusCreation'
import { ExtraConfig } from './ExtraConfig'

export const CreateSidebar = () => {
  const { t } = useTranslation()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [showExtraCensusMethods, setShowExtraCensusMethods] = useLocalStorage('showExtraCensusMethods', false)
  const { setValue } = useFormContext<Process>()
  const { showSidebar, closeSidebar } = useSidebarVisibility()

  const handleToggleExtraMethods = () => {
    if (showExtraCensusMethods) {
      // make sure we switch back to Group census if we are disabling extra methods
      setValue('censusType', CensusTypes.CSP)
    }
    setShowExtraCensusMethods(!showExtraCensusMethods)
  }

  return (
    <Sidebar show={showSidebar}>
      <SidebarContents borderBottom='1px solid' borderColor='table.border'>
        <SidebarTitle>
          <Trans i18nKey='process_create.settings'>Settings</Trans>
        </SidebarTitle>
        {isMobile && (
          <IconButton
            aria-label={t('drawer.close', { defaultValue: 'Close drawer' })}
            variant='ghost'
            size='sm'
            position='absolute'
            top={2}
            right={2}
            onClick={closeSidebar}
          >
            <Icon as={LuX} />
          </IconButton>
        )}
      </SidebarContents>

      <SidebarContents flex='1' overflowY='auto'>
        <SidebarSubtitle>
          <Trans i18nKey='process_create.basic_configuration'>Basic Configuration</Trans>
        </SidebarSubtitle>
        <BasicConfig />

        <SidebarSubtitle borderTop='1px solid' borderColor='table.border' mt={4}>
          <Trans i18nKey='process_create.extra_configuration'>Extra Configuration</Trans>
        </SidebarSubtitle>
        <ExtraConfig />

        <Flex
          borderTop='1px solid'
          borderColor='table.border'
          mt={4}
          pt={4}
          justifyContent='space-between'
          alignItems='center'
        >
          <SidebarSubtitle m={0}>
            <Trans i18nKey='process_create.census_creation'>Census Creation</Trans>
          </SidebarSubtitle>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <IconButton
                aria-label={t('process_create.census.settings', 'Census settings')}
                variant='ghost'
                size='sm'
                _hover={{ bg: 'gray.100', _dark: { bg: 'whiteAlpha.200' } }}
              >
                <Icon as={LuSettings} />
              </IconButton>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.CloseTrigger />
                  <Dialog.Header display='flex' flexDirection='column' alignItems='flex-start' gap={1}>
                    <Dialog.Title>
                      {t('process_create.census.extra_methods.modal_title', 'Extra census methods')}
                    </Dialog.Title>
                    <Text fontSize='sm' color='texts.subtle'>
                      {showExtraCensusMethods
                        ? t(
                            'process_create.census.extra_methods.disable_description',
                            'Do you want to disable extra census methods? This will hide the Spreadsheet and Web3 options and show only the Group method.'
                          )
                        : t(
                            'process_create.census.extra_methods.enable_description',
                            'Do you want to enable extra census methods? This will show additional options like Spreadsheet and Web3 census creation.'
                          )}
                    </Text>
                  </Dialog.Header>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant='ghost'>{t('common.cancel', 'Cancel')}</Button>
                    </Dialog.ActionTrigger>
                    <Dialog.ActionTrigger asChild>
                      <Button onClick={handleToggleExtraMethods}>
                        {showExtraCensusMethods ? t('common.disable', 'Disable') : t('common.enable', 'Enable')}
                      </Button>
                    </Dialog.ActionTrigger>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Flex>

        <CensusCreation showExtraMethods={showExtraCensusMethods} />
      </SidebarContents>
    </Sidebar>
  )
}
