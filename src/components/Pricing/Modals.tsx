import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Routes } from '~routes'

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalCloseButton />
        <ModalHeader p={0}>
          <Flex flexDirection='column' gap={3}>
            <Heading size='sm'>
              <Trans i18nKey={titleI18nKey}>Upgrade to add more team members</Trans>
            </Heading>
            <Box fontSize='sm' color='texts.subtle'>
              <Trans i18nKey={subtitleI18nKey} values={{ limit }}>
                Your current plan allows only {limit} for collaboration. Upgrade your plan to add more team members and
                unlock advanced features.
              </Trans>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalBody p={0}>
          <Flex justifyContent='flex-end' mt={4} gap={2}>
            <Button variant='outline' onClick={onClose}>
              <Trans i18nKey='plan_upgrade.cancel'>Cancel</Trans>
            </Button>
            <Button variant='solid' as={Link} to={Routes.dashboard.settings.subscription} onClick={onClose}>
              <Trans i18nKey='plan_upgrade.see_plans'>See Plans</Trans>
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
