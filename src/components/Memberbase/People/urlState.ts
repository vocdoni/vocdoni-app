import { useCallback, useMemo } from 'react'
import { generatePath, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { Routes } from '~routes'
import type { MemberSortField } from '../fields'

export const PAGE_SIZES = [25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 25
export const SORT_FIELDS: readonly MemberSortField[] = ['name', 'surname', 'email', 'memberNumber']

export type SortOrder = 'asc' | 'desc'

/** What the backend sorts by when the URL asks for nothing. */
export const DEFAULT_SORT: MemberSortField = 'name'

const isSortField = (value: string | null): value is MemberSortField =>
  !!value && (SORT_FIELDS as readonly string[]).includes(value)

/** Set in the history entry when the drawer was opened from the page, so closing it can go back. */
type MemberLocationState = { memberOpenedInApp?: boolean } | null

type ParamChanges = Record<string, string | null | undefined>

/**
 * The People tab's state, kept in the URL so it survives a reload and can be shared:
 * `/admin/memberbase/members/:page?q=&sort=&order=&size=&member=`.
 */
export const usePeopleUrlState = () => {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const page = Math.max(1, Math.floor(Number(params.page)) || 1)
  const q = searchParams.get('q') ?? ''
  const sortParam = searchParams.get('sort')
  const sort = isSortField(sortParam) ? sortParam : undefined
  const order: SortOrder = sort && searchParams.get('order') === 'desc' ? 'desc' : 'asc'
  const sizeParam = Number(searchParams.get('size'))
  const size = (PAGE_SIZES as readonly number[]).includes(sizeParam) ? sizeParam : DEFAULT_PAGE_SIZE
  const memberId = searchParams.get('member')
  const memberOpenedInApp = Boolean((location.state as MemberLocationState)?.memberOpenedInApp)

  const buildLocation = useCallback(
    (changes: { page?: number; params?: ParamChanges }) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(changes.params ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') next.delete(key)
        else next.set(key, value)
      })
      const search = next.toString()
      return {
        pathname: generatePath(Routes.dashboard.memberbase.members, { page: String(changes.page ?? page) }),
        search: search ? `?${search}` : '',
      }
    },
    [searchParams, page]
  )

  return useMemo(
    () => ({
      page,
      q,
      sort,
      /** The field the list is actually sorted by: the backend's default when the URL says nothing */
      sortedBy: sort ?? DEFAULT_SORT,
      order,
      size,
      memberId,
      /** A new search always starts on page 1. Replaces the entry: typing shouldn't fill the history */
      setQuery: (value: string) =>
        navigate(buildLocation({ page: 1, params: { q: value.trim() ? value : null } }), {
          replace: true,
          state: location.state,
        }),
      setSort: (field: MemberSortField, nextOrder: SortOrder) =>
        navigate(buildLocation({ page: 1, params: { sort: field, order: nextOrder === 'desc' ? 'desc' : null } })),
      setPage: (nextPage: number) => navigate(buildLocation({ page: nextPage })),
      setSize: (nextSize: number) =>
        navigate(
          buildLocation({ page: 1, params: { size: nextSize === DEFAULT_PAGE_SIZE ? null : String(nextSize) } })
        ),
      /** Where a member's name links to: this view with their drawer open */
      memberLocation: (id: string) => buildLocation({ params: { member: id } }),
      openMember: (id: string) => {
        // Stepping from one open member to the next replaces the entry, so closing still goes back once
        if (memberId) {
          navigate(buildLocation({ params: { member: id } }), { replace: true, state: location.state })
          return
        }
        navigate(buildLocation({ params: { member: id } }), { state: { memberOpenedInApp: true } })
      },
      closeMember: () => {
        if (memberOpenedInApp) {
          navigate(-1)
          return
        }
        navigate(buildLocation({ params: { member: null } }), { replace: true })
      },
    }),
    [page, q, sort, order, size, memberId, memberOpenedInApp, buildLocation, navigate, location.state]
  )
}

export type PeopleUrlState = ReturnType<typeof usePeopleUrlState>
