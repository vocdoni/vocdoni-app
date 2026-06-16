import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuBadge, LuCalendar, LuHash, LuMail, LuPhone, LuShield, LuUser } from 'react-icons/lu'
import { useMemberColumns } from '~elements/dashboard/memberbase/members'

/**
 * Icon shown for each identity credential. Keeps the credential cards and the
 * live voter preview visually consistent.
 */
export const credentialIcons: Record<string, IconType> = {
  name: LuUser,
  surname: LuUser,
  email: LuMail,
  phone: LuPhone,
  memberNumber: LuHash,
  nationalId: LuBadge,
  birthDate: LuCalendar,
}

export const getCredentialIcon = (id: string): IconType => credentialIcons[id] ?? LuShield

export type CredentialMeta = {
  id: string
  label: string
  example: string
  icon: IconType
  is2fa: boolean
}

/**
 * Returns metadata for every available credential field (label from the
 * memberbase columns, an illustrative example value, and an icon). The example
 * values are what the live preview "types in" so admins can recognise the field
 * at a glance.
 */
export const useCredentialMeta = () => {
  const { t } = useTranslation()
  const columns = useMemberColumns()

  const examples: Record<string, string> = {
    name: t('voter_auth.credential.example.name', { defaultValue: 'John' }),
    surname: t('voter_auth.credential.example.surname', { defaultValue: 'Doe' }),
    email: t('voter_auth.credential.example.email', { defaultValue: 'john.doe@example.com' }),
    phone: t('voter_auth.credential.example.phone', { defaultValue: '+1 555 0100' }),
    memberNumber: t('voter_auth.credential.example.memberNumber', { defaultValue: 'MBR-0042' }),
    nationalId: t('voter_auth.credential.example.nationalId', { defaultValue: '12345678A' }),
    birthDate: t('voter_auth.credential.example.birthDate', { defaultValue: '1985-06-15' }),
  }

  // Identity credentials only: skip the 2FA contact fields and the weight column.
  const identityCredentials: CredentialMeta[] = columns
    .filter((column) => !column.is2fa && column.id !== 'weight')
    .map((column) => ({
      id: column.id,
      label: column.label,
      example: examples[column.id] ?? column.label,
      icon: getCredentialIcon(column.id),
      is2fa: false,
    }))

  const byId = (id: string): CredentialMeta => {
    const column = columns.find((c) => c.id === id)
    return {
      id,
      label: column?.label ?? id,
      example: examples[id] ?? column?.label ?? id,
      icon: getCredentialIcon(id),
      is2fa: !!column?.is2fa,
    }
  }

  return { identityCredentials, byId }
}
