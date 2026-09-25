import type { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { Process } from './common'
import { useVoterAuthDialog } from './VoterAuthentication/VoterAuthDialogContext'

// A fixed id makes the toaster update the one toast on repeated publish clicks
// instead of stacking copies of it.
export const CENSUS_SETUP_TOAST_ID = 'census-setup-missing'

// The census is set up at the bottom of the settings sidebar, where its inline
// feedback is easy to miss (or off screen entirely, when the title failed too
// and took the focus). A publish blocked on it gets a toast that says what's
// missing, and a direct way into the dialog once there's a group to set it up for.
export const useCensusSetupToast = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const voterAuthDialog = useVoterAuthDialog()

  return (errors: FieldErrors<Process>) => {
    if (!errors.groupId && !errors.census) return

    if (errors.groupId) {
      toast({
        id: CENSUS_SETUP_TOAST_ID,
        title: t('process_create.census.group_missing.title', { defaultValue: 'Choose who can vote' }),
        description: t('process_create.census.group_missing.description', {
          defaultValue: 'Select a group of members and set up voter authentication, then publish again.',
        }),
        type: 'error',
        duration: 8000,
        closable: true,
      })
      return
    }

    toast({
      id: CENSUS_SETUP_TOAST_ID,
      title: t('process_create.census.auth_missing.title', { defaultValue: "Voter authentication isn't set up" }),
      description: t('process_create.census.auth_missing.description', {
        defaultValue: 'Choose how voters will identify themselves, then publish again.',
      }),
      type: 'error',
      duration: 8000,
      closable: true,
      action: {
        label: t('process_create.census.auth_missing.action', { defaultValue: 'Set it up' }),
        onClick: voterAuthDialog.onOpen,
      },
    })
  }
}
