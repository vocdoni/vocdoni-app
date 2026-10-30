import { Button, Flex, Text } from '@chakra-ui/react'
import { SectionHeader } from '~components/ui/SectionHeader'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DashboardBox } from '~components/Dashboard/Contents'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { Routes } from '~routes'
import { useProfile } from '~src/queries/account'
import { statusPalette } from '~theme/status'
import AccountForm from './Form'

export const AccountEdit = () => {
  const { t } = useTranslation()
  const [isOpen, setOpen] = useState(false)
  const { data: profile } = useProfile()

  return (
    <Flex flexDirection='column' gap='6'>
      <DashboardBox size='md'>
        <AccountForm profile={profile} />
      </DashboardBox>
      <DashboardBox size='md'>
        <SectionHeader
          title={t('delete.delete_title', { defaultValue: 'Delete Account' })}
          description={t('delete.delete_subtitle', {
            defaultValue: 'Permanently delete your account and all associated data',
          })}
          titleGap='4'
        />
        <Button colorPalette={statusPalette.destructive} alignSelf={'flex-end'} onClick={() => setOpen(true)}>
          <Trans i18nKey='delete_my_account'>Delete Account</Trans>
        </Button>
      </DashboardBox>
      <ConfirmDialog
        layout='compact'
        destructive={false}
        size='md'
        open={isOpen}
        onOpenChange={({ open }) => setOpen(open)}
        title={t('delete.confirm_title', { defaultValue: 'Delete Your Account' })}
        description={
          <Flex flexDirection='column' gap='2'>
            <Text textStyle='body-sm'>
              {t('delete.confirm_description', {
                defaultValue: 'To delete your account, please contact our support team.',
              })}
            </Text>
          </Flex>
        }
        cancelText={t('delete.cancel_button', { defaultValue: 'Cancel' })}
        confirmProps={{ asChild: true }}
        confirmText={
          <Link to={Routes.dashboard.settings.support}>
            <Trans i18nKey='contact_us'>Contact us</Trans>
          </Link>
        }
      />
    </Flex>
  )
}
