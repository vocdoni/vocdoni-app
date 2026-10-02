import { useMemo } from 'react'
import { useMemberFields } from '~components/Memberbase/fields'
import { People } from '~components/Memberbase/People'

/**
 * The member fields as table columns (`{ id, label, is2fa?, visible? }`). Kept for the screens
 * that predate `useMemberFields`.
 */
export const useMemberColumns = () => {
  const fields = useMemberFields()

  return useMemo(
    () =>
      fields.map((field) => ({
        id: field.id,
        label: field.label,
        is2fa: field.is2fa,
        visible: field.defaultVisible,
      })),
    [fields]
  )
}

const Members = () => <People />

export default Members
