import { useCallback, useEffect, useMemo, useState } from 'react'
import { MEMBER_FIELDS, type MemberFieldId } from '../fields'

/** The name is always shown (it opens the person), so it can't be hidden. */
export const ALWAYS_VISIBLE: readonly MemberFieldId[] = ['name', 'surname']

export const TOGGLEABLE_COLUMNS = MEMBER_FIELDS.filter((field) => !ALWAYS_VISIBLE.includes(field.id)).map(
  (field) => field.id
)

const DEFAULT_VISIBLE = MEMBER_FIELDS.filter((field) => field.defaultVisible && !ALWAYS_VISIBLE.includes(field.id)).map(
  (field) => field.id
)

export const columnsStorageKey = (orgAddress?: string) => `members-columns:${orgAddress ?? ''}`

const read = (orgAddress?: string): MemberFieldId[] => {
  if (!orgAddress) return DEFAULT_VISIBLE
  try {
    const stored = localStorage.getItem(columnsStorageKey(orgAddress))
    if (!stored) return DEFAULT_VISIBLE
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE
    return TOGGLEABLE_COLUMNS.filter((id) => parsed.includes(id))
  } catch {
    return DEFAULT_VISIBLE
  }
}

const write = (orgAddress: string | undefined, visible: MemberFieldId[]) => {
  if (!orgAddress) return
  try {
    localStorage.setItem(columnsStorageKey(orgAddress), JSON.stringify(visible))
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only
  }
}

/** Which optional columns the People table shows, remembered per organization in this browser. */
export const useColumnVisibility = (orgAddress?: string) => {
  const [visible, setVisible] = useState<MemberFieldId[]>(() => read(orgAddress))

  useEffect(() => {
    setVisible(read(orgAddress))
  }, [orgAddress])

  const setColumn = useCallback(
    (id: MemberFieldId, show: boolean) => {
      setVisible((current) => {
        const next = TOGGLEABLE_COLUMNS.filter((column) => (column === id ? show : current.includes(column)))
        write(orgAddress, next)
        return next
      })
    },
    [orgAddress]
  )

  return useMemo(
    () => ({
      visible,
      isVisible: (id: MemberFieldId) => ALWAYS_VISIBLE.includes(id) || visible.includes(id),
      setColumn,
    }),
    [visible, setColumn]
  )
}
