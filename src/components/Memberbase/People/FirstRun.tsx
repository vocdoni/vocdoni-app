import { Box, Button, Flex, Grid, Heading, Icon, List, Popover, Portal, Stack, Text } from '@chakra-ui/react'
import { type ElementType, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleHelp, LuDownload, LuFileSpreadsheet, LuLock, LuUserPlus } from 'react-icons/lu'
import { useAffectedVotes } from '~src/queries/affectedVotes'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { useDownloadTemplate } from '../Import/UploadStep'

export type FirstRunDoor = 'import' | 'add' | 'template' | 'test_vote'

export const trackDoor = (door: FirstRunDoor) =>
  trackAnalyticsEvent({ name: AnalyticsEvents.MembersEmptyStateCtaClicked, props: { door } })

type DoorProps = {
  icon: ElementType
  title: ReactNode
  description: ReactNode
  /** The door's button, and anything under it */
  children: ReactNode
}

/** One of the first-run choices. Doors share a row and stretch to the same height. */
export const Door = ({ icon, title, description, children }: DoorProps) => (
  <Flex
    direction='column'
    gap={3}
    p={5}
    borderWidth='1px'
    borderColor='border'
    borderRadius='lg'
    bg='bg'
    h='full'
    minW={0}
  >
    <Icon as={icon} boxSize={6} color='fg.muted' aria-hidden />
    <Box flex='1'>
      <Heading as='h3' fontSize='md' fontWeight='bolder' mb={1}>
        {title}
      </Heading>
      <Text fontSize='sm' color='fg.muted'>
        {description}
      </Text>
    </Box>
    <Stack gap={2} align='flex-start'>
      {children}
    </Stack>
  </Flex>
)

const WhatDataPopover = () => {
  const { t } = useTranslation()

  return (
    <Popover.Root positioning={{ placement: 'top-start' }}>
      <Popover.Trigger asChild>
        <Button variant='plain' size='sm' px={0} color='fg.muted' textDecoration='underline'>
          <Icon as={LuCircleHelp} />
          {t('members.first_run.what_data', { defaultValue: 'What data do I need?' })}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW='22rem' p={4}>
            <Stack gap={2} fontSize='sm'>
              <Text fontWeight='bolder'>
                {t('members.first_run.what_data_title', { defaultValue: 'A name and a way to reach them' })}
              </Text>
              <List.Root ps={4} gap={1}>
                <List.Item>
                  {t('members.first_run.what_data_name', {
                    defaultValue: 'A name and an email or mobile are enough: that’s where the voting code goes.',
                  })}
                </List.Item>
                <List.Item>
                  {t('members.first_run.what_data_extra', {
                    defaultValue:
                      'Add a member number, national ID or birth date only if you’ll ask people for them to sign in.',
                  })}
                </List.Item>
                <List.Item>
                  {t('members.first_run.what_data_weight', {
                    defaultValue: 'Voting power only matters if some members’ votes count more than others.',
                  })}
                </List.Item>
              </List.Root>
            </Stack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}

type FirstRunProps = {
  onImport: () => void
  onAddPeople: () => void
  /** A third door after these two. PR7 puts the guarded free test vote here. */
  extraDoor?: ReactNode
}

/** What the People tab shows before there's anyone in it: the ways to add members, side by side. */
export const FirstRun = ({ onImport, onAddPeople, extraDoor }: FirstRunProps) => {
  const { t } = useTranslation()
  const { hasActive } = useAffectedVotes()
  const downloadTemplate = useDownloadTemplate('first_run')
  const doors = extraDoor ? 3 : 2

  return (
    <Stack gap={6} as='section' aria-labelledby='members-first-run-title'>
      <Box>
        <Heading as='h2' id='members-first-run-title' fontSize='xl' fontWeight='bolder' mb={1}>
          {t('members.first_run.title', { defaultValue: 'Add your members' })}
        </Heading>
        <Text color='fg.muted'>
          {/* The free claim would be wrong while a live or scheduled vote follows Everyone: adding members grows it */}
          {!hasActive && <>{t('members.first_run.free', { defaultValue: 'Members are free and unlimited.' })} </>}
          {t('members.first_run.you_choose', { defaultValue: 'You choose who votes in each vote.' })}
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: `repeat(${doors}, minmax(0, 1fr))` }} gap={4} alignItems='stretch'>
        <Door
          icon={LuFileSpreadsheet}
          title={t('members.first_run.import_title', { defaultValue: 'Import a spreadsheet' })}
          description={t('members.first_run.import_description', {
            defaultValue: 'Use the file you already have. A name and an email or mobile are enough.',
          })}
        >
          <Button
            onClick={() => {
              trackDoor('import')
              onImport()
            }}
          >
            {t('members.first_run.import_cta', { defaultValue: 'Import a spreadsheet' })}
          </Button>
          <Button
            variant='plain'
            size='sm'
            px={0}
            color='colorPalette.fg'
            textDecoration='underline'
            onClick={() => {
              trackDoor('template')
              downloadTemplate('xlsx')
            }}
          >
            <Icon as={LuDownload} />
            {t('members.first_run.template', { defaultValue: 'Get the template' })}
          </Button>
        </Door>
        <Door
          icon={LuUserPlus}
          title={t('members.first_run.add_title', { defaultValue: 'Add people' })}
          description={t('members.first_run.add_description', {
            defaultValue: 'Type them in one by one. Good for a small group, or to try things out first.',
          })}
        >
          <Button
            variant='outline'
            onClick={() => {
              trackDoor('add')
              onAddPeople()
            }}
          >
            {t('members.first_run.add_cta', { defaultValue: 'Add people' })}
          </Button>
        </Door>
        {extraDoor}
      </Grid>

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ md: 'center' }}
        justify='space-between'
        gap={3}
        pt={2}
        borderTopWidth='1px'
        borderColor='border'
      >
        <WhatDataPopover />
        {/* TODO(legal): EU storage and the data processing agreement are claimed only once legal confirms
            the wording; see "Import wizard > Upload > Privacy strip" in the Members redesign plan. */}
        <Text fontSize='sm' color='fg.muted' display='flex' alignItems='center' gap={2}>
          <Icon as={LuLock} aria-hidden flexShrink={0} />
          {t('members.first_run.privacy', {
            defaultValue: 'Your file is read in your browser. Only the columns you keep are sent.',
          })}
        </Text>
      </Flex>
    </Stack>
  )
}
