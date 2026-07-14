import { Icon, IconButton, Menu, type MenuContentProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { ElectionStatus, InvalidElection } from '@vocdoni/sdk'
import { ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { RiCloseCircleLine, RiPauseCircleLine, RiPlayCircleLine, RiStopCircleLine } from 'react-icons/ri'
import { ActionsProvider } from '~components/Actions'
import { useActions } from '~components/Actions/ActionsContext'
import { useAuth } from '~components/Auth/useAuth'

export const ActionsMenu = (props: MenuContentProps) => {
  const { currentAddress } = useAuth()
  const { election } = useElection()

  if (
    !election ||
    election instanceof InvalidElection ||
    election?.organizationId !== currentAddress ||
    // canceled and ended elections cannot be acted upon
    [ElectionStatus.CANCELED, ElectionStatus.ENDED, ElectionStatus.RESULTS].includes(election.status)
  ) {
    return null
  }

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        <IconButton aria-label='Actions' variant='surface' size='xs'>
          <Icon as={FaCog} />
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <ActionsProvider>
          <ActionsMenuList {...props} />
        </ActionsProvider>
      </Menu.Positioner>
    </Menu.Root>
  )
}

const ActionsMenuList = (props: MenuContentProps) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { loading, pause, resume, end, cancel, disabled } = useActions()

  if (!election || election instanceof InvalidElection) return null

  return (
    <Menu.Content p={0} {...props}>
      {election.status === ElectionStatus.PAUSED && (
        <Menu.Item
          value='resume'
          aria-label={t('process_actions.start')}
          onClick={resume}
          disabled={disabled || loading.continue}
        >
          <ActionIcon icon={RiPlayCircleLine} />
          {t('process_actions.start')}
        </Menu.Item>
      )}
      {election.status === ElectionStatus.ONGOING && (
        <Menu.Item
          value='pause'
          aria-label={t('process_actions.start')}
          onClick={pause}
          disabled={disabled || loading.pause}
        >
          <ActionIcon icon={RiPauseCircleLine} />
          {t('process_actions.pause')}
        </Menu.Item>
      )}
      <Menu.Item value='end' aria-label={t('process_actions.start')} onClick={end} disabled={disabled || loading.end}>
        <ActionIcon icon={RiStopCircleLine} />
        {t('process_actions.end')}
      </Menu.Item>
      <Menu.Separator m={1} />
      <Menu.Item
        value='cancel'
        aria-label={t('process_actions.start')}
        onClick={cancel}
        disabled={disabled || loading.cancel}
      >
        <ActionIcon icon={RiCloseCircleLine} />
        {t('process_actions.cancel')}
      </Menu.Item>
    </Menu.Content>
  )
}

const ActionIcon = ({ icon }: { icon: ElementType }) => <Icon as={icon} w={6} h={6} />
