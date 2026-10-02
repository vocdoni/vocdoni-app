import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Member } from '~src/queries/members'

export type SelectedMember = Member & { id: string }

export type PageSelectionState = {
  /** How many of the page's rows are selected */
  selected: number
  all: boolean
  some: boolean
}

/**
 * `ids`: the members picked one by one (or collected), kept in `members`. `all`: everyone in the
 * organization, without their ids ("Select all" with no search). Actions then take server paths
 * (`includeAllMembers`, delete all) or collect the ids themselves.
 */
export type SelectionScope = 'ids' | 'all'

export type Selection = {
  scope: SelectionScope
  /** Selected ids, in the order they were picked. Empty meaning "everyone" when `scope` is `all` */
  ids: string[]
  /** How many are selected: the picked ids, or the organization's total when `scope` is `all` */
  count: number
  /** The selected members as last seen, for names in confirmations. Keyed like `ids` */
  members: SelectedMember[]
  isSelected: (id: string) => boolean
  /**
   * Selects or clears one member. With `range` (the rows on screen) and `shiftKey`, it applies the
   * same state to every row between the last one toggled and this one.
   */
  toggle: (member: SelectedMember, checked: boolean, options?: { shiftKey?: boolean; range?: SelectedMember[] }) => void
  /** Selects or clears every given member (the page's header checkbox, a pasted list) */
  setMany: (members: SelectedMember[], checked: boolean) => void
  /** Selects everyone in the organization (`total` of them) without loading their ids */
  selectEveryone: (total: number) => void
  clear: () => void
  pageState: (pageIds: string[]) => PageSelectionState
}

type UseSelectionOptions = {
  /** The selection clears when this changes (the organization). Search, sort and paging keep it */
  resetKey?: string
}

/** The members picked in the People list, as an ordered id set plus the data seen for each. */
export const useSelection = ({ resetKey }: UseSelectionOptions = {}): Selection => {
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())
  // `everyone` holds the total while "everyone" is selected
  const [everyone, setEveryone] = useState<number | null>(null)
  const anchor = useRef<string | null>(null)
  const lastResetKey = useRef(resetKey)

  const clear = useCallback(() => {
    anchor.current = null
    setEveryone(null)
    setSelected((current) => (current.size ? new Map() : current))
  }, [])

  useEffect(() => {
    if (lastResetKey.current === resetKey) return
    lastResetKey.current = resetKey
    clear()
  }, [resetKey, clear])

  const apply = useCallback((members: SelectedMember[], checked: boolean) => {
    // Unticking someone while "everyone" is selected goes back to the people picked before it
    if (!checked) setEveryone(null)
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

  const selectEveryone = useCallback((total: number) => setEveryone(Math.max(0, total)), [])

  return useMemo(() => {
    const all = everyone !== null
    const ids = all ? [] : [...selected.keys()]
    return {
      scope: all ? 'all' : 'ids',
      ids,
      count: all ? everyone : ids.length,
      members: all ? [] : [...selected.values()],
      isSelected: (id: string) => all || selected.has(id),
      toggle,
      setMany: apply,
      selectEveryone,
      clear,
      pageState: (pageIds: string[]) => {
        const count = all ? pageIds.length : pageIds.filter((id) => selected.has(id)).length
        return { selected: count, all: pageIds.length > 0 && count === pageIds.length, some: count > 0 }
      },
    }
  }, [selected, everyone, toggle, apply, selectEveryone, clear])
}
