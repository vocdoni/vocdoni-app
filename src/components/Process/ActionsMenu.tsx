import {
  Icon,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  type MenuContentProps,
} from '@chakra-ui/react'
import { useActions, useClient, useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection } from '@vocdoni/sdk'
import { ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCog } from 'react-icons/fa'
import { RiCloseCircleLine, RiPauseCircleLine, RiPlayCircleLine, RiStopCircleLine } from 'react-icons/ri'
import { ActionsProvider } from '~components/vocdoni-ui'

export const ActionsMenu = (props: MenuContentProps) => {
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
    <MenuRoot closeOnSelect={false}>
      <MenuTrigger asChild>
        <IconButton aria-label='Actions'>
          <FaCog />
        </IconButton>
      </MenuTrigger>
      <MenuPositioner>
        <ActionsProvider>
          <ActionsMenuList {...props} />
        </ActionsProvider>
      </MenuPositioner>
    </MenuRoot>
  )
}

const ActionsMenuList = (props: MenuContentProps) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { loading, pause, resume, end, cancel, disabled } = useActions()

  if (!election || election instanceof InvalidElection) return null

  return (
    <MenuContent p={0} {...props}>
      {election.status === ElectionStatus.PAUSED && (
        <MenuItem
          value='resume'
          aria-label={t('process_actions.start')}
          onClick={resume}
          disabled={disabled || loading.continue}
        >
          <ActionIcon icon={RiPlayCircleLine} />
          {t('process_actions.start')}
        </MenuItem>
      )}
      {election.status === ElectionStatus.ONGOING && (
        <MenuItem
          value='pause'
          aria-label={t('process_actions.start')}
          onClick={pause}
          disabled={disabled || loading.pause}
        >
          <ActionIcon icon={RiPauseCircleLine} />
          {t('process_actions.pause')}
        </MenuItem>
      )}
      <MenuItem value='end' aria-label={t('process_actions.start')} onClick={end} disabled={disabled || loading.end}>
        <ActionIcon icon={RiStopCircleLine} />
        {t('process_actions.end')}
      </MenuItem>
      <MenuSeparator m={1} />
      <MenuItem
        value='cancel'
        aria-label={t('process_actions.start')}
        onClick={cancel}
        disabled={disabled || loading.cancel}
      >
        <ActionIcon icon={RiCloseCircleLine} />
        {t('process_actions.cancel')}
      </MenuItem>
    </MenuContent>
  )
}

const ActionIcon = ({ icon }: { icon: ElementType }) => <Icon as={icon} w={6} h={6} />
