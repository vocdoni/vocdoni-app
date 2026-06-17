import {
  Box,
  Drawer,
  Flex,
  HStack,
  Icon,
  IconButton,
  Portal,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { LuSettings2, LuX } from 'react-icons/lu'
import { EditorCanvas } from '../../canvas/EditorCanvas'
import { AutosaveIndicator } from '../AutosaveIndicator'
import { EditorActions } from '../EditorActions'
import { useEditorSections } from '../sections'
import { SettingsSection } from '../SettingsSection'
import { SURFACE } from '../surfaces'
import { EditorChrome } from '../types'

export type ShellProps = {
  chrome: EditorChrome
  editorKey: string
}

const SettingsRail = () => {
  const { t } = useTranslation()
  const sections = useEditorSections()
  return (
    <VStack align='stretch' gap={4}>
      <Text fontSize='xs' fontWeight='semibold' textTransform='uppercase' letterSpacing='wider' color='texts.subtle'>
        {t('editor.setup', { defaultValue: 'Setup' })}
      </Text>
      {sections.map((s) => (
        <SettingsSection key={s.id} icon={s.icon} title={s.title} summary={s.summary}>
          {s.render()}
        </SettingsSection>
      ))}
    </VStack>
  )
}

/**
 * Path A — Two-pane Studio. Canvas in a readable column with a persistent right
 * settings rail (desktop) that collapses to a bottom sheet on mobile.
 */
export const ShellTwoPane = ({ chrome, editorKey }: ShellProps) => {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <Flex direction='column' minH='full' bg={SURFACE.canvas}>
      {/* Toolbar */}
      <HStack
        position='sticky'
        top={0}
        zIndex='contents'
        px={{ base: 4, md: 6 }}
        py={3}
        gap={3}
        bg='chakra.body.bg'
        borderBottomWidth='1px'
        borderColor='table.border'
        css={{ backdropFilter: 'saturate(180%) blur(8px)' }}
      >
        <Text fontWeight='semibold' fontSize='sm'>
          {t('editor.new_vote', { defaultValue: 'New vote' })}
        </Text>
        {chrome.effectiveDraftId && (
          <Box px={2.5} py={0.5} borderRadius='full' bg='auth.bg' fontSize='xs' color='texts.subtle'>
            <Trans i18nKey='process.create.status.draft'>Draft</Trans>
          </Box>
        )}
        <AutosaveIndicator isSaving={chrome.isSaving} isDirty={chrome.isDirty} hasDraft={!!chrome.effectiveDraftId} />
        <Spacer />
        <IconButton
          display={{ base: 'inline-flex', md: 'none' }}
          size='sm'
          variant='outline'
          aria-label={t('editor.open_setup', { defaultValue: 'Open setup' })}
          onClick={onOpen}
        >
          <Icon as={LuSettings2} />
        </IconButton>
        <EditorActions chrome={chrome} />
      </HStack>

      {/* Body */}
      <Flex flex={1} align='start'>
        <Box flex={1} minW={0} px={{ base: 4, md: 6 }} py={6}>
          <Box maxW='720px' mx='auto'>
            <EditorCanvas editorKey={editorKey} />
          </Box>
        </Box>
        <Box
          display={{ base: 'none', md: 'block' }}
          w='sidebar'
          flexShrink={0}
          position='sticky'
          top='61px'
          alignSelf='flex-start'
          maxH='calc(100vh - 61px)'
          overflowY='auto'
          borderLeftWidth='1px'
          borderColor='table.border'
          p={5}
        >
          <SettingsRail />
        </Box>
      </Flex>

      {/* Mobile settings sheet */}
      <Drawer.Root open={open} onOpenChange={({ open }) => (!open ? onClose() : undefined)} placement='bottom'>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content borderTopRadius='2xl' maxH='85vh'>
              <Drawer.Header display='flex' alignItems='center' justifyContent='space-between'>
                <Drawer.Title>{t('editor.setup', { defaultValue: 'Setup' })}</Drawer.Title>
                <IconButton
                  size='sm'
                  variant='ghost'
                  aria-label={t('drawer.close', { defaultValue: 'Close' })}
                  onClick={onClose}
                >
                  <Icon as={LuX} />
                </IconButton>
              </Drawer.Header>
              <Drawer.Body pb={6}>
                <SettingsRail />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  )
}
