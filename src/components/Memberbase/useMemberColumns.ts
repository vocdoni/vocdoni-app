import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useMemberColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        label: t('members.fields.firstname', { defaultValue: 'First Name' }),
        id: 'name',
      },
      {
        label: t('members.fields.surname', { defaultValue: 'Last Name' }),
        id: 'surname',
      },
      {
        label: t('members.fields.email', { defaultValue: 'Email' }),
        is2fa: true,
        id: 'email',
      },
      {
        label: t('members.fields.phone', { defaultValue: 'Phone' }),
        is2fa: true,
        id: 'phone',
      },
      {
        label: t('members.fields.member_number', { defaultValue: 'Member Number' }),
        id: 'memberNumber',
      },
      {
        label: t('members.fields.national_id', { defaultValue: 'National ID' }),
        id: 'nationalId',
        visible: false,
      },
      {
        label: t('members.fields.birth_date', { defaultValue: 'Birth Date' }),
        id: 'birthDate',
        visible: false,
      },
      {
        label: t('members.fields.weight', { defaultValue: 'Voting power (Weight)' }),
        id: 'weight',
        visible: true,
      },
    ],
    [t]
  )
}
