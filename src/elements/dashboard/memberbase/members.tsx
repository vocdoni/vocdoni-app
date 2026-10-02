import { RoutedPaginationProvider } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { MemberbaseTabsContext } from '~components/Memberbase'
import { useMemberFields } from '~components/Memberbase/fields'
import MembersTable from '~components/Memberbase/Members'
import { TableProvider } from '~components/Memberbase/TableProvider'
import { Routes } from '~routes'
import { usePaginatedMembers } from '~src/queries/members'

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

const Members = () => {
  const { t } = useTranslation()
  const columns = useMemberColumns()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()
  const { data, isLoading, isFetching, error } = usePaginatedMembers({ search: debouncedSearch })

  const members = data?.members || []
  const pagination = data?.pagination || {
    totalItems: 0,
    currentPage: 0,
    lastPage: 0,
    previousPage: null,
    nextPage: null,
  }
  const isLoadingOrFetching = isLoading || isFetching
  const hasError = !!error && !isLoadingOrFetching
  const isEmpty = members.length === 0 && !isLoadingOrFetching && !hasError
  const hasSearch = Boolean(debouncedSearch)
  const showAlert = hasError || isEmpty
  const alertStatus = hasError ? 'error' : 'info'
  const alertTitle = hasError
    ? t('members.list.error', { defaultValue: 'Unable to load members' })
    : hasSearch
      ? t('members.list.no_search_results', { defaultValue: 'No members match your search' })
      : t('members.list.empty', { defaultValue: 'No members found' })
  const alertDescription = hasError
    ? error?.message?.toString()
    : hasSearch
      ? t('members.list.no_search_results_description', {
          defaultValue: 'Try adjusting your search terms.',
        })
      : t('members.list.empty_description', {
          defaultValue: 'Add your first member to get started.',
        })

  return (
    <TableProvider data={members} initialColumns={columns} isLoading={isLoading} isFetching={isFetching} error={error}>
      <RoutedPaginationProvider path={Routes.dashboard.memberbase.members} pagination={pagination}>
        {showAlert && <ListStateAlert show status={alertStatus} title={alertTitle} description={alertDescription} />}
        <MembersTable />
      </RoutedPaginationProvider>
    </TableProvider>
  )
}

export default Members
