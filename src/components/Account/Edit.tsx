import { Button, Dialog, Flex, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DashboardBox } from '~components/Dashboard/Contents'
import DeleteModal from '~components/Modal/DeleteModal'
import { Routes } from '~routes'
import { useProfile } from '~src/queries/account'
import AccountForm from './Form'

export const AccountEdit = () => {
  const { t } = useTranslation()
  const [isOpen, setOpen] = useState(false)
  const { data: profile } = useProfile()

  return (
    <Flex flexDirection='column' gap={6}>
      <DashboardBox px={6} pb={6} pt={4}>
        <AccountForm profile={profile} />
      </DashboardBox>
      <DashboardBox p={6}>
        <Text size='2xl' fontWeight='600'>
          {t('delete.delete_title', { defaultValue: 'Delete Account' })}
        </Text>
        <Text fontSize='sm' color='texts.subtle'>
          {t('delete.delete_subtitle', { defaultValue: 'Permanently delete your account and all associated data' })}
        </Text>
        <Button colorPalette='red' alignSelf={'flex-end'} onClick={() => setOpen(true)}>
          <Trans i18nKey='delete_my_account'>Delete Account</Trans>
        </Button>
      </DashboardBox>
      <DeleteModal
        size='md'
        open={isOpen}
        onOpenChange={({ open }) => setOpen(open)}
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
          <Dialog.ActionTrigger asChild>
            <Button variant='outline' alignSelf='flex-end'>
              {t('delete.cancel_button', { defaultValue: 'Cancel' })}
            </Button>
          </Dialog.ActionTrigger>
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
