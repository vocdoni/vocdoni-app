import { Icon, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList, MenuListProps } from '@chakra-ui/react'
import { ActionCancel, ActionContinue, ActionEnd, ActionPause, ActionsProvider } from '~components/vocdoni-ui'
import { useActions, useClient, useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection } from '@vocdoni/sdk'
import { ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { RiCloseCircleLine, RiPauseCircleLine, RiPlayCircleLine, RiStopCircleLine } from 'react-icons/ri'

export const ActionsMenu = (props: MenuListProps) => {
  const { account } = useClient()
  const { election } = useElection()

  if (
    !election ||
    election instanceof InvalidElection ||
    election?.organizationId !== account?.address ||
    // canceled and ended elections cannot be acted upon
    [ElectionStatus.CANCELED, ElectionStatus.ENDED, ElectionStatus.RESULTS].includes(election.status)
  ) {
    return null
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={IconButton} aria-label='Actions' icon={<FaCog />} variant='transparent' />
      <ActionsProvider>
        <ActionsMenuList {...props} />
      </ActionsProvider>
    </Menu>
  )
}

const ActionsMenuList = (props: MenuListProps) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { loading } = useActions()

  if (!election || election instanceof InvalidElection) return null

  return (
    <MenuList p={0}>
      {election.status === ElectionStatus.PAUSED && (
        <ActionContinue
          as={MenuItem}
          aria-label={t('process_actions.start')}
          icon={loading.continue ? undefined : <ActionIcon icon={RiPlayCircleLine} />}
          justifyContent='start'
          variant=''
          sx={{
            '& span': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {t('process_actions.start')}
        </ActionContinue>
      )}
      {election.status === ElectionStatus.ONGOING && (
        <ActionPause
          as={MenuItem}
          aria-label={t('process_actions.start')}
          icon={loading.pause ? undefined : <ActionIcon icon={RiPauseCircleLine} />}
          justifyContent='start'
          variant=''
          sx={{
            '& span': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {t('process_actions.pause')}
        </ActionPause>
      )}
      <ActionEnd
        as={MenuItem}
        aria-label={t('process_actions.start')}
        icon={loading.end ? undefined : <ActionIcon icon={RiStopCircleLine} />}
        justifyContent='start'
        variant=''
        sx={{
          '& span': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {t('process_actions.end')}
      </ActionEnd>
      <MenuDivider m={1} />
      <ActionCancel
        as={MenuItem}
        aria-label={t('process_actions.start')}
        icon={loading.cancel ? undefined : <ActionIcon icon={RiCloseCircleLine} />}
        justifyContent='start'
        variant=''
        sx={{
          '& span': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {t('process_actions.cancel')}
      </ActionCancel>
    </MenuList>
  )
}

const ActionIcon = ({ icon }: { icon: ElementType }) => <Icon as={icon} w={6} h={6} />
