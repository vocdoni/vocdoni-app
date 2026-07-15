import { Flex, Icon, IconButton, useBreakpointValue } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'
import { Sidebar, SidebarContents, SidebarSubtitle, SidebarTitle } from '~components/Dashboard/Contents'
import { useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import { BasicConfig } from './BasicConfig'
import CensusCreation from './CensusCreation'
import { ExtraConfig } from './ExtraConfig'

export const CreateSidebar = () => {
  const { t } = useTranslation()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { showSidebar, closeSidebar } = useSidebarVisibility()

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

        <Flex borderTop='1px solid' borderColor='table.border' mt={4} pt={4}>
          <SidebarSubtitle m={0}>
            <Trans i18nKey='process_create.census_creation'>Census Creation</Trans>
          </SidebarSubtitle>
        </Flex>

        <CensusCreation />
      </SidebarContents>
    </Sidebar>
  )
}
