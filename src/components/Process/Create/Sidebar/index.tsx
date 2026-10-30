import { Flex, Icon } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { CloseIcon } from '~theme/icons'
import { Sidebar, SidebarContents, SidebarSubtitle } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import { useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import { BasicConfig } from './BasicConfig'
import CensusCreation, { CensusStatusBadge } from './CensusCreation'
import { ExtraConfig } from './ExtraConfig'
import { CloseButton } from '~components/ui/CloseButton'
import { useIsMobile } from '~components/ui/useIsMobile'

export const CreateSidebar = () => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const { showSidebar, closeSidebar } = useSidebarVisibility()

  return (
    <Sidebar show={showSidebar}>
      <SidebarContents borderBottom='sm' borderColor='border'>
        <SectionHeader title={<Trans i18nKey='process_create.settings'>Settings</Trans>} pt='4' />
        {isMobile && (
          /* data-testid: same reason as the toggle in Create/index.tsx. The open
             drawer covers the Publish button, so the suite must close it. */
          <CloseButton
            data-testid='wizard-settings-close'
            aria-label={t('drawer.close', { defaultValue: 'Close drawer' })}
            size='sm'
            position='absolute'
            top='2'
            right='2'
            onClick={closeSidebar}
          >
            <Icon as={CloseIcon} />
          </CloseButton>
        )}
      </SidebarContents>

      {/* Bottom room for the floating support chat launcher (bottom-right, over
          this panel), so it never covers the last settings. */}
      <SidebarContents flex='1' overflowY='auto' pb='24'>
        <SidebarSubtitle>
          <Trans i18nKey='process_create.basic_configuration'>Basic Configuration</Trans>
        </SidebarSubtitle>
        <BasicConfig />

        <SidebarSubtitle borderTop='sm' borderColor='border' mt='4'>
          <Trans i18nKey='process_create.extra_configuration'>Extra Configuration</Trans>
        </SidebarSubtitle>
        <ExtraConfig />

        <Flex borderTop='sm' borderColor='border' mt='4' pt='4' justify='space-between' align='center'>
          <SidebarSubtitle m='[0]'>
            <Trans i18nKey='process_create.census_creation'>Census Creation</Trans>
          </SidebarSubtitle>
          <CensusStatusBadge />
        </Flex>

        <CensusCreation />
      </SidebarContents>
    </Sidebar>
  )
}
