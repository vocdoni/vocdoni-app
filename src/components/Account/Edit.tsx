import { Button, Flex, Text, useDisclosure } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DeleteModal from '~components/shared/Modal/DeleteModal'
import { Routes } from '~routes'
import { DashboardBox } from '~shared/Dashboard/Contents'
import { useProfile } from '~src/queries/account'
import AccountForm from './Form'

export const AccountEdit = () => {
  const { t } = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const { data: profile } = useProfile()

  return (
    <Flex flexDirection='column' gap={6}>
      <DashboardBox px={6} pb={6} pt={4}>
        <AccountForm profile={profile} />
      </DashboardBox>
      <DashboardBox p={6}>
        <Text fontSize='2xl' fontWeight='600'>
          {t('delete.delete_title', { defaultValue: 'Delete Account' })}
        </Text>
        <Text fontSize='sm' color='texts.subtle'>
          {t('delete.delete_subtitle', { defaultValue: 'Permanently delete your account and all associated data' })}
        </Text>
        <Button colorScheme='red' alignSelf={'flex-start'} onClick={onOpen}>
          <Trans i18nKey='delete_my_account'>Delete Account</Trans>
        </Button>
      </DashboardBox>
      <DeleteModal
        size='md'
        isOpen={isOpen}
        onClose={onClose}
        title={t('delete.confirm_title', { defaultValue: 'Delete Your Account' })}
        subtitle={
          <Flex flexDirection='column' gap={2}>
            <Text fontSize='sm'>
              {t('delete.confirm_description', {
                defaultValue: 'To delete your account, please contact our support team.',
              })}
            </Text>
          </Flex>
        }
      >
        <Flex justifyContent='flex-end' gap={3}>
          <Button variant='outline' alignSelf='flex-end' onClick={onClose}>
            {t('delete.cancel_button', { defaultValue: 'Cancel' })}
          </Button>
          <Button asChild>
            <Link to={Routes.dashboard.settings.support}>
              <Trans i18nKey='contact_us'>Contact us</Trans>
            </Link>
          </Button>
        </Flex>
      </DeleteModal>
    </Flex>
  )
}
