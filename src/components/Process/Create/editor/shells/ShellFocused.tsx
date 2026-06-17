import { Box, chakra, Flex, HStack, Icon, Separator, Spacer, Text, VStack } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuCheck, LuFileText } from 'react-icons/lu'
import { LocalStorageKeys } from '~constants'
import { EditorCanvas } from '../../canvas/EditorCanvas'
import { Process } from '../../common'
import { EASE, fadeUp, popIn } from '../../VoterAuthentication/motion'
import { AutosaveIndicator } from '../AutosaveIndicator'
import { EditorActions } from '../EditorActions'
import { useEditorSections } from '../sections'
import { SettingsSection } from '../SettingsSection'
import { SURFACE } from '../surfaces'
import { ShellProps } from './ShellTwoPane'

type NavId = 'content' | 'schedule' | 'results' | 'access'

const ProgressRing = ({ value, total }: { value: number; total: number }) => {
  const r = 15
  const c = 2 * Math.PI * r
  const frac = total > 0 ? value / total : 0
  const done = value >= total
  return (
    <Box position='relative' boxSize='40px' flexShrink={0}>
      <svg width='40' height='40' viewBox='0 0 40 40'>
        <circle cx='20' cy='20' r={r} fill='none' stroke='var(--chakra-colors-table-border)' strokeWidth='3' />
        <circle
          cx='20'
          cy='20'
          r={r}
          fill='none'
          stroke='var(--chakra-colors-brand-500)'
          strokeWidth='3'
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform='rotate(-90 20 20)'
          style={{ transition: `stroke-dashoffset 0.4s ${EASE}` }}
        />
      </svg>
      <Box position='absolute' inset={0} display='flex' alignItems='center' justifyContent='center'>
        {done ? (
          <Box color='green.500' css={{ animation: `${popIn} 0.3s ${EASE} both` }} lineHeight={0}>
            <Icon as={LuCheck} boxSize={4} />
          </Box>
        ) : (
          <Text fontSize='10px' fontWeight='bold'>
            {value}/{total}
          </Text>
        )}
      </Box>
    </Box>
  )
}

const NavItem = ({
  icon,
  label,
  active,
  complete,
  partial,
  onClick,
}: {
  icon: IconType
  label: string
  active: boolean
  complete: boolean
  /** Some required fields started but not all done → amber dot instead of green. */
  partial?: boolean
  onClick: () => void
}) => (
  <chakra.button
    type='button'
    onClick={onClick}
    display='flex'
    alignItems='center'
    w='full'
    gap={3}
    px={3}
    py={2.5}
    minH='44px'
    borderRadius='lg'
    bg={active ? 'auth.bg' : 'transparent'}
    color={active ? 'texts.primary' : 'texts.subtle'}
    css={{ transition: `background-color 0.15s ${EASE}, color 0.15s ${EASE}` }}
    _hover={!active ? { bg: 'auth.bg' } : undefined}
    aria-current={active ? 'page' : undefined}
  >
    <Icon as={icon} boxSize={5} />
    <Text fontSize='sm' fontWeight={active ? 'semibold' : 'medium'} flex={1} textAlign='start'>
      {label}
    </Text>
    {complete && <Box boxSize={1.5} borderRadius='full' bg='green.500' />}
    {!complete && partial && <Box boxSize={1.5} borderRadius='full' bg='yellow.400' />}
  </chakra.button>
)

/**
 * Path C — Focused Navigator. A persistent section nav (with completion ring)
 * swaps the main area between the questions canvas and focused settings panels.
 * Everything is one click away in the nav; not a linear wizard.
 */
export const ShellFocused = ({ chrome, editorKey }: ShellProps) => {
  const { t } = useTranslation()
  const { watch } = useFormContext<Process>()
  const sections = useEditorSections()
  const [active, setActive] = useState<NavId>('content')

  // This shell has its own left nav, so the app-level dashboard sidebar is
  // redundant here — collapse it on enter and restore the admin's preference on leave.
  const [menuReduced, setMenuReduced] = useLocalStorage<boolean>(LocalStorageKeys.DashboardMenuReduced, false)
  const restoreMenuReducedRef = useRef(menuReduced)
  useEffect(() => {
    setMenuReduced(true)
    return () => setMenuReduced(restoreMenuReducedRef.current)
  }, [setMenuReduced])

  const title = watch('title')
  const questions = watch('questions')

  // A question is only "filled" when its title AND every one of its options has text.
  const questionFilled = (q: Process['questions'][number]) =>
    !!q.title?.trim() && (q.options?.length ?? 0) > 0 && q.options.every((o) => !!o.option?.trim())
  const questionStarted = (q: Process['questions'][number]) =>
    !!q.title?.trim() || (q.options?.some((o) => !!o.option?.trim()) ?? false)

  const hasTitle = !!title?.trim()
  const allQuestionsFilled = (questions?.length ?? 0) > 0 && questions.every(questionFilled)
  // Content is fully done only when the process title and every question (title + all options) are filled.
  const contentComplete = hasTitle && allQuestionsFilled
  // Content is in-progress when something has been started but not all required fields are done.
  const contentPartial = (hasTitle || (questions?.some(questionStarted) ?? false)) && !contentComplete

  const completeCount = [contentComplete, ...sections.map((s) => s.complete)].filter(Boolean).length
  const total = sections.length + 1

  const navItems: { id: NavId; icon: IconType; label: string; complete: boolean; partial?: boolean }[] = [
    {
      id: 'content',
      icon: LuFileText,
      label: t('editor.section.content', { defaultValue: 'Content' }),
      complete: contentComplete,
      partial: contentPartial,
    },
    ...sections.map((s) => ({ id: s.id as NavId, icon: s.icon, label: s.title, complete: s.complete })),
  ]

  const activeSection = sections.find((s) => s.id === active)

  const mainPanel = (
    <Box key={active} css={{ animation: `${fadeUp} 0.26s ${EASE} both` }}>
      {active === 'content' ? (
        <Box maxW='720px' mx='auto'>
          <EditorCanvas editorKey={editorKey} />
        </Box>
      ) : (
        activeSection && (
          <Box maxW='620px' mx='auto'>
            <SettingsSection icon={activeSection.icon} title={activeSection.title} subtitle={activeSection.subtitle}>
              {activeSection.render()}
            </SettingsSection>
          </Box>
        )
      )}
    </Box>
  )

  return (
    <Flex direction={{ base: 'column', md: 'row' }} minH='full' bg={SURFACE.canvas}>
      {/* Desktop left nav */}
      <VStack
        display={{ base: 'none', md: 'flex' }}
        w='260px'
        flexShrink={0}
        align='stretch'
        gap={1}
        position='sticky'
        top={0}
        alignSelf='flex-start'
        h='100vh'
        borderRightWidth='1px'
        borderColor='table.border'
        p={4}
      >
        <HStack gap={3} px={2} py={2}>
          <ProgressRing value={completeCount} total={total} />
          <VStack align='start' gap={0}>
            <Text fontWeight='semibold' fontSize='sm'>
              {t('editor.new_vote', { defaultValue: 'New vote' })}
            </Text>
            <Text fontSize='xs' color='texts.subtle'>
              {t('editor.ready_count', { defaultValue: '{{count}} of {{total}} ready', count: completeCount, total })}
            </Text>
          </VStack>
        </HStack>

        {/* Primary actions sit high — right under the tracker — so Save/Publish are obvious. */}
        <VStack align='stretch' gap={2} mt={2}>
          <EditorActions chrome={chrome} />
          <AutosaveIndicator isSaving={chrome.isSaving} isDirty={chrome.isDirty} hasDraft={!!chrome.effectiveDraftId} />
        </VStack>

        <Separator my={3} borderColor='table.border' />

        <VStack align='stretch' gap={1}>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={active === item.id}
              complete={item.complete}
              partial={item.partial}
              onClick={() => setActive(item.id)}
            />
          ))}
        </VStack>
      </VStack>

      {/* Mobile top header */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        position='sticky'
        top={0}
        zIndex='topbar'
        px={4}
        py={3}
        gap={2}
        bg='chakra.body.bg'
        borderBottomWidth='1px'
        borderColor='table.border'
      >
        <ProgressRing value={completeCount} total={total} />
        <AutosaveIndicator isSaving={chrome.isSaving} isDirty={chrome.isDirty} hasDraft={!!chrome.effectiveDraftId} />
        <Spacer />
        <EditorActions chrome={chrome} />
      </HStack>

      {/* Main */}
      <Box flex={1} minW={0} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} pb={{ base: 24, md: 8 }}>
        {mainPanel}
      </Box>

      {/* Mobile bottom tab bar */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        position='fixed'
        bottom={0}
        left={0}
        right={0}
        zIndex='topbar'
        bg='chakra.body.bg'
        borderTopWidth='1px'
        borderColor='table.border'
        px={2}
        py={1.5}
        justify='space-around'
      >
        {navItems.map((item) => (
          <chakra.button
            type='button'
            key={item.id}
            display='flex'
            flexDirection='column'
            alignItems='center'
            gap={0.5}
            px={2}
            py={1}
            flex={1}
            color={active === item.id ? 'texts.primary' : 'texts.subtle'}
            onClick={() => setActive(item.id)}
          >
            <Box position='relative'>
              <Icon as={item.icon} boxSize={5} />
              {item.complete && (
                <Box position='absolute' top='-2px' right='-4px' boxSize={1.5} borderRadius='full' bg='green.500' />
              )}
              {!item.complete && item.partial && (
                <Box position='absolute' top='-2px' right='-4px' boxSize={1.5} borderRadius='full' bg='yellow.400' />
              )}
            </Box>
            <Text fontSize='10px' fontWeight={active === item.id ? 'semibold' : 'normal'} lineClamp={1}>
              {item.label}
            </Text>
          </chakra.button>
        ))}
      </HStack>
    </Flex>
  )
}
