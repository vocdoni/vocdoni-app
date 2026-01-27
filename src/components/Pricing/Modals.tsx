import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Routes } from '~routes'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '~shared/Modal/Modal'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
}

type PlanUpgradeContext = 'collaboration' | 'memberbase' | 'generic'

export type PlanUpgradeData = {
  limit: string
  context?: PlanUpgradeContext
  titleKey?: string
  subtitleKey?: string
}

export const PlanUpgradeModal = ({ isOpen, onClose, ...props }: ModalProps & PlanUpgradeData) => {
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
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalCloseButton />
        <ModalHeader p={0}>
          <Flex flexDirection='column' gap={3}>
            <Heading size='sm'>
              <Trans i18nKey={titleI18nKey} defaults={titleDefault} />
            </Heading>

            <Box fontSize='sm' color='texts.subtle'>
              <Trans i18nKey={subtitleI18nKey} defaults={subtitleDefault} values={{ limit }} />
            </Box>
          </Flex>
        </ModalHeader>

        <ModalBody p={0}>
          <Flex justifyContent='flex-end' mt={4} gap={2}>
            <Button variant='outline' onClick={onClose}>
              <Trans i18nKey='plan_upgrade.cancel' defaults={t('plan_upgrade.cancel', 'Cancel')} />
            </Button>
            <Button variant='solid' asChild onClick={onClose}>
              <Link to={Routes.dashboard.settings.subscription}>
                <Trans i18nKey='plan_upgrade.see_plans'>See Plans</Trans>
              </Link>
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
