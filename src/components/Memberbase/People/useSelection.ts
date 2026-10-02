import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Member } from '~src/queries/members'

export type SelectedMember = Member & { id: string }

export type PageSelectionState = {
  /** How many of the page's rows are selected */
  selected: number
  all: boolean
  some: boolean
}

export type Selection = {
  /** Selected ids, in the order they were picked */
  ids: string[]
  count: number
  /** The selected members as last seen, for names in confirmations. Keyed like `ids` */
  members: SelectedMember[]
  isSelected: (id: string) => boolean
  /**
   * Selects or clears one member. With `range` (the rows on screen) and `shiftKey`, it applies the
   * same state to every row between the last one toggled and this one.
   */
  toggle: (member: SelectedMember, checked: boolean, options?: { shiftKey?: boolean; range?: SelectedMember[] }) => void
  /** Selects or clears every given member (the page's header checkbox) */
  setMany: (members: SelectedMember[], checked: boolean) => void
  clear: () => void
  pageState: (pageIds: string[]) => PageSelectionState
}

type UseSelectionOptions = {
  /**
   * The selection clears when this changes. PR1 passes the page/search signature so a selection
   * never outlives the rows it was made on; a persistent selection just stops passing it.
   */
  resetKey?: string
}

/** The members picked in the People list, as an ordered id set plus the data seen for each. */
export const useSelection = ({ resetKey }: UseSelectionOptions = {}): Selection => {
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())
  const anchor = useRef<string | null>(null)
  const lastResetKey = useRef(resetKey)

  useEffect(() => {
    if (lastResetKey.current === resetKey) return
    lastResetKey.current = resetKey
    anchor.current = null
    setSelected((current) => (current.size ? new Map() : current))
  }, [resetKey])

  const apply = useCallback((members: SelectedMember[], checked: boolean) => {
    setSelected((current) => {
      const next = new Map(current)
      members.forEach((member) => {
        if (checked) next.set(member.id, member)
        else next.delete(member.id)
      })
      return next
    })
  }, [])

  const toggle = useCallback<Selection['toggle']>(
    (member, checked, options) => {
      const range = options?.range
      const from = anchor.current
      if (options?.shiftKey && range && from && from !== member.id) {
        const start = range.findIndex((row) => row.id === from)
        const end = range.findIndex((row) => row.id === member.id)
        if (start !== -1 && end !== -1) {
          apply(range.slice(Math.min(start, end), Math.max(start, end) + 1), checked)
          anchor.current = member.id
          return
        }
      }
      anchor.current = member.id
      apply([member], checked)
    },
    [apply]
  )

  const clear = useCallback(() => {
    anchor.current = null
    setSelected((current) => (current.size ? new Map() : current))
  }, [])

  return useMemo(() => {
    const ids = [...selected.keys()]
    return {
      ids,
      count: ids.length,
      members: [...selected.values()],
      isSelected: (id: string) => selected.has(id),
      toggle,
      setMany: apply,
      clear,
      pageState: (pageIds: string[]) => {
        const count = pageIds.filter((id) => selected.has(id)).length
        return { selected: count, all: pageIds.length > 0 && count === pageIds.length, some: count > 0 }
      },
    }
  }, [selected, toggle, apply, clear])
}
