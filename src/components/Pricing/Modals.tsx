import { Box, Button, CloseButton, Dialog } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Routes } from '~routes'

type ModalProps = {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
  onClose: () => void
}

type PlanUpgradeContext = 'collaboration' | 'memberbase' | 'generic'

export type PlanUpgradeData = {
  limit: string
  context?: PlanUpgradeContext
  titleKey?: string
  subtitleKey?: string
}

export const PlanUpgradeModal = ({ open, onOpenChange, onClose, ...props }: ModalProps & PlanUpgradeData) => {
  const { t } = useTranslation()
  const { limit, context = 'collaboration', titleKey, subtitleKey } = props

  const titleI18nKey =
    titleKey ??
    (context === 'memberbase'
      ? 'plan_upgrade.memberbase_title'
      : context === 'generic'
        ? 'plan_upgrade.generic_title'
        : 'plan_upgrade.title')

  const subtitleI18nKey =
    subtitleKey ??
    (context === 'memberbase'
      ? 'plan_upgrade.memberbase_subtitle'
      : context === 'generic'
        ? 'plan_upgrade.generic_subtitle'
        : 'plan_upgrade.subtitle')

  const titleDefault =
    context === 'memberbase'
      ? t('plan_upgrade.memberbase_title', 'Upgrade to add more members')
      : context === 'generic'
        ? t('plan_upgrade.generic_title', 'Upgrade your plan')
        : t('plan_upgrade.title', 'Upgrade to add more team members')

  const subtitleDefault =
    context === 'memberbase'
      ? t(
          'plan_upgrade.memberbase_subtitle',
          'Your current plan allows only {{limit}} members. Upgrade to increase the limit and unlock advanced features.',
          { limit }
        )
      : context === 'generic'
        ? t(
            'plan_upgrade.generic_subtitle',
            'You reached a plan limit ({{limit}}). Upgrade to unlock more capacity and advanced features.',
            { limit }
          )
        : t(
            'plan_upgrade.subtitle',
            'Your current plan allows only {{limit}} for collaboration. Upgrade your plan to add more team members and unlock advanced features.',
            { limit }
          )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} placement='center'>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>
          <Dialog.Header display='flex' flexDirection='column' alignItems='flex-start' gap={1}>
            <Dialog.Title>
              <Trans i18nKey={titleI18nKey} defaults={titleDefault} />
            </Dialog.Title>
            <Box fontSize='sm' color='texts.subtle'>
              <Trans i18nKey={subtitleI18nKey} defaults={subtitleDefault} values={{ limit }} />
            </Box>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant='outline' onClick={onClose}>
              <Trans i18nKey='plan_upgrade.cancel' defaults={t('plan_upgrade.cancel', 'Cancel')} />
            </Button>
            <Button variant='solid' asChild onClick={onClose}>
              <Link to={Routes.dashboard.settings.subscription}>
                <Trans i18nKey='plan_upgrade.see_plans'>See Plans</Trans>
              </Link>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
