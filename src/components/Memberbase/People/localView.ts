import { useEffect, useMemo, useState } from 'react'
import type { MemberSortField } from '../fields'
import type { SortOrder } from './urlState'
import type { SelectedMember } from './useSelection'

/** Sorts members on the client the way the server would: by one field, then by name. */
export const sortMembersLocally = (members: SelectedMember[], field: MemberSortField, order: SortOrder) => {
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })
  const sorted = [...members].sort(
    (a, b) =>
      collator.compare(a[field] ?? '', b[field] ?? '') ||
      collator.compare(a.name ?? '', b.name ?? '') ||
      collator.compare(a.surname ?? '', b.surname ?? '')
  )
  return order === 'desc' ? sorted.reverse() : sorted
}

type LocalRowsOptions = {
  sortedBy: MemberSortField
  order: SortOrder
  size: number
  /** Back to page 1 when this changes (switching views) */
  resetKey?: string
}

/**
 * Pages members already in memory (the selected ones, the people who need attention), sorted like
 * the server list. The page stays in component state, not the URL, which keeps the server list's.
 */
export const useLocalRows = (members: SelectedMember[], { sortedBy, order, size, resetKey }: LocalRowsOptions) => {
  const [page, setPage] = useState(1)
  const sorted = useMemo(() => sortMembersLocally(members, sortedBy, order), [members, sortedBy, order])
  const lastPage = Math.max(1, Math.ceil(sorted.length / size))

  useEffect(() => setPage(1), [resetKey, sortedBy, order, size])
  // Unticking the last rows of the last page: step back to a page that still has some
  useEffect(() => {
    if (page > lastPage) setPage(lastPage)
  }, [page, lastPage])

  const current = Math.min(page, lastPage)
  return {
    rows: sorted.slice((current - 1) * size, current * size),
    page: current,
    lastPage,
    total: sorted.length,
    setPage,
  }
}
